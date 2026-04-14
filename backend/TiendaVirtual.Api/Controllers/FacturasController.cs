using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// Consulta y descarga de facturas electrónicas generadas por los pedidos.
/// La creación se dispara automáticamente al confirmar un pedido en
/// <see cref="PedidosController"/>.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacturasController : ControllerBase
{
    private readonly AppDbContext _db;
    public FacturasController(AppDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentUserRole => User.FindFirstValue(ClaimTypes.Role) ?? "Cliente";

    /// <summary>Lista las facturas del usuario (o de todos si es Administrador).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FacturaDto>>> Get()
    {
        var query = _db.Facturas
            .Include(f => f.Usuario)
            .Include(f => f.Pedido!)
                .ThenInclude(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
            .AsQueryable();

        if (CurrentUserRole != "Administrador")
            query = query.Where(f => f.UsuarioId == CurrentUserId);

        var list = await query.OrderByDescending(f => f.FechaEmision).ToListAsync();
        return list.Select(Map).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FacturaDto>> GetById(int id)
    {
        var f = await _db.Facturas
            .Include(x => x.Usuario)
            .Include(x => x.Pedido!)
                .ThenInclude(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(x => x.FacturaId == id);

        if (f is null) return NotFound();
        if (CurrentUserRole != "Administrador" && f.UsuarioId != CurrentUserId) return Forbid();

        return Map(f);
    }

    /// <summary>Obtiene la factura asociada a un pedido específico.</summary>
    [HttpGet("pedido/{pedidoId:int}")]
    public async Task<ActionResult<FacturaDto>> GetByPedido(int pedidoId)
    {
        var f = await _db.Facturas
            .Include(x => x.Usuario)
            .Include(x => x.Pedido!)
                .ThenInclude(p => p.Detalles)
                    .ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(x => x.PedidoId == pedidoId);

        if (f is null) return NotFound();
        if (CurrentUserRole != "Administrador" && f.UsuarioId != CurrentUserId) return Forbid();

        return Map(f);
    }

    private static FacturaDto Map(Factura f) => new(
        f.FacturaId,
        f.NumeroConsecutivo,
        f.ClaveNumerica,
        f.PedidoId,
        f.UsuarioId,
        f.Usuario?.Nombre ?? "",
        f.Usuario?.Email,
        f.Subtotal,
        f.Descuento,
        f.BaseImponible,
        f.Iva,
        f.CostoEnvio,
        f.Total,
        f.FechaEmision,
        f.Pedido?.Detalles.Select(d => new PedidoDetalleDto(
            d.ProductoId, d.Producto?.Nombre ?? "", d.Cantidad, d.PrecioUnitario, d.Subtotal
        )).ToList() ?? new List<PedidoDetalleDto>()
    );
}
