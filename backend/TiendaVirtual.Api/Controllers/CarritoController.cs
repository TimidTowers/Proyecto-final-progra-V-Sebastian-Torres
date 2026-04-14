using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CarritoController : ControllerBase
{
    private readonly AppDbContext _db;
    public CarritoController(AppDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarritoItemDto>>> Get()
    {
        return await _db.Carritos
            .Where(c => c.UsuarioId == CurrentUserId)
            .Include(c => c.Producto)
            .Select(c => new CarritoItemDto(
                c.ProductoId,
                c.Producto!.Nombre,
                c.Producto.ImagenUrl,
                c.Cantidad,
                c.PrecioUnitario,
                c.PrecioUnitario * c.Cantidad))
            .ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> Agregar(AgregarCarritoDto dto)
    {
        var producto = await _db.Productos.FindAsync(dto.ProductoId);
        if (producto is null || !producto.Activo) return NotFound(new { message = "Producto no existe." });
        if (producto.Stock < dto.Cantidad) return BadRequest(new { message = "Stock insuficiente." });

        var item = await _db.Carritos.FirstOrDefaultAsync(c =>
            c.UsuarioId == CurrentUserId && c.ProductoId == dto.ProductoId);

        if (item is null)
        {
            _db.Carritos.Add(new CarritoItem
            {
                UsuarioId = CurrentUserId,
                ProductoId = dto.ProductoId,
                Cantidad = dto.Cantidad,
                PrecioUnitario = producto.Precio
            });
        }
        else
        {
            item.Cantidad += dto.Cantidad;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{productoId:int}")]
    public async Task<IActionResult> Eliminar(int productoId)
    {
        var item = await _db.Carritos.FirstOrDefaultAsync(c =>
            c.UsuarioId == CurrentUserId && c.ProductoId == productoId);
        if (item is null) return NotFound();
        _db.Carritos.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> Vaciar()
    {
        var items = _db.Carritos.Where(c => c.UsuarioId == CurrentUserId);
        _db.Carritos.RemoveRange(items);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
