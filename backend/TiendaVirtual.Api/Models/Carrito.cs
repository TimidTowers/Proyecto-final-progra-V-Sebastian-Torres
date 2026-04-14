using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TiendaVirtual.Api.Models;

public class CarritoItem
{
    [Key]
    public int CarritoItemId { get; set; }

    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public int ProductoId { get; set; }
    public Producto? Producto { get; set; }

    public int Cantidad { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrecioUnitario { get; set; }

    public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;
}
