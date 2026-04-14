using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Controllers;

/// <summary>
/// CRUD de reseñas de productos.
/// - Clientes: crear (1 por producto), editar/eliminar las propias.
/// - Público: consultar reseñas aprobadas por producto.
/// - Admin: moderar, listar todas, eliminar.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ResenasController : ControllerBase
{
    private readonly AppDbContext _db;
    private const int MaxFotosPorResena = 5;
    private const int MaxBase64Bytes = 2 * 1024 * 1024; // 2 MB por foto

    public ResenasController(AppDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string CurrentUserRole => User.FindFirstValue(ClaimTypes.Role) ?? "Cliente";

    // --------------------------------------------------------
    // GET /api/resenas/producto/{productoId}?pagina=1&porPagina=10&orden=recientes
    // Público: solo reseñas aprobadas
    // --------------------------------------------------------
    [AllowAnonymous]
    [HttpGet("producto/{productoId:int}")]
    public async Task<ActionResult<ResenasPaginadasDto>> GetPorProducto(
        int productoId, [FromQuery] int pagina = 1, [FromQuery] int porPagina = 10,
        [FromQuery] string orden = "recientes")
    {
        var query = _db.Resenas
            .Include(r => r.Usuario)
            .Include(r => r.Fotos)
            .Where(r => r.ProductoId == productoId && r.Estado == EstadoResena.Aprobada);

        // Resumen (sobre todas las aprobadas)
        var todas = await _db.Resenas
            .Where(r => r.ProductoId == productoId && r.Estado == EstadoResena.Aprobada)
            .ToListAsync();

        var resumen = new ResenaResumenDto(
            todas.Count > 0 ? Math.Round(todas.Average(r => r.Calificacion), 1) : 0,
            todas.Count,
            todas.Count(r => r.Calificacion == 5),
            todas.Count(r => r.Calificacion == 4),
            todas.Count(r => r.Calificacion == 3),
            todas.Count(r => r.Calificacion == 2),
            todas.Count(r => r.Calificacion == 1)
        );

        // Ordenamiento
        query = orden switch
        {
            "mejor" => query.OrderByDescending(r => r.Calificacion).ThenByDescending(r => r.FechaCreacion),
            "peor" => query.OrderBy(r => r.Calificacion).ThenByDescending(r => r.FechaCreacion),
            _ => query.OrderByDescending(r => r.FechaCreacion)
        };

        var total = await query.CountAsync();
        var items = await query.Skip((pagina - 1) * porPagina).Take(porPagina).ToListAsync();

        return new ResenasPaginadasDto(
            items.Select(MapResena).ToList(),
            total, pagina, porPagina, resumen
        );
    }

    // --------------------------------------------------------
    // GET /api/resenas/producto/{productoId}/resumen
    // Público: solo resumen de calificaciones
    // --------------------------------------------------------
    [AllowAnonymous]
    [HttpGet("producto/{productoId:int}/resumen")]
    public async Task<ActionResult<ResenaResumenDto>> GetResumen(int productoId)
    {
        var todas = await _db.Resenas
            .Where(r => r.ProductoId == productoId && r.Estado == EstadoResena.Aprobada)
            .ToListAsync();

        return new ResenaResumenDto(
            todas.Count > 0 ? Math.Round(todas.Average(r => r.Calificacion), 1) : 0,
            todas.Count,
            todas.Count(r => r.Calificacion == 5),
            todas.Count(r => r.Calificacion == 4),
            todas.Count(r => r.Calificacion == 3),
            todas.Count(r => r.Calificacion == 2),
            todas.Count(r => r.Calificacion == 1)
        );
    }

    // --------------------------------------------------------
    // GET /api/resenas/mis-resenas
    // --------------------------------------------------------
    [Authorize]
    [HttpGet("mis-resenas")]
    public async Task<ActionResult<List<ResenaDto>>> GetMisResenas()
    {
        var resenas = await _db.Resenas
            .Include(r => r.Producto)
            .Include(r => r.Usuario)
            .Include(r => r.Fotos)
            .Where(r => r.UsuarioId == CurrentUserId)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();

        return resenas.Select(MapResena).ToList();
    }

    // --------------------------------------------------------
    // GET /api/resenas/puede-resenar/{productoId}/{pedidoId}
    // Verifica si el usuario puede dejar reseña
    // --------------------------------------------------------
    [Authorize]
    [HttpGet("puede-resenar/{productoId:int}/{pedidoId:int}")]
    public async Task<ActionResult<object>> PuedeResenar(int productoId, int pedidoId)
    {
        // Verificar que el pedido es del usuario y está entregado
        var pedido = await _db.Pedidos
            .Include(p => p.Detalles)
            .FirstOrDefaultAsync(p => p.PedidoId == pedidoId && p.UsuarioId == CurrentUserId);

        if (pedido is null)
            return Ok(new { puede = false, razon = "Pedido no encontrado." });

        if (pedido.Estado != "Entregado")
            return Ok(new { puede = false, razon = "El pedido aún no ha sido entregado." });

        if (!pedido.Detalles.Any(d => d.ProductoId == productoId))
            return Ok(new { puede = false, razon = "Este producto no pertenece al pedido." });

        // Verificar si ya existe una reseña
        var yaExiste = await _db.Resenas
            .AnyAsync(r => r.ProductoId == productoId && r.UsuarioId == CurrentUserId);

        if (yaExiste)
            return Ok(new { puede = false, razon = "Ya has dejado una reseña para este producto." });

        return Ok(new { puede = true, razon = "" });
    }

    // --------------------------------------------------------
    // POST /api/resenas
    // --------------------------------------------------------
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ResenaDto>> Crear([FromBody] ResenaCrearDto dto)
    {
        // Validar pedido entregado y pertenencia
        var pedido = await _db.Pedidos
            .Include(p => p.Detalles)
            .FirstOrDefaultAsync(p => p.PedidoId == dto.PedidoId && p.UsuarioId == CurrentUserId);

        if (pedido is null)
            return BadRequest(new { message = "Pedido no encontrado." });

        if (pedido.Estado != "Entregado")
            return BadRequest(new { message = "Solo puede reseñar productos de pedidos entregados." });

        if (!pedido.Detalles.Any(d => d.ProductoId == dto.ProductoId))
            return BadRequest(new { message = "Este producto no pertenece al pedido." });

        // Verificar duplicado
        var yaExiste = await _db.Resenas
            .AnyAsync(r => r.ProductoId == dto.ProductoId && r.UsuarioId == CurrentUserId);
        if (yaExiste)
            return BadRequest(new { message = "Ya has dejado una reseña para este producto." });

        // Validar fotos
        if (dto.Fotos != null && dto.Fotos.Count > MaxFotosPorResena)
            return BadRequest(new { message = $"Máximo {MaxFotosPorResena} fotos permitidas." });

        // Moderación automática básica
        var contenidoInapropiado = ValidarContenido(dto.Titulo, dto.Descripcion);
        if (contenidoInapropiado != null)
            return BadRequest(new { message = contenidoInapropiado });

        var resena = new Resena
        {
            ProductoId = dto.ProductoId,
            UsuarioId = CurrentUserId,
            PedidoId = dto.PedidoId,
            Calificacion = dto.Calificacion,
            Titulo = dto.Titulo.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Estado = EstadoResena.Aprobada
        };

        // Agregar fotos
        if (dto.Fotos != null)
        {
            for (int i = 0; i < dto.Fotos.Count; i++)
            {
                var foto = dto.Fotos[i];
                if (foto.ImagenBase64.Length > MaxBase64Bytes)
                    return BadRequest(new { message = $"La foto {i + 1} excede el tamaño máximo de 2 MB." });

                resena.Fotos.Add(new ResenaFoto
                {
                    ImagenBase64 = foto.ImagenBase64,
                    ContentType = foto.ContentType ?? "image/jpeg",
                    OrdenVisual = i
                });
            }
        }

        _db.Resenas.Add(resena);
        await _db.SaveChangesAsync();

        var full = await _db.Resenas
            .Include(r => r.Producto)
            .Include(r => r.Usuario)
            .Include(r => r.Fotos)
            .FirstAsync(r => r.ResenaId == resena.ResenaId);

        return CreatedAtAction(nameof(GetPorProducto), new { productoId = resena.ProductoId }, MapResena(full));
    }

    // --------------------------------------------------------
    // PUT /api/resenas/{id}
    // --------------------------------------------------------
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ResenaDto>> Editar(int id, [FromBody] ResenaEditarDto dto)
    {
        var resena = await _db.Resenas
            .Include(r => r.Fotos)
            .Include(r => r.Producto)
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.ResenaId == id);

        if (resena is null) return NotFound();
        if (resena.UsuarioId != CurrentUserId && CurrentUserRole != "Administrador")
            return Forbid();

        // Moderación
        var contenidoInapropiado = ValidarContenido(dto.Titulo, dto.Descripcion);
        if (contenidoInapropiado != null)
            return BadRequest(new { message = contenidoInapropiado });

        resena.Calificacion = dto.Calificacion;
        resena.Titulo = dto.Titulo.Trim();
        resena.Descripcion = dto.Descripcion?.Trim();
        resena.FechaModificacion = DateTime.UtcNow;

        // Reemplazar fotos si se proporcionan nuevas
        if (dto.Fotos != null)
        {
            if (dto.Fotos.Count > MaxFotosPorResena)
                return BadRequest(new { message = $"Máximo {MaxFotosPorResena} fotos permitidas." });

            _db.ResenaFotos.RemoveRange(resena.Fotos);
            resena.Fotos.Clear();

            for (int i = 0; i < dto.Fotos.Count; i++)
            {
                var foto = dto.Fotos[i];
                if (foto.ImagenBase64.Length > MaxBase64Bytes)
                    return BadRequest(new { message = $"La foto {i + 1} excede el tamaño máximo de 2 MB." });

                resena.Fotos.Add(new ResenaFoto
                {
                    ImagenBase64 = foto.ImagenBase64,
                    ContentType = foto.ContentType ?? "image/jpeg",
                    OrdenVisual = i
                });
            }
        }

        await _db.SaveChangesAsync();
        return MapResena(resena);
    }

    // --------------------------------------------------------
    // DELETE /api/resenas/{id}
    // --------------------------------------------------------
    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var resena = await _db.Resenas.FindAsync(id);
        if (resena is null) return NotFound();
        if (resena.UsuarioId != CurrentUserId && CurrentUserRole != "Administrador")
            return Forbid();

        _db.Resenas.Remove(resena);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------------------------------------
    // Admin: GET /api/resenas/admin?estado=Reportada&pagina=1
    // --------------------------------------------------------
    [Authorize(Roles = "Administrador")]
    [HttpGet("admin")]
    public async Task<ActionResult<ResenasPaginadasDto>> GetAdmin(
        [FromQuery] string? estado, [FromQuery] int pagina = 1, [FromQuery] int porPagina = 20)
    {
        var query = _db.Resenas
            .Include(r => r.Producto)
            .Include(r => r.Usuario)
            .Include(r => r.Fotos)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado) && Enum.TryParse<EstadoResena>(estado, out var est))
            query = query.Where(r => r.Estado == est);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(r => r.FechaCreacion)
            .Skip((pagina - 1) * porPagina).Take(porPagina).ToListAsync();

        var todasAprobadas = await _db.Resenas.Where(r => r.Estado == EstadoResena.Aprobada).ToListAsync();
        var resumen = new ResenaResumenDto(
            todasAprobadas.Count > 0 ? Math.Round(todasAprobadas.Average(r => r.Calificacion), 1) : 0,
            todasAprobadas.Count,
            todasAprobadas.Count(r => r.Calificacion == 5),
            todasAprobadas.Count(r => r.Calificacion == 4),
            todasAprobadas.Count(r => r.Calificacion == 3),
            todasAprobadas.Count(r => r.Calificacion == 2),
            todasAprobadas.Count(r => r.Calificacion == 1)
        );

        return new ResenasPaginadasDto(items.Select(MapResena).ToList(), total, pagina, porPagina, resumen);
    }

    // --------------------------------------------------------
    // Admin: PUT /api/resenas/{id}/moderar
    // --------------------------------------------------------
    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}/moderar")]
    public async Task<IActionResult> Moderar(int id, [FromBody] ResenaModeracionDto dto)
    {
        var resena = await _db.Resenas.FindAsync(id);
        if (resena is null) return NotFound();

        if (!Enum.TryParse<EstadoResena>(dto.Estado, out var nuevoEstado))
            return BadRequest(new { message = "Estado no válido. Use: Aprobada, Rechazada, Reportada, Pendiente." });

        resena.Estado = nuevoEstado;
        resena.MotivoRechazo = dto.MotivoRechazo;
        resena.FechaModificacion = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // --------------------------------------------------------
    // POST /api/resenas/{id}/reportar
    // Cualquier usuario autenticado puede reportar
    // --------------------------------------------------------
    [Authorize]
    [HttpPost("{id:int}/reportar")]
    public async Task<IActionResult> Reportar(int id)
    {
        var resena = await _db.Resenas.FindAsync(id);
        if (resena is null) return NotFound();

        resena.Estado = EstadoResena.Reportada;
        resena.FechaModificacion = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Reseña reportada. Será revisada por un administrador." });
    }

    // --------------------------------------------------------
    // Utilidades
    // --------------------------------------------------------
    private static ResenaDto MapResena(Resena r) => new(
        r.ResenaId,
        r.ProductoId,
        r.Producto?.Nombre ?? "",
        r.UsuarioId,
        r.Usuario?.Nombre ?? "Anónimo",
        r.PedidoId,
        r.Calificacion,
        r.Titulo,
        r.Descripcion,
        r.Estado.ToString(),
        r.FechaCreacion,
        r.FechaModificacion,
        r.MotivoRechazo,
        r.Fotos.OrderBy(f => f.OrdenVisual).Select(f => new ResenaFotoDto(
            f.ResenaFotoId, f.ImagenBase64, f.ContentType, f.OrdenVisual
        )).ToList()
    );

    /// <summary>
    /// Moderación automática: rechaza contenido con palabras ofensivas.
    /// </summary>
    private static string? ValidarContenido(string titulo, string? descripcion)
    {
        var texto = $"{titulo} {descripcion}".ToLowerInvariant();

        // Lista de palabras prohibidas (spam / ofensivo)
        var prohibidas = new[] {
            "spam", "estafa", "fraude", "maldito", "idiota", "imbécil", "basura humana",
            "http://", "https://", "www.", ".com/", "compra aquí", "click aquí"
        };

        foreach (var p in prohibidas)
        {
            if (texto.Contains(p))
                return $"El contenido contiene palabras o enlaces no permitidos.";
        }

        // Detectar repetición excesiva (spam)
        if (Regex.IsMatch(texto, @"(.)\1{9,}"))
            return "El contenido parece contener spam (caracteres repetidos).";

        return null;
    }
}
