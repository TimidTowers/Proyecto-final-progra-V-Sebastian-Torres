using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Pedido completo incluyendo subtotal, IVA 13%, descuento aplicado y costo de envío.
/// </summary>
public class Pedido
{
    [Key]
    public int PedidoId { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Iva { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Descuento { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal CostoEnvio { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    [MaxLength(30)]
    public string Estado { get; set; } = "Pendiente"; // Pendiente, Confirmado, Enviado, Entregado, Cancelado, Proforma

    [MaxLength(30)]
    public string MetodoPago { get; set; } = "Simulado";

    [MaxLength(250)]
    public string? DireccionEnvio { get; set; }

    public double? Latitud { get; set; }
    public double? Longitud { get; set; }

    public bool EsProforma { get; set; } = false;

    public int? CuponId { get; set; }
    public Cupon? Cupon { get; set; }

    public ICollection<PedidoDetalle> Detalles { get; set; } = new List<PedidoDetalle>();

    public Factura? Factura { get; set; }
}

public class PedidoDetalle
{
    [Key]
    public int PedidoDetalleId { get; set; }

    public int PedidoId { get; set; }
    public Pedido? Pedido { get; set; }

    public int ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public int Cantidad { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecioUnitario { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }
}
