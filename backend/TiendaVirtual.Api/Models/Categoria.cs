using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Categoría del catálogo con soporte jerárquico (self-reference para subcategorías).
/// </summary>
public class Categoria
{
    [Key]
    public int CategoriaId { get; set; }

    [Required, MaxLength(80)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Descripcion { get; set; }

    [MaxLength(250)]
    public string? Icono { get; set; }

    public bool Activo { get; set; } = true;

    /// <summary>Id de la categoría padre. null si es una categoría raíz.</summary>
    public int? CategoriaPadreId { get; set; }

    [ForeignKey(nameof(CategoriaPadreId))]
    public Categoria? CategoriaPadre { get; set; }

    public ICollection<Categoria> Subcategorias { get; set; } = new List<Categoria>();

    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
