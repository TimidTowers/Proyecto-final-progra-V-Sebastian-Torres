using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Producto del catálogo.
/// </summary>
public class Producto
{
    [Key]
    public int ProductoId { get; set; }

    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Descripcion { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Precio { get; set; }

    public int Stock { get; set; }

    /// <summary>Umbral configurable que dispara alertas de stock bajo.</summary>
    public int StockMinimo { get; set; } = 5;

    [MaxLength(500)]
    public string? ImagenUrl { get; set; }

    public int Popularidad { get; set; } = 0;

    public bool Activo { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
}
