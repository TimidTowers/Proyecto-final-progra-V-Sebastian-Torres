using System.ComponentModel.DataAnnotations;

namespace TiendaVirtual.Api.Dtos;

public record ProductoDto(
    int ProductoId,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    string? ImagenUrl,
    int Popularidad,
    int CategoriaId,
    string CategoriaNombre
);

public record ProductoCreateDto(
    [Required] string Nombre,
    string? Descripcion,
    [Range(0, double.MaxValue)] decimal Precio,
    [Range(0, int.MaxValue)] int Stock,
    string? ImagenUrl,
    [Range(1, int.MaxValue)] int CategoriaId
);

public record CarritoItemDto(
    int ProductoId,
    string NombreProducto,
    string? ImagenUrl,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal
);

public record AgregarCarritoDto(
    [Range(1, int.MaxValue)] int ProductoId,
    [Range(1, int.MaxValue)] int Cantidad
);

public record PedidoCrearDto(
    List<AgregarCarritoDto> Items,
    string? DireccionEnvio,
    string MetodoPago,
    bool EsProforma
);

public record PedidoDto(
    int PedidoId,
    DateTime Fecha,
    decimal Total,
    string Estado,
    string MetodoPago,
    string? DireccionEnvio,
    bool EsProforma,
    List<PedidoDetalleDto> Detalles
);

public record PedidoDetalleDto(
    int ProductoId,
    string NombreProducto,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal
);
