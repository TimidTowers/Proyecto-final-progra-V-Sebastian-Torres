using System.ComponentModel.DataAnnotations;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Dirección de entrega del usuario, con coordenadas para cálculo de tarifa
/// de delivery (distancia desde la tienda).
/// </summary>
public class Direccion
{
    [Key]
    public int DireccionId { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    [Required, MaxLength(80)]
    public string Provincia { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Canton { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Distrito { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string Detalle { get; set; } = string.Empty;

    public double Latitud { get; set; }
    public double Longitud { get; set; }

    public bool Predeterminada { get; set; } = false;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
