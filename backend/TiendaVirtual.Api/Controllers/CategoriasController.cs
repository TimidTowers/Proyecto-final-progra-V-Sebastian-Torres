using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// CRUD de categorías con soporte jerárquico (padre/hijas).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoriasController(AppDbContext db) => _db = db;

    /// <summary>Devuelve todas las categorías activas planas.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> Get()
    {
        var list = await _db.Categorias.Where(c => c.Activo).ToListAsync();
        return list.Select(c => MapPlano(c)).ToList();
    }

    /// <summary>Devuelve las categorías organizadas en árbol (raíz → subcategorías).</summary>
    [HttpGet("arbol")]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> Arbol()
    {
        var todas = await _db.Categorias.Where(c => c.Activo).ToListAsync();
        var raices = todas.Where(c => c.CategoriaPadreId == null).ToList();
        return raices.Select(r => Construir(r, todas)).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoriaDto>> GetById(int id)
    {
        var cat = await _db.Categorias.FindAsync(id);
        return cat is null ? NotFound() : MapPlano(cat);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> Create([FromBody] CategoriaCreateDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (dto.CategoriaPadreId.HasValue)
        {
            var existePadre = await _db.Categorias.AnyAsync(c => c.CategoriaId == dto.CategoriaPadreId.Value);
            if (!existePadre) return BadRequest(new { message = "La categoría padre no existe." });
        }

        var categoria = new Categoria
        {
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Icono = dto.Icono,
            CategoriaPadreId = dto.CategoriaPadreId,
            Activo = true
        };
        _db.Categorias.Add(categoria);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = categoria.CategoriaId }, MapPlano(categoria));
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoriaCreateDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var cat = await _db.Categorias.FindAsync(id);
        if (cat is null) return NotFound();

        if (dto.CategoriaPadreId == id)
            return BadRequest(new { message = "Una categoría no puede ser su propio padre." });

        cat.Nombre = dto.Nombre.Trim();
        cat.Descripcion = dto.Descripcion?.Trim();
        cat.Icono = dto.Icono;
        cat.CategoriaPadreId = dto.CategoriaPadreId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await _db.Categorias.FindAsync(id);
        if (cat is null) return NotFound();

        // No permitir eliminar si tiene subcategorías o productos activos.
        var tieneHijas = await _db.Categorias.AnyAsync(c => c.CategoriaPadreId == id && c.Activo);
        var tieneProductos = await _db.Productos.AnyAsync(p => p.CategoriaId == id && p.Activo);
        if (tieneHijas || tieneProductos)
            return BadRequest(new { message = "No se puede eliminar: la categoría tiene subcategorías o productos activos." });

        cat.Activo = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------------------------------------
    private static CategoriaDto MapPlano(Categoria c) =>
        new(c.CategoriaId, c.Nombre, c.Descripcion, c.Icono, c.Activo, c.CategoriaPadreId, new List<CategoriaDto>());

    private static CategoriaDto Construir(Categoria raiz, List<Categoria> todas)
    {
        var hijas = todas
            .Where(c => c.CategoriaPadreId == raiz.CategoriaId)
            .Select(h => Construir(h, todas))
            .ToList();
        return new CategoriaDto(raiz.CategoriaId, raiz.Nombre, raiz.Descripcion, raiz.Icono, raiz.Activo, raiz.CategoriaPadreId, hijas);
    }
}
