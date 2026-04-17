using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Imagen perteneciente a la galería de un producto.
/// Soporta tanto URLs externas (CDN) como contenido base64 cargado desde el
/// dispositivo. Cada producto admite hasta 5 imágenes ordenadas; una se marca
/// como principal y se replica en <see cref="Producto.ImagenUrl"/>.
/// </summary>
public class ProductoImagen
{
    [Key]
    public int ProductoImagenId { get; set; }

    public int ProductoId { get; set; }
    public Producto? Producto { get; set; }

    /// <summary>URL externa o data URI base64 (máx. ~2 MB).</summary>
    [Required]
    [Column(TypeName = "nvarchar(max)")]
    public string Url { get; set; } = string.Empty;

    /// <summary>Posición en la galería (0 = primera).</summary>
    public int Orden { get; set; } = 0;

    /// <summary>True si esta es la imagen principal mostrada en listados.</summary>
    public bool EsPrincipal { get; set; } = false;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
