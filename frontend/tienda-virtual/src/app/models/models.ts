export interface Usuario {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  token: string;
  expiracion: string;
}

export interface Categoria {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
  categoriaPadreId?: number | null;
  subcategorias?: Categoria[];
}

export interface Producto {
  productoId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  imagenUrl?: string;
  popularidad: number;
  categoriaId: number;
  categoriaNombre: string;
  stockBajo?: boolean;
}

export interface CarritoItem {
  productoId: number;
  nombreProducto: string;
  imagenUrl?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoDetalle {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  pedidoId: number;
  fecha: string;
  subtotal: number;
  iva: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  estado: string;
  metodoPago: string;
  direccionEnvio?: string;
  latitud?: number;
  longitud?: number;
  esProforma: boolean;
  codigoCupon?: string;
  facturaId?: number;
  numeroFactura?: string;
  detalles: PedidoDetalle[];
}

export type TipoDescuento = 'Porcentaje' | 'MontoFijo';

export interface Cupon {
  cuponId: number;
  codigo: string;
  descripcion?: string;
  tipo: TipoDescuento;
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  limiteUso: number;
  usosActuales: number;
  montoMinimo: number;
  productoId?: number | null;
  activo: boolean;
}

export interface ValidarCuponResponse {
  valido: boolean;
  mensaje?: string;
  descuento: number;
  cupon?: Cupon;
}

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste';

export interface MovimientoInventario {
  movimientoId: number;
  productoId: number;
  nombreProducto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo?: string;
  fecha: string;
  usuarioNombre?: string;
}

export interface AlertaStock {
  productoId: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
  categoriaNombre: string;
}

export interface Direccion {
  direccionId: number;
  provincia: string;
  canton: string;
  distrito: string;
  detalle: string;
  latitud: number;
  longitud: number;
  predeterminada: boolean;
}

export interface CostoEnvioResponse {
  distanciaKm: number;
  costoEnvio: number;
  envioGratis: boolean;
  dentroDeCostaRica: boolean;
  mensaje?: string;
}

export interface Factura {
  facturaId: number;
  numeroConsecutivo: string;
  claveNumerica?: string;
  pedidoId: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioEmail?: string;
  subtotal: number;
  descuento: number;
  baseImponible: number;
  iva: number;
  costoEnvio: number;
  total: number;
  fechaEmision: string;
  detalles: PedidoDetalle[];
}

// ============ Reseñas ============
export interface ResenaFoto {
  resenaFotoId: number;
  imagenBase64: string;
  contentType: string;
  ordenVisual: number;
}

export interface Resena {
  resenaId: number;
  productoId: number;
  nombreProducto: string;
  usuarioId: number;
  nombreUsuario: string;
  pedidoId: number;
  calificacion: number;
  titulo: string;
  descripcion?: string;
  estado: string;
  fechaCreacion: string;
  fechaModificacion?: string;
  motivoRechazo?: string;
  fotos: ResenaFoto[];
}

export interface ResenaResumen {
  promedioCalificacion: number;
  totalResenas: number;
  estrellas5: number;
  estrellas4: number;
  estrellas3: number;
  estrellas2: number;
  estrellas1: number;
}

export interface ResenasPaginadas {
  resenas: Resena[];
  total: number;
  pagina: number;
  porPagina: number;
  resumen: ResenaResumen;
}

export interface Dashboard {
  totalVendido: number;
  cantidadPedidos: number;
  ticketPromedio: number;
  clientesActivos: number;
  productosStockBajo: number;
  ventasPorDia: { fecha: string; monto: number; cantidad: number }[];
  productosTop: { productoId: number; nombre: string; unidades: number; total: number }[];
  categoriasTop: { categoriaId: number; nombre: string; unidades: number; total: number }[];
  porMetodoPago: { metodo: string; total: number; cantidad: number }[];
  porEstado: { estado: string; total: number; cantidad: number }[];
}
