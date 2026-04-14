using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// Reportes de negocio para el panel de administración: dashboard con métricas,
/// reportes filtrables de ventas, usuarios e inventario.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportesController(AppDbContext db) => _db = db;

    /// <summary>
    /// Dashboard integral con métricas, series temporales y rankings.
    /// Alimenta los gráficos interactivos del panel de administración.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] int? categoriaId,
        [FromQuery] int? productoId,
        [FromQuery] string? metodoPago)
    {
        var query = _db.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto!).ThenInclude(p => p.Categoria)
            .Where(p => !p.EsProforma && p.Estado != "Cancelado");

        if (desde.HasValue) query = query.Where(p => p.Fecha >= desde.Value);
        if (hasta.HasValue) query = query.Where(p => p.Fecha <= hasta.Value);
        if (!string.IsNullOrWhiteSpace(metodoPago)) query = query.Where(p => p.MetodoPago == metodoPago);
        if (productoId.HasValue)
            query = query.Where(p => p.Detalles.Any(d => d.ProductoId == productoId.Value));
        if (categoriaId.HasValue)
            query = query.Where(p => p.Detalles.Any(d => d.Producto!.CategoriaId == categoriaId.Value));

        var pedidos = await query.ToListAsync();
        var totalVendido = pedidos.Sum(p => p.Total);
        var cantidad = pedidos.Count;
        var ticketPromedio = cantidad > 0 ? Math.Round(totalVendido / cantidad, 2) : 0m;
        var clientesActivos = pedidos.Select(p => p.UsuarioId).Distinct().Count();
        var stockBajo = await _db.Productos.CountAsync(p => p.Activo && p.Stock <= p.StockMinimo);

        var ventasPorDia = pedidos
            .GroupBy(p => p.Fecha.Date)
            .OrderBy(g => g.Key)
            .Select(g => new SerieTemporalPunto(
                g.Key.ToString("yyyy-MM-dd"),
                g.Sum(p => p.Total),
                g.Count()))
            .ToList();

        var detallesFiltrados = pedidos.SelectMany(p => p.Detalles).ToList();

        var productosTop = detallesFiltrados
            .GroupBy(d => new { d.ProductoId, Nombre = d.Producto?.Nombre ?? "N/D" })
            .Select(g => new ProductoTopDto(
                g.Key.ProductoId, g.Key.Nombre,
                g.Sum(x => x.Cantidad), g.Sum(x => x.Subtotal)))
            .OrderByDescending(x => x.Total)
            .Take(10)
            .ToList();

        var categoriasTop = detallesFiltrados
            .Where(d => d.Producto?.Categoria != null)
            .GroupBy(d => new { d.Producto!.CategoriaId, Nombre = d.Producto.Categoria!.Nombre })
            .Select(g => new CategoriaTopDto(
                g.Key.CategoriaId, g.Key.Nombre,
                g.Sum(x => x.Cantidad), g.Sum(x => x.Subtotal)))
            .OrderByDescending(x => x.Total)
            .Take(10)
            .ToList();

        var porMetodoPago = pedidos
            .GroupBy(p => p.MetodoPago)
            .Select(g => new MetodoPagoDto(g.Key, g.Sum(p => p.Total), g.Count()))
            .ToList();

        var porEstado = pedidos
            .GroupBy(p => p.Estado)
            .Select(g => new EstadoPedidoDto(g.Key, g.Sum(p => p.Total), g.Count()))
            .ToList();

        return new DashboardDto(
            totalVendido, cantidad, ticketPromedio, clientesActivos, stockBajo,
            ventasPorDia, productosTop, categoriasTop, porMetodoPago, porEstado);
    }

    /// <summary>Reporte simple de ventas (retrocompatible).</summary>
    [HttpGet("ventas")]
    public async Task<IActionResult> Ventas([FromQuery] DateTime? desde, [FromQuery] DateTime? hasta)
    {
        var q = _db.Pedidos.Where(p => !p.EsProforma && p.Estado != "Cancelado");
        if (desde.HasValue) q = q.Where(p => p.Fecha >= desde.Value);
        if (hasta.HasValue) q = q.Where(p => p.Fecha <= hasta.Value);

        var total = await q.SumAsync(p => (decimal?)p.Total) ?? 0;
        var cantidad = await q.CountAsync();
        var porEstado = await q.GroupBy(p => p.Estado)
            .Select(g => new { Estado = g.Key, Total = g.Sum(p => p.Total), Cantidad = g.Count() })
            .ToListAsync();

        return Ok(new { total, cantidad, porEstado });
    }

    [HttpGet("usuarios")]
    public async Task<IActionResult> Usuarios()
    {
        var list = await _db.Usuarios
            .Select(u => new { u.UsuarioId, u.Nombre, u.Email, u.Rol, u.Activo, u.FechaRegistro })
            .ToListAsync();

        if (list.Count == 0) return Ok(new { message = "No hay registros de usuarios.", data = list });
        return Ok(new { data = list });
    }

    [HttpGet("inventario")]
    public async Task<IActionResult> Inventario()
    {
        var list = await _db.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo)
            .Select(p => new
            {
                p.ProductoId,
                p.Nombre,
                Categoria = p.Categoria!.Nombre,
                p.Stock,
                p.StockMinimo,
                p.Precio,
                ValorInventario = p.Stock * p.Precio,
                StockBajo = p.Stock <= p.StockMinimo
            })
            .ToListAsync();

        var valorTotal = list.Sum(p => p.ValorInventario);
        return Ok(new { valorTotal, productos = list });
    }
}
