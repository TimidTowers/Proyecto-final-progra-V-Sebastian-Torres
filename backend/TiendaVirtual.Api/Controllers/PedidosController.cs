using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;
using TiendaVirtual.Api.Services;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// Gestión de pedidos. Al crear un pedido:
/// - Se valida stock (salvo si es proforma).
/// - Se calcula subtotal, cupón, costo de envío e IVA 13%.
/// - Se actualizan stock + popularidad + movimientos de inventario.
/// - Se genera una factura electrónica consecutiva (si no es proforma).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FacturacionService _facturacion;

    public PedidosController(AppDbContext db, FacturacionService facturacion)
    {
        _db = db;
        _facturacion = facturacion;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentUserRole => User.FindFirstValue(ClaimTypes.Role) ?? "Cliente";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PedidoV2Dto>>> GetMios()
    {
        var query = _db.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .Include(p => p.Cupon)
            .Include(p => p.Factura)
            .AsQueryable();

        if (CurrentUserRole != "Administrador")
            query = query.Where(p => p.UsuarioId == CurrentUserId);

        var pedidos = await query.OrderByDescending(p => p.Fecha).ToListAsync();
        return pedidos.Select(Map).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PedidoV2Dto>> GetById(int id)
    {
        var p = await _db.Pedidos
            .Include(x => x.Detalles).ThenInclude(d => d.Producto)
            .Include(x => x.Cupon)
            .Include(x => x.Factura)
            .FirstOrDefaultAsync(x => x.PedidoId == id);

        if (p is null) return NotFound();
        if (CurrentUserRole != "Administrador" && p.UsuarioId != CurrentUserId) return Forbid();
        return Map(p);
    }

    [HttpPost]
    public async Task<ActionResult<PedidoV2Dto>> Crear([FromBody] PedidoCrearV2Dto dto)
    {
        if (dto.Items is null || dto.Items.Count == 0)
            return BadRequest(new { message = "El pedido debe tener al menos un producto." });

        // --------------------------------------------------------
        // Calcular subtotal y validar stock
        // --------------------------------------------------------
        decimal subtotal = 0;
        var detalles = new List<PedidoDetalle>();
        var productosAfectados = new List<(Producto producto, int cantidad, int stockAnterior)>();
        var productoIds = new List<int>();

        foreach (var item in dto.Items)
        {
            var producto = await _db.Productos.FindAsync(item.ProductoId);
            if (producto is null || !producto.Activo)
                return BadRequest(new { message = $"Producto {item.ProductoId} no existe." });
            if (!dto.EsProforma && producto.Stock < item.Cantidad)
                return BadRequest(new { message = $"Stock insuficiente para {producto.Nombre}." });

            var lineSubtotal = producto.Precio * item.Cantidad;
            subtotal += lineSubtotal;

            detalles.Add(new PedidoDetalle
            {
                ProductoId = producto.ProductoId,
                Cantidad = item.Cantidad,
                PrecioUnitario = producto.Precio,
                Subtotal = lineSubtotal
            });

            productosAfectados.Add((producto, item.Cantidad, producto.Stock));
            productoIds.Add(producto.ProductoId);
        }

        // --------------------------------------------------------
        // Aplicar cupón (opcional)
        // --------------------------------------------------------
        decimal descuento = 0;
        Cupon? cupon = null;
        if (!string.IsNullOrWhiteSpace(dto.CodigoCupon))
        {
            var codigo = dto.CodigoCupon.Trim().ToUpperInvariant();
            cupon = await _db.Cupones.FirstOrDefaultAsync(c => c.Codigo == codigo);
            if (cupon is null)
                return BadRequest(new { message = "Cupón no encontrado." });
            if (!cupon.Activo || DateTime.UtcNow < cupon.FechaInicio || DateTime.UtcNow > cupon.FechaFin)
                return BadRequest(new { message = "Cupón inactivo o vencido." });
            if (cupon.LimiteUso > 0 && cupon.UsosActuales >= cupon.LimiteUso)
                return BadRequest(new { message = "Cupón sin usos disponibles." });
            if (subtotal < cupon.MontoMinimo)
                return BadRequest(new { message = $"Subtotal insuficiente. Mínimo: ₡{cupon.MontoMinimo:N0}." });
            if (cupon.ProductoId.HasValue && !productoIds.Contains(cupon.ProductoId.Value))
                return BadRequest(new { message = "El cupón no aplica a los productos del carrito." });

            descuento = CuponesController.CalcularDescuento(cupon, subtotal);
        }

        // --------------------------------------------------------
        // Costo de envío (si se proporcionan coordenadas)
        // --------------------------------------------------------
        decimal costoEnvio = 0;
        if (!dto.EsProforma && dto.Latitud.HasValue && dto.Longitud.HasValue)
        {
            if (!FacturacionService.EstaEnCostaRica(dto.Latitud.Value, dto.Longitud.Value))
                return BadRequest(new { message = "La dirección debe estar dentro de Costa Rica." });

            costoEnvio = _facturacion.CalcularCostoEnvio(dto.Latitud.Value, dto.Longitud.Value, subtotal - descuento);
        }

        // --------------------------------------------------------
        // IVA 13% sobre base imponible (subtotal - descuento)
        // --------------------------------------------------------
        var baseImponible = subtotal - descuento;
        if (baseImponible < 0) baseImponible = 0;
        var iva = _facturacion.CalcularIva(baseImponible);
        var total = Math.Round(baseImponible + iva + costoEnvio, 2);

        // --------------------------------------------------------
        // Persistir pedido
        // --------------------------------------------------------
        var pedido = new Pedido
        {
            UsuarioId = CurrentUserId,
            Fecha = DateTime.UtcNow,
            Estado = dto.EsProforma ? "Proforma" : "Confirmado",
            MetodoPago = dto.MetodoPago,
            DireccionEnvio = dto.DireccionEnvio,
            Latitud = dto.Latitud,
            Longitud = dto.Longitud,
            EsProforma = dto.EsProforma,
            Subtotal = Math.Round(subtotal, 2),
            Descuento = Math.Round(descuento, 2),
            Iva = iva,
            CostoEnvio = costoEnvio,
            Total = total,
            CuponId = cupon?.CuponId,
            Detalles = detalles
        };
        _db.Pedidos.Add(pedido);

        // Actualizar stock y registrar movimientos sólo si el pedido es real.
        if (!dto.EsProforma)
        {
            foreach (var (producto, cantidad, stockAnterior) in productosAfectados)
            {
                producto.Stock -= cantidad;
                producto.Popularidad += cantidad;
                _db.MovimientosInventario.Add(new MovimientoInventario
                {
                    ProductoId = producto.ProductoId,
                    Tipo = TipoMovimiento.Salida,
                    Cantidad = cantidad,
                    StockAnterior = stockAnterior,
                    StockNuevo = producto.Stock,
                    Motivo = "Venta asociada a pedido",
                    UsuarioId = CurrentUserId
                });
            }

            if (cupon != null) cupon.UsosActuales += 1;

            var items = _db.Carritos.Where(c => c.UsuarioId == CurrentUserId);
            _db.Carritos.RemoveRange(items);
        }

        await _db.SaveChangesAsync();

        // --------------------------------------------------------
        // Generar factura electrónica (solo pedidos reales)
        // --------------------------------------------------------
        if (!dto.EsProforma)
        {
            var consecutivo = await GenerarConsecutivoAsync();
            var factura = new Factura
            {
                NumeroConsecutivo = consecutivo,
                ClaveNumerica = GenerarClaveNumerica(consecutivo, pedido.PedidoId),
                PedidoId = pedido.PedidoId,
                UsuarioId = CurrentUserId,
                Subtotal = pedido.Subtotal,
                Descuento = pedido.Descuento,
                BaseImponible = baseImponible,
                Iva = pedido.Iva,
                CostoEnvio = pedido.CostoEnvio,
                Total = pedido.Total,
                FechaEmision = pedido.Fecha
            };
            _db.Facturas.Add(factura);
            await _db.SaveChangesAsync();
        }

        var full = await _db.Pedidos
            .Include(x => x.Detalles).ThenInclude(d => d.Producto)
            .Include(x => x.Cupon)
            .Include(x => x.Factura)
            .FirstAsync(x => x.PedidoId == pedido.PedidoId);
        return Map(full);
    }

    [Authorize]
    [HttpPut("{id:int}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] string estado)
    {
        var pedido = await _db.Pedidos
            .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(p => p.PedidoId == id);
        if (pedido is null) return NotFound();

        // Clientes solo pueden cancelar sus propios pedidos pendientes/confirmados
        if (CurrentUserRole != "Administrador")
        {
            if (pedido.UsuarioId != CurrentUserId)
                return Forbid();
            if (estado != "Cancelado")
                return BadRequest(new { message = "Solo puede cancelar pedidos." });
            if (pedido.Estado != "Pendiente" && pedido.Estado != "Confirmado")
                return BadRequest(new { message = "Solo puede cancelar pedidos pendientes o confirmados." });
        }

        var permitidos = new[] { "Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado", "Proforma" };
        if (!permitidos.Contains(estado))
            return BadRequest(new { message = "Estado no permitido." });

        // Restaurar stock al cancelar un pedido que no sea proforma
        if (estado == "Cancelado" && pedido.Estado != "Cancelado" && !pedido.EsProforma)
        {
            foreach (var detalle in pedido.Detalles)
            {
                var producto = detalle.Producto;
                if (producto is null) continue;

                var stockAnterior = producto.Stock;
                producto.Stock += detalle.Cantidad;

                _db.MovimientosInventario.Add(new MovimientoInventario
                {
                    ProductoId = producto.ProductoId,
                    Tipo = TipoMovimiento.Entrada,
                    Cantidad = detalle.Cantidad,
                    StockAnterior = stockAnterior,
                    StockNuevo = producto.Stock,
                    Motivo = $"Cancelación de pedido #{pedido.PedidoId}",
                    UsuarioId = CurrentUserId
                });
            }
        }

        pedido.Estado = estado;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------------------------------------
    // Utilidades
    // --------------------------------------------------------
    private async Task<string> GenerarConsecutivoAsync()
    {
        var total = await _db.Facturas.CountAsync();
        return $"FE-{(total + 1):D10}";
    }

    private static string GenerarClaveNumerica(string consecutivo, int pedidoId)
    {
        // 50 dígitos simulando la clave DGT-CR (país + fecha + número).
        var fecha = DateTime.UtcNow.ToString("ddMMyy");
        var nums = new string(consecutivo.Where(char.IsDigit).ToArray());
        var baseClave = $"506{fecha}{pedidoId:D10}{nums}";
        return baseClave.PadRight(50, '0').Substring(0, 50);
    }

    private static PedidoV2Dto Map(Pedido p) => new(
        p.PedidoId, p.Fecha, p.Subtotal, p.Iva, p.Descuento, p.CostoEnvio, p.Total,
        p.Estado, p.MetodoPago, p.DireccionEnvio, p.Latitud, p.Longitud, p.EsProforma,
        p.Cupon?.Codigo,
        p.Factura?.FacturaId,
        p.Factura?.NumeroConsecutivo,
        p.Detalles.Select(d => new PedidoDetalleDto(
            d.ProductoId, d.Producto?.Nombre ?? "", d.Cantidad, d.PrecioUnitario, d.Subtotal
        )).ToList()
    );
}
