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
/// Direcciones del usuario autenticado. Incluye endpoint para calcular
/// el costo de envío a partir de las coordenadas seleccionadas en el mapa.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DireccionesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FacturacionService _facturacion;

    public DireccionesController(AppDbContext db, FacturacionService facturacion)
    {
        _db = db;
        _facturacion = facturacion;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DireccionDto>>> Get()
    {
        return await _db.Direcciones
            .Where(d => d.UsuarioId == CurrentUserId)
            .OrderByDescending(d => d.Predeterminada)
            .ThenByDescending(d => d.FechaCreacion)
            .Select(d => new DireccionDto(
                d.DireccionId, d.Provincia, d.Canton, d.Distrito, d.Detalle,
                d.Latitud, d.Longitud, d.Predeterminada))
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<DireccionDto>> Create([FromBody] DireccionUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (!FacturacionService.EstaEnCostaRica(dto.Latitud, dto.Longitud))
            return BadRequest(new { message = "La dirección debe estar dentro de Costa Rica." });

        var d = new Direccion
        {
            UsuarioId = CurrentUserId,
            Provincia = dto.Provincia.Trim(),
            Canton = dto.Canton.Trim(),
            Distrito = dto.Distrito.Trim(),
            Detalle = dto.Detalle.Trim(),
            Latitud = dto.Latitud,
            Longitud = dto.Longitud,
            Predeterminada = dto.Predeterminada
        };

        if (d.Predeterminada)
        {
            var otras = await _db.Direcciones.Where(x => x.UsuarioId == CurrentUserId).ToListAsync();
            otras.ForEach(x => x.Predeterminada = false);
        }

        _db.Direcciones.Add(d);
        await _db.SaveChangesAsync();

        return new DireccionDto(d.DireccionId, d.Provincia, d.Canton, d.Distrito, d.Detalle,
            d.Latitud, d.Longitud, d.Predeterminada);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] DireccionUpsertDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var d = await _db.Direcciones.FirstOrDefaultAsync(x => x.DireccionId == id && x.UsuarioId == CurrentUserId);
        if (d is null) return NotFound();
        if (!FacturacionService.EstaEnCostaRica(dto.Latitud, dto.Longitud))
            return BadRequest(new { message = "La dirección debe estar dentro de Costa Rica." });

        d.Provincia = dto.Provincia.Trim();
        d.Canton = dto.Canton.Trim();
        d.Distrito = dto.Distrito.Trim();
        d.Detalle = dto.Detalle.Trim();
        d.Latitud = dto.Latitud;
        d.Longitud = dto.Longitud;

        if (dto.Predeterminada && !d.Predeterminada)
        {
            var otras = await _db.Direcciones.Where(x => x.UsuarioId == CurrentUserId && x.DireccionId != id).ToListAsync();
            otras.ForEach(x => x.Predeterminada = false);
            d.Predeterminada = true;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var d = await _db.Direcciones.FirstOrDefaultAsync(x => x.DireccionId == id && x.UsuarioId == CurrentUserId);
        if (d is null) return NotFound();
        _db.Direcciones.Remove(d);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Calcula la tarifa de delivery desde la tienda hasta el punto indicado.
    /// Aplica tope de ₡10.000 y envío gratis si el subtotal supera ₡50.000.
    /// </summary>
    [HttpPost("costo-envio")]
    public ActionResult<CostoEnvioResponse> CostoEnvio([FromBody] CostoEnvioRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var enCR = FacturacionService.EstaEnCostaRica(req.Latitud, req.Longitud);
        if (!enCR)
        {
            return new CostoEnvioResponse(0, 0, false, false,
                "La ubicación seleccionada está fuera de Costa Rica.");
        }

        var distancia = FacturacionService.CalcularDistanciaKm(
            FacturacionService.TiendaLat, FacturacionService.TiendaLng,
            req.Latitud, req.Longitud);
        var costo = _facturacion.CalcularCostoEnvio(req.Latitud, req.Longitud, req.Subtotal);
        var gratis = req.Subtotal >= FacturacionService.MontoEnvioGratis;

        string mensaje = gratis
            ? $"Envío gratis por compras mayores a ₡{FacturacionService.MontoEnvioGratis:N0}."
            : $"Costo de envío a {distancia:F1} km.";

        return new CostoEnvioResponse(Math.Round(distancia, 2), costo, gratis, true, mensaje);
    }
}
