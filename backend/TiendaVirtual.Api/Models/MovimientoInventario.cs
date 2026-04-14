using System.ComponentModel.DataAnnotations;

namespace TiendaVirtual.Api.Models;

/// <summary>
/// Tipo de transacción registrada en el historial de inventario.
/// </summary>
public enum TipoMovimiento
{
    Entrada = 1,   // reabastecimiento, devolución
    Salida = 2,    // venta, ajuste negativo
    Ajuste = 3     // corrección manual
}

/// <summary>
/// Línea del historial de movimientos de inventario. Toda entrada/salida de stock
/// debe registrarse aquí para auditoría.
/// </summary>
public class MovimientoInventario
{
    [Key]
    public int MovimientoId { get; set; }

    public int ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public TipoMovimiento Tipo { get; set; }

    public int Cantidad { get; set; }

    /// <summary>Stock anterior al movimiento, para auditoría.</summary>
    public int StockAnterior { get; set; }

    /// <summary>Stock resultante después del movimiento.</summary>
    public int StockNuevo { get; set; }

    [MaxLength(250)]
    public string? Motivo { get; set; }

    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
}
