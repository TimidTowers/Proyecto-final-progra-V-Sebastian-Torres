using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Tipos de descuento soportados por el módulo de cupones.
/// </summary>
public enum TipoDescuento
{
    Porcentaje = 1,
    MontoFijo = 2
}

/// <summary>
/// Cupón de descuento. Puede ser global o asociado a un producto específico,
/// con fechas de validez, monto mínimo de compra y límite de usos.
/// </summary>
public class Cupon
{
    [Key]
    public int CuponId { get; set; }

    [Required, MaxLength(30)]
    public string Codigo { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Descripcion { get; set; }

    public TipoDescuento Tipo { get; set; } = TipoDescuento.Porcentaje;

    /// <summary>Porcentaje (0-100) o monto fijo en colones, según <see cref="Tipo"/>.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal Valor { get; set; }

    public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
    public DateTime FechaFin { get; set; } = DateTime.UtcNow.AddMonths(1);

    public int LimiteUso { get; set; } = 0; // 0 = ilimitado
    public int UsosActuales { get; set; } = 0;

    /// <summary>Monto mínimo de compra para poder aplicar el cupón (en colones).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal MontoMinimo { get; set; } = 0;

    /// <summary>Si no es null, el cupón solo aplica a ese producto.</summary>
    public int? ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public bool Activo { get; set; } = true;
}
