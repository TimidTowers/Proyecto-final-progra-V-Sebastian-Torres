using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// Administración y validación de cupones de descuento.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CuponesController : ControllerBase
{
    private readonly AppDbContext _db;
    public CuponesController(AppDbContext db) => _db = db;

    /// <summary>Lista completa de cupones (solo administrador).</summary>
    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CuponDto>>> Get()
    {
        var list = await _db.Cupones.OrderByDescending(c => c.FechaFin).ToListAsync();
        return list.Select(Map).ToList();
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CuponDto>> GetById(int id)
    {
        var c = await _db.Cupones.FindAsync(id);
        return c is null ? NotFound() : Map(c);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPost]
    public async Task<ActionResult<CuponDto>> Create([FromBody] CuponUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        if (dto.FechaFin <= dto.FechaInicio)
            return BadRequest(new { message = "La fecha de fin debe ser posterior a la de inicio." });

        var codigo = dto.Codigo.Trim().ToUpperInvariant();
        if (await _db.Cupones.AnyAsync(c => c.Codigo == codigo))
            return BadRequest(new { message = "Ya existe un cupón con ese código." });

        var cupon = new Cupon
        {
            Codigo = codigo,
            Descripcion = dto.Descripcion?.Trim(),
            Tipo = dto.Tipo,
            Valor = dto.Valor,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            LimiteUso = dto.LimiteUso,
            MontoMinimo = dto.MontoMinimo,
            ProductoId = dto.ProductoId,
            Activo = dto.Activo
        };
        _db.Cupones.Add(cupon);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cupon.CuponId }, Map(cupon));
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CuponUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var c = await _db.Cupones.FindAsync(id);
        if (c is null) return NotFound();
        if (dto.FechaFin <= dto.FechaInicio)
            return BadRequest(new { message = "La fecha de fin debe ser posterior a la de inicio." });

        c.Codigo = dto.Codigo.Trim().ToUpperInvariant();
        c.Descripcion = dto.Descripcion?.Trim();
        c.Tipo = dto.Tipo;
        c.Valor = dto.Valor;
        c.FechaInicio = dto.FechaInicio;
        c.FechaFin = dto.FechaFin;
        c.LimiteUso = dto.LimiteUso;
        c.MontoMinimo = dto.MontoMinimo;
        c.ProductoId = dto.ProductoId;
        c.Activo = dto.Activo;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Administrador")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Cupones.FindAsync(id);
        if (c is null) return NotFound();
        c.Activo = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Valida un código de cupón contra un subtotal (y opcionalmente una lista
    /// de productos del carrito). Devuelve el descuento aplicable.
    /// </summary>
    [Authorize]
    [HttpPost("validar")]
    public async Task<ActionResult<ValidarCuponResponse>> Validar([FromBody] ValidarCuponRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var codigo = req.Codigo.Trim().ToUpperInvariant();
        var cupon = await _db.Cupones.FirstOrDefaultAsync(c => c.Codigo == codigo);

        if (cupon is null)
            return new ValidarCuponResponse(false, "El cupón no existe.", 0, null);
        if (!cupon.Activo)
            return new ValidarCuponResponse(false, "El cupón está inactivo.", 0, null);

        var ahora = DateTime.UtcNow;
        if (ahora < cupon.FechaInicio)
            return new ValidarCuponResponse(false, "El cupón aún no es válido.", 0, null);
        if (ahora > cupon.FechaFin)
            return new ValidarCuponResponse(false, "El cupón ya expiró.", 0, null);
        if (cupon.LimiteUso > 0 && cupon.UsosActuales >= cupon.LimiteUso)
            return new ValidarCuponResponse(false, "El cupón alcanzó su límite de usos.", 0, null);
        if (req.Subtotal < cupon.MontoMinimo)
            return new ValidarCuponResponse(false,
                $"Compra mínima requerida: ₡{cupon.MontoMinimo:N0}.", 0, null);
        if (cupon.ProductoId.HasValue && (req.ProductoIds is null || !req.ProductoIds.Contains(cupon.ProductoId.Value)))
            return new ValidarCuponResponse(false,
                "El cupón solo aplica a un producto específico que no está en el carrito.", 0, null);

        var descuento = CalcularDescuento(cupon, req.Subtotal);
        return new ValidarCuponResponse(true, "Cupón aplicado correctamente.", descuento, Map(cupon));
    }

    /// <summary>Calcula el monto del descuento sin sobrepasar el subtotal.</summary>
    public static decimal CalcularDescuento(Cupon cupon, decimal subtotal)
    {
        decimal d = cupon.Tipo switch
        {
            TipoDescuento.Porcentaje => subtotal * (cupon.Valor / 100m),
            TipoDescuento.MontoFijo => cupon.Valor,
            _ => 0
        };
        return Math.Round(Math.Min(d, subtotal), 2);
    }

    private static CuponDto Map(Cupon c) =>
        new(c.CuponId, c.Codigo, c.Descripcion, c.Tipo, c.Valor,
            c.FechaInicio, c.FechaFin, c.LimiteUso, c.UsosActuales,
            c.MontoMinimo, c.ProductoId, c.Activo);
}
