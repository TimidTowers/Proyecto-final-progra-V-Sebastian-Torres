using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Factura electrónica ligada a un pedido, con numeración consecutiva y
/// desglose de impuestos para cumplir con normativa costarricense.
/// </summary>
public class Factura
{
    [Key]
    public int FacturaId { get; set; }

    /// <summary>Número consecutivo (formato FE-0000000001).</summary>
    [Required, MaxLength(30)]
    public string NumeroConsecutivo { get; set; } = string.Empty;

    /// <summary>Clave numérica (50 dígitos) para compatibilidad con DGT.</summary>
    [MaxLength(60)]
    public string? ClaveNumerica { get; set; }

    public int PedidoId { get; set; }
    public Pedido? Pedido { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Descuento { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal BaseImponible { get; set; }

    /// <summary>IVA del 13% (Costa Rica).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal Iva { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CostoEnvio { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    public DateTime FechaEmision { get; set; } = DateTime.UtcNow;
}
