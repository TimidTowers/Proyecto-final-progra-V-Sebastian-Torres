using System.ComponentModel.DataAnnotations;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Dtos;

// ============================================================
// Categorías jerárquicas
// ============================================================
public record CategoriaDto(
    int CategoriaId,
    string Nombre,
    string? Descripcion,
    string? Icono,
    bool Activo,
    int? CategoriaPadreId,
    List<CategoriaDto> Subcategorias
);

public record CategoriaCreateDto(
    [Required, StringLength(80, MinimumLength = 2)] string Nombre,
    [StringLength(250)] string? Descripcion,
    [StringLength(250)] string? Icono,
    int? CategoriaPadreId
);

// ============================================================
// Producto extendido (con stock mínimo)
// ============================================================
public record ProductoDetalleDto(
    int ProductoId,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int Stock,
    int StockMinimo,
    string? ImagenUrl,
    int Popularidad,
    int CategoriaId,
    string CategoriaNombre,
    bool StockBajo
);

public record ProductoUpsertDto(
    [Required, StringLength(150, MinimumLength = 2)] string Nombre,
    [StringLength(1000)] string? Descripcion,
    [Range(0, 999999999)] decimal Precio,
    [Range(0, 100000)] int Stock,
    [Range(0, 100000)] int StockMinimo,
    [StringLength(500)] string? ImagenUrl,
    [Range(1, int.MaxValue)] int CategoriaId
);

// ============================================================
// Cupones
// ============================================================
public record CuponDto(
    int CuponId,
    string Codigo,
    string? Descripcion,
    TipoDescuento Tipo,
    decimal Valor,
    DateTime FechaInicio,
    DateTime FechaFin,
    int LimiteUso,
    int UsosActuales,
    decimal MontoMinimo,
    int? ProductoId,
    bool Activo
);

public record CuponUpsertDto(
    [Required, StringLength(30, MinimumLength = 3)] string Codigo,
    [StringLength(200)] string? Descripcion,
    [Required] TipoDescuento Tipo,
    [Range(0, 999999999)] decimal Valor,
    DateTime FechaInicio,
    DateTime FechaFin,
    [Range(0, 999999)] int LimiteUso,
    [Range(0, 999999999)] decimal MontoMinimo,
    int? ProductoId,
    bool Activo
);

public record ValidarCuponRequest(
    [Required] string Codigo,
    [Range(0, 999999999)] decimal Subtotal,
    List<int>? ProductoIds
);

public record ValidarCuponResponse(
    bool Valido,
    string? Mensaje,
    decimal Descuento,
    CuponDto? Cupon
);

// ============================================================
// Inventario
// ============================================================
public record MovimientoInventarioDto(
    int MovimientoId,
    int ProductoId,
    string NombreProducto,
    TipoMovimiento Tipo,
    int Cantidad,
    int StockAnterior,
    int StockNuevo,
    string? Motivo,
    DateTime Fecha,
    string? UsuarioNombre
);

public record ReabastecerRequest(
    [Range(1, int.MaxValue)] int ProductoId,
    [Range(1, 100000)] int Cantidad,
    [StringLength(250)] string? Motivo
);

public record AjusteStockRequest(
    [Range(1, int.MaxValue)] int ProductoId,
    [Range(-100000, 100000)] int Delta,
    [StringLength(250)] string? Motivo
);

public record AlertaStockDto(
    int ProductoId,
    string Nombre,
    int Stock,
    int StockMinimo,
    string CategoriaNombre
);

// Reabastecimiento masivo
public record ReabastecerMasivoItem(
    [Range(1, int.MaxValue)] int ProductoId,
    [Range(1, 100000)] int Cantidad,
    [StringLength(250)] string? Motivo
);

public record ReabastecerMasivoRequest(
    [Required] List<ReabastecerMasivoItem> Items
);

public record ReabastecerMasivoResultItem(
    int ProductoId,
    string Nombre,
    int StockAnterior,
    int StockNuevo,
    bool Exitoso,
    string? Error
);

// ============================================================
// Direcciones
// ============================================================
public record DireccionDto(
    int DireccionId,
    string Provincia,
    string Canton,
    string Distrito,
    string Detalle,
    double Latitud,
    double Longitud,
    bool Predeterminada
);

public record DireccionUpsertDto(
    [Required, StringLength(80)] string Provincia,
    [Required, StringLength(80)] string Canton,
    [Required, StringLength(80)] string Distrito,
    [Required, StringLength(500)] string Detalle,
    [Range(-90, 90)] double Latitud,
    [Range(-180, 180)] double Longitud,
    bool Predeterminada
);

public record CostoEnvioRequest(
    [Range(-90, 90)] double Latitud,
    [Range(-180, 180)] double Longitud,
    [Range(0, 999999999)] decimal Subtotal
);

public record CostoEnvioResponse(
    double DistanciaKm,
    decimal CostoEnvio,
    bool EnvioGratis,
    bool DentroDeCostaRica,
    string? Mensaje
);

// ============================================================
// Pedido mejorado con IVA, cupón, envío y factura
// ============================================================
public record PedidoCrearV2Dto(
    List<AgregarCarritoDto> Items,
    string? DireccionEnvio,
    double? Latitud,
    double? Longitud,
    string MetodoPago,
    bool EsProforma,
    string? CodigoCupon,
    decimal? CostoEnvioCalculado
);

public record PedidoV2Dto(
    int PedidoId,
    DateTime Fecha,
    decimal Subtotal,
    decimal Iva,
    decimal Descuento,
    decimal CostoEnvio,
    decimal Total,
    string Estado,
    string MetodoPago,
    string? DireccionEnvio,
    double? Latitud,
    double? Longitud,
    bool EsProforma,
    string? CodigoCupon,
    int? FacturaId,
    string? NumeroFactura,
    List<PedidoDetalleDto> Detalles
);

// ============================================================
// Factura
// ============================================================
public record FacturaDto(
    int FacturaId,
    string NumeroConsecutivo,
    string? ClaveNumerica,
    int PedidoId,
    int UsuarioId,
    string UsuarioNombre,
    string? UsuarioEmail,
    decimal Subtotal,
    decimal Descuento,
    decimal BaseImponible,
    decimal Iva,
    decimal CostoEnvio,
    decimal Total,
    DateTime FechaEmision,
    List<PedidoDetalleDto> Detalles
);

// ============================================================
// Dashboard de reportes
// ============================================================
public record DashboardDto(
    decimal TotalVendido,
    int CantidadPedidos,
    decimal TicketPromedio,
    int ClientesActivos,
    int ProductosStockBajo,
    List<SerieTemporalPunto> VentasPorDia,
    List<ProductoTopDto> ProductosTop,
    List<CategoriaTopDto> CategoriasTop,
    List<MetodoPagoDto> PorMetodoPago,
    List<EstadoPedidoDto> PorEstado
);

public record SerieTemporalPunto(string Fecha, decimal Monto, int Cantidad);
public record ProductoTopDto(int ProductoId, string Nombre, int Unidades, decimal Total);
public record CategoriaTopDto(int CategoriaId, string Nombre, int Unidades, decimal Total);
public record MetodoPagoDto(string Metodo, decimal Total, int Cantidad);
public record EstadoPedidoDto(string Estado, decimal Total, int Cantidad);

// ============================================================
// Reseñas de productos
// ============================================================
public record ResenaDto(
    int ResenaId,
    int ProductoId,
    string NombreProducto,
    int UsuarioId,
    string NombreUsuario,
    int PedidoId,
    int Calificacion,
    string Titulo,
    string? Descripcion,
    string Estado,
    DateTime FechaCreacion,
    DateTime? FechaModificacion,
    string? MotivoRechazo,
    List<ResenaFotoDto> Fotos
);

public record ResenaFotoDto(
    int ResenaFotoId,
    string ImagenBase64,
    string ContentType,
    int OrdenVisual
);

public record ResenaCrearDto(
    [Required, Range(1, int.MaxValue)] int ProductoId,
    [Required, Range(1, int.MaxValue)] int PedidoId,
    [Required, Range(1, 5)] int Calificacion,
    [Required, StringLength(150, MinimumLength = 3)] string Titulo,
    [StringLength(2000)] string? Descripcion,
    List<ResenaFotoCrearDto>? Fotos
);

public record ResenaFotoCrearDto(
    [Required] string ImagenBase64,
    [StringLength(20)] string ContentType
);

public record ResenaEditarDto(
    [Required, Range(1, 5)] int Calificacion,
    [Required, StringLength(150, MinimumLength = 3)] string Titulo,
    [StringLength(2000)] string? Descripcion,
    List<ResenaFotoCrearDto>? Fotos
);

public record ResenaModeracionDto(
    [Required] string Estado,
    [StringLength(500)] string? MotivoRechazo
);

public record ResenaResumenDto(
    double PromedioCalificacion,
    int TotalResenas,
    int Estrellas5,
    int Estrellas4,
    int Estrellas3,
    int Estrellas2,
    int Estrellas1
);

public record ResenasPaginadasDto(
    List<ResenaDto> Resenas,
    int Total,
    int Pagina,
    int PorPagina,
    ResenaResumenDto Resumen
);
