using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// Gestión de inventario: reabastecimiento, ajustes, alertas de stock bajo
/// e historial de movimientos.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class InventarioController : ControllerBase
{
    private readonly AppDbContext _db;
    public InventarioController(AppDbContext db) => _db = db;

    private int? CurrentUserId
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }
    }

    /// <summary>Historial completo de movimientos, ordenado desc.</summary>
    [HttpGet("movimientos")]
    public async Task<ActionResult<IEnumerable<MovimientoInventarioDto>>> Movimientos(
        [FromQuery] int? productoId,
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta)
    {
        var query = _db.MovimientosInventario
            .Include(m => m.Producto)
            .Include(m => m.Usuario)
            .AsQueryable();

        if (productoId.HasValue) query = query.Where(m => m.ProductoId == productoId.Value);
        if (desde.HasValue) query = query.Where(m => m.Fecha >= desde.Value);
        if (hasta.HasValue) query = query.Where(m => m.Fecha <= hasta.Value);

        var list = await query.OrderByDescending(m => m.Fecha).Take(500).ToListAsync();

        return list.Select(m => new MovimientoInventarioDto(
            m.MovimientoId, m.ProductoId, m.Producto?.Nombre ?? "", m.Tipo, m.Cantidad,
            m.StockAnterior, m.StockNuevo, m.Motivo, m.Fecha, m.Usuario?.Nombre
        )).ToList();
    }

    /// <summary>
    /// Suma stock al producto y registra el movimiento como Entrada
    /// (reabastecimiento desde proveedor).
    /// </summary>
    [HttpPost("reabastecer")]
    public async Task<IActionResult> Reabastecer([FromBody] ReabastecerRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var producto = await _db.Productos.FindAsync(req.ProductoId);
        if (producto is null) return NotFound(new { message = "Producto no existe." });

        var stockAnterior = producto.Stock;
        producto.Stock += req.Cantidad;

        _db.MovimientosInventario.Add(new MovimientoInventario
        {
            ProductoId = producto.ProductoId,
            Tipo = TipoMovimiento.Entrada,
            Cantidad = req.Cantidad,
            StockAnterior = stockAnterior,
            StockNuevo = producto.Stock,
            Motivo = req.Motivo ?? "Reabastecimiento",
            UsuarioId = CurrentUserId
        });

        await _db.SaveChangesAsync();
        return Ok(new
        {
            producto.ProductoId,
            producto.Nombre,
            stockAnterior,
            stockNuevo = producto.Stock
        });
    }

    /// <summary>Ajuste manual (positivo o negativo) con registro del motivo.</summary>
    [HttpPost("ajustar")]
    public async Task<IActionResult> Ajustar([FromBody] AjusteStockRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var producto = await _db.Productos.FindAsync(req.ProductoId);
        if (producto is null) return NotFound(new { message = "Producto no existe." });
        if (producto.Stock + req.Delta < 0)
            return BadRequest(new { message = "El ajuste dejaría stock negativo." });

        var stockAnterior = producto.Stock;
        producto.Stock += req.Delta;

        _db.MovimientosInventario.Add(new MovimientoInventario
        {
            ProductoId = producto.ProductoId,
            Tipo = TipoMovimiento.Ajuste,
            Cantidad = Math.Abs(req.Delta),
            StockAnterior = stockAnterior,
            StockNuevo = producto.Stock,
            Motivo = req.Motivo ?? "Ajuste manual",
            UsuarioId = CurrentUserId
        });

        await _db.SaveChangesAsync();
        return Ok(new { producto.ProductoId, stockAnterior, stockNuevo = producto.Stock });
    }

    /// <summary>
    /// Reabastecimiento masivo: recibe una lista de productos con cantidad
    /// y procesa cada uno en una transacción única.
    /// </summary>
    [HttpPost("reabastecer-masivo")]
    public async Task<ActionResult<IEnumerable<ReabastecerMasivoResultItem>>> ReabastecerMasivo(
        [FromBody] ReabastecerMasivoRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (req.Items == null || req.Items.Count == 0)
            return BadRequest(new { message = "Debe enviar al menos un producto." });

        var resultados = new List<ReabastecerMasivoResultItem>();
        foreach (var item in req.Items)
        {
            var producto = await _db.Productos.FindAsync(item.ProductoId);
            if (producto is null)
            {
                resultados.Add(new ReabastecerMasivoResultItem(item.ProductoId, "???", 0, 0, false, "Producto no encontrado"));
                continue;
            }
            if (item.Cantidad <= 0)
            {
                resultados.Add(new ReabastecerMasivoResultItem(item.ProductoId, producto.Nombre, producto.Stock, producto.Stock, false, "Cantidad debe ser mayor a 0"));
                continue;
            }

            var stockAnterior = producto.Stock;
            producto.Stock += item.Cantidad;

            _db.MovimientosInventario.Add(new MovimientoInventario
            {
                ProductoId = producto.ProductoId,
                Tipo = TipoMovimiento.Entrada,
                Cantidad = item.Cantidad,
                StockAnterior = stockAnterior,
                StockNuevo = producto.Stock,
                Motivo = item.Motivo ?? "Reabastecimiento masivo",
                UsuarioId = CurrentUserId
            });

            resultados.Add(new ReabastecerMasivoResultItem(
                producto.ProductoId, producto.Nombre, stockAnterior, producto.Stock, true, null));
        }

        await _db.SaveChangesAsync();
        return Ok(resultados);
    }

    /// <summary>
    /// Ajuste masivo: establece el stock exacto de varios productos.
    /// </summary>
    [HttpPost("ajustar-masivo")]
    public async Task<ActionResult<IEnumerable<ReabastecerMasivoResultItem>>> AjustarMasivo(
        [FromBody] List<AjusteStockRequest> items)
    {
        if (items == null || items.Count == 0)
            return BadRequest(new { message = "Debe enviar al menos un producto." });

        var resultados = new List<ReabastecerMasivoResultItem>();
        foreach (var item in items)
        {
            var producto = await _db.Productos.FindAsync(item.ProductoId);
            if (producto is null)
            {
                resultados.Add(new ReabastecerMasivoResultItem(item.ProductoId, "???", 0, 0, false, "No encontrado"));
                continue;
            }
            if (producto.Stock + item.Delta < 0)
            {
                resultados.Add(new ReabastecerMasivoResultItem(item.ProductoId, producto.Nombre, producto.Stock, producto.Stock, false, "Stock quedaría negativo"));
                continue;
            }

            var stockAnterior = producto.Stock;
            producto.Stock += item.Delta;

            _db.MovimientosInventario.Add(new MovimientoInventario
            {
                ProductoId = producto.ProductoId,
                Tipo = TipoMovimiento.Ajuste,
                Cantidad = Math.Abs(item.Delta),
                StockAnterior = stockAnterior,
                StockNuevo = producto.Stock,
                Motivo = item.Motivo ?? "Ajuste masivo",
                UsuarioId = CurrentUserId
            });

            resultados.Add(new ReabastecerMasivoResultItem(
                producto.ProductoId, producto.Nombre, stockAnterior, producto.Stock, true, null));
        }

        await _db.SaveChangesAsync();
        return Ok(resultados);
    }

    /// <summary>
    /// Productos cuyo stock está por debajo del umbral mínimo configurable.
    /// Se expone para que el frontend muestre notificaciones visuales.
    /// </summary>
    [HttpGet("alertas")]
    public async Task<ActionResult<IEnumerable<AlertaStockDto>>> Alertas()
    {
        var list = await _db.Productos
            .Include(p => p.Categoria)
            .Where(p => p.Activo && p.Stock <= p.StockMinimo)
            .OrderBy(p => p.Stock)
            .Select(p => new AlertaStockDto(p.ProductoId, p.Nombre, p.Stock, p.StockMinimo, p.Categoria!.Nombre))
            .ToListAsync();
        return list;
    }

    /// <summary>
    /// Simula el envío de un correo al administrador con los productos en
    /// estado crítico. Devuelve cuántos mensajes se hubieran generado.
    /// </summary>
    [HttpPost("notificar-stock-bajo")]
    public async Task<IActionResult> NotificarStockBajo()
    {
        var alertas = await _db.Productos
            .Where(p => p.Activo && p.Stock <= p.StockMinimo)
            .ToListAsync();

        // En un entorno real aquí iría SMTP / SendGrid / Mailgun.
        // Lo dejamos como log para no bloquear el ejemplo del proyecto final.
        foreach (var a in alertas)
        {
            Console.WriteLine($"[ALERTA STOCK] {a.Nombre}: {a.Stock} / min {a.StockMinimo}");
        }

        return Ok(new
        {
            mensaje = $"Se generaron {alertas.Count} alertas de stock bajo.",
            destinatario = "admin@tienda.com",
            productos = alertas.Select(p => new { p.ProductoId, p.Nombre, p.Stock, p.StockMinimo })
        });
    }
}
