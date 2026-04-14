using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// CRUD completo de productos con filtros, autocompletado y
/// registro automático de movimientos de inventario.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductoDetalleDto>>> Get(
        [FromQuery] int? categoriaId,
        [FromQuery] string? q,
        [FromQuery] decimal? precioMin,
        [FromQuery] decimal? precioMax,
        [FromQuery] string? orden)
    {
        var query = _db.Productos.Include(p => p.Categoria).Where(p => p.Activo).AsQueryable();

        if (categoriaId.HasValue)
        {
            // Incluir productos de subcategorías de la categoría solicitada.
            var idsIncluir = new List<int> { categoriaId.Value };
            var hijas = await _db.Categorias
                .Where(c => c.CategoriaPadreId == categoriaId.Value)
                .Select(c => c.CategoriaId)
                .ToListAsync();
            idsIncluir.AddRange(hijas);
            query = query.Where(p => idsIncluir.Contains(p.CategoriaId));
        }
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Nombre.Contains(q) || (p.Descripcion != null && p.Descripcion.Contains(q)));
        if (precioMin.HasValue)
            query = query.Where(p => p.Precio >= precioMin.Value);
        if (precioMax.HasValue)
            query = query.Where(p => p.Precio <= precioMax.Value);

        query = orden switch
        {
            "precio_asc" => query.OrderBy(p => p.Precio),
            "precio_desc" => query.OrderByDescending(p => p.Precio),
            "popularidad" => query.OrderByDescending(p => p.Popularidad),
            _ => query.OrderBy(p => p.Nombre)
        };

        var list = await query
            .Select(p => new ProductoDetalleDto(
                p.ProductoId, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.StockMinimo,
                p.ImagenUrl, p.Popularidad, p.CategoriaId, p.Categoria!.Nombre,
                p.Stock <= p.StockMinimo))
            .ToListAsync();

        return list;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductoDetalleDto>> GetById(int id)
    {
        var p = await _db.Productos.Include(x => x.Categoria).FirstOrDefaultAsync(x => x.ProductoId == id);
        if (p is null) return NotFound();
        return new ProductoDetalleDto(p.ProductoId, p.Nombre, p.Descripcion, p.Precio, p.Stock, p.StockMinimo,
            p.ImagenUrl, p.Popularidad, p.CategoriaId, p.Categoria!.Nombre, p.Stock <= p.StockMinimo);
    }

    [HttpGet("autocomplete")]
    public async Task<ActionResult<IEnumerable<string>>> Autocomplete([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return new List<string>();
        return await _db.Productos
            .Where(p => p.Activo && p.Nombre.Contains(q))
            .OrderByDescending(p => p.Popularidad)
            .Select(p => p.Nombre)
            .Take(8)
            .ToListAsync();
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<ProductoDetalleDto>> Create([FromBody] ProductoUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var existeCat = await _db.Categorias.AnyAsync(c => c.CategoriaId == dto.CategoriaId);
        if (!existeCat) return BadRequest(new { message = "La categoría indicada no existe." });

        var producto = new Producto
        {
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Precio = dto.Precio,
            Stock = dto.Stock,
            StockMinimo = dto.StockMinimo,
            ImagenUrl = dto.ImagenUrl,
            CategoriaId = dto.CategoriaId,
            Activo = true
        };
        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();

        if (dto.Stock > 0)
        {
            _db.MovimientosInventario.Add(new MovimientoInventario
            {
                ProductoId = producto.ProductoId,
                Tipo = TipoMovimiento.Entrada,
                Cantidad = dto.Stock,
                StockAnterior = 0,
                StockNuevo = dto.Stock,
                Motivo = "Stock inicial del producto",
                UsuarioId = CurrentUserId
            });
            await _db.SaveChangesAsync();
        }

        return await GetById(producto.ProductoId);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductoUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var p = await _db.Productos.FindAsync(id);
        if (p is null) return NotFound();

        var existeCat = await _db.Categorias.AnyAsync(c => c.CategoriaId == dto.CategoriaId);
        if (!existeCat) return BadRequest(new { message = "La categoría indicada no existe." });

        var stockAnterior = p.Stock;
        p.Nombre = dto.Nombre.Trim();
        p.Descripcion = dto.Descripcion?.Trim();
        p.Precio = dto.Precio;
        p.Stock = dto.Stock;
        p.StockMinimo = dto.StockMinimo;
        p.ImagenUrl = dto.ImagenUrl;
        p.CategoriaId = dto.CategoriaId;

        if (stockAnterior != dto.Stock)
        {
            var delta = dto.Stock - stockAnterior;
            _db.MovimientosInventario.Add(new MovimientoInventario
            {
                ProductoId = p.ProductoId,
                Tipo = TipoMovimiento.Ajuste,
                Cantidad = Math.Abs(delta),
                StockAnterior = stockAnterior,
                StockNuevo = dto.Stock,
                Motivo = "Ajuste manual desde edición de producto",
                UsuarioId = CurrentUserId
            });
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Productos.FindAsync(id);
        if (p is null) return NotFound();
        p.Activo = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private int? CurrentUserId
    {
        get
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }
    }
}
