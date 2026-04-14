using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

public enum EstadoResena
{
    Pendiente = 0,
    Aprobada = 1,
    Rechazada = 2,
    Reportada = 3
}

/// <summary>
/// Reseña de un producto por un cliente después de la entrega.
/// Límite: una reseña por producto por cliente.
/// </summary>
public class Resena
{
    [Key]
    public int ResenaId { get; set; }

    [Required]
    public int ProductoId { get; set; }
    public Producto? Producto { get; set; }

    [Required]
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public int PedidoId { get; set; }
    public Pedido? Pedido { get; set; }

    [Range(1, 5)]
    public int Calificacion { get; set; }

    [Required, MaxLength(150)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Descripcion { get; set; }

    public EstadoResena Estado { get; set; } = EstadoResena.Aprobada;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public DateTime? FechaModificacion { get; set; }

    /// <summary>Motivo de rechazo (admin).</summary>
    [MaxLength(500)]
    public string? MotivoRechazo { get; set; }

    public List<ResenaFoto> Fotos { get; set; } = new();
}

/// <summary>
/// Foto adjunta a una reseña. Almacenada como base64 comprimida.
/// Máximo 5 fotos por reseña.
/// </summary>
public class ResenaFoto
{
    [Key]
    public int ResenaFotoId { get; set; }

    public int ResenaId { get; set; }
    public Resena? Resena { get; set; }

    /// <summary>Imagen en base64 (comprimida en frontend).</summary>
    [Required]
    public string ImagenBase64 { get; set; } = string.Empty;

    [MaxLength(20)]
    public string ContentType { get; set; } = "image/jpeg";

    public int OrdenVisual { get; set; }

    public DateTime FechaSubida { get; set; } = DateTime.UtcNow;
}
