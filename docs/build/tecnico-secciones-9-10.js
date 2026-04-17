// Secciones 9-10: Validación con stakeholders y Trazabilidad
const { p, h1, h2, h3, bullet, table } = require('./tecnico-helpers');

const sec9 = [
  h1('9. Validación con stakeholders'),
  h2('9.1 Estrategia de validación'),
  p('La validación con stakeholders se realizó en tres ciclos iterativos durante el desarrollo. En cada ciclo se entregó un incremento del producto y se recolectó retroalimentación mediante demostraciones, entrevistas estructuradas y observación de uso real. Las observaciones se priorizaron y se incorporaron al backlog del siguiente sprint.'),
  h2('9.2 Sesiones de validación realizadas'),
  table(
    ['Sesión', 'Fecha', 'Stakeholder', 'Alcance validado', 'Resultado'],
    [
      ['V-01', '2026-02-25', 'Profesor del curso', 'Modelo de datos y arquitectura', 'Aprobado con sugerencia de agregar índice en Pedidos.'],
      ['V-02', '2026-03-10', 'Compañeros de equipo', 'Catálogo, carrito y checkout', 'Aprobado. Sugerencia: mostrar costo de envío antes del paso final.'],
      ['V-03', '2026-03-22', 'Cliente piloto (familiar)', 'Experiencia de compra completa', 'Aprobado. Sugerencia: confirmación al cancelar pedido.'],
      ['V-04', '2026-04-05', 'Administrador piloto', 'Panel administrativo y reportes', 'Aprobado. Sugerencia: gráficos de stock bajo más visibles.'],
      ['V-05', '2026-04-10', 'Profesor del curso', 'Demo final', 'Aprobado con observaciones menores incorporadas en v2.0.'],
      ['V-06', '2026-04-14', 'Cliente piloto (familiar)', 'Multi-imagen y reseñas', 'Aprobado. Funcionalidad considerada de alto valor.'],
      ['V-07', '2026-04-15', 'Administrador piloto', 'Confirmación logout y cancelación', 'Aprobado.'],
    ],
    [800, 1300, 2200, 2700, 2360]
  ),
  h2('9.3 Cambios derivados de la validación'),
  bullet('Se agregó confirmación modal al cancelar un pedido (V-03).'),
  bullet('Se mejoró la visibilidad de las alertas de stock bajo en el dashboard (V-04).'),
  bullet('Se reorganizó el flujo de checkout para mostrar el costo de envío antes (V-02).'),
  bullet('Se implementó la galería multi-imagen para productos (V-06).'),
  bullet('Se agregó la confirmación al cerrar sesión para evitar pérdidas accidentales (V-07).'),
  bullet('Se incluyó un índice compuesto en Pedidos para mejorar reportes (V-01).'),
  h2('9.4 Aceptación final'),
  p('Las siete sesiones de validación concluyeron con aprobación de los stakeholders involucrados. Los hallazgos críticos fueron incorporados antes del corte de la versión 2.0 entregada el 16 de abril de 2026. Los pendientes considerados de baja prioridad (recuperación automática de contraseña por correo, integración con pasarela de pago real) quedaron documentados en el backlog para futuras versiones.'),
];

const sec10 = [
  h1('10. Trazabilidad de cambios'),
  h2('10.1 Matriz de trazabilidad requerimiento → caso de uso → módulo'),
  table(
    ['Requerimiento', 'Caso de uso', 'Módulo / Componente'],
    [
      ['RF-01', 'CU-01 Registrar cliente', 'AuthController + Usuario'],
      ['RF-02', 'CU-02 Iniciar sesión', 'AuthController + JwtService'],
      ['RF-03', 'CU-01, CU-02', 'BCrypt en AuthService'],
      ['RF-04', 'Todos', 'Atributo Authorize(Roles=) en controladores'],
      ['RF-05', 'CU-12 Cambiar contraseña', 'AuthController.CambiarPassword'],
      ['RF-06', 'CU-06 Explorar catálogo', 'ProductosController.Get'],
      ['RF-07', 'CU-07 Filtrar por categoría', 'CategoriasController + Producto'],
      ['RF-08', 'CU-05 Gestionar producto', 'ProductosController + ProductoImagen'],
      ['RF-09', 'CU-06', 'Producto.StockBajo + Producto.Stock'],
      ['RF-10', 'CU-06', 'ProductosController.Get parámetro orden'],
      ['RF-11', 'CU-08 Gestionar carrito', 'CarritoController + Carrito'],
      ['RF-12', 'CU-08, CU-03', 'Validación de stock en backend'],
      ['RF-13', 'CU-03 Realizar compra', 'FacturacionService.Calcular'],
      ['RF-14', 'CU-09 Aplicar cupón', 'CuponesController.Validar'],
      ['RF-15', 'CU-03', 'Frontend Leaflet + DireccionesController'],
      ['RF-16', 'CU-03', 'EnvioService.CalcularDistancia'],
      ['RF-17', 'CU-03', 'Configuración MontoEnvioGratis'],
      ['RF-18', 'CU-03', 'FacturacionService.GenerarFactura'],
      ['RF-19', 'CU-10 Descargar factura', 'Frontend jsPDF'],
      ['RF-20', 'CU-04 Cancelar pedido', 'PedidosController.Cancelar'],
      ['RF-21', 'CU-11 Ver mis pedidos', 'PedidosController.GetMisPedidos'],
      ['RF-22', 'CU-13 Cambiar estado pedido', 'PedidosController.CambiarEstado'],
      ['RF-23', 'CU-14 Movimiento inventario', 'InventarioController'],
      ['RF-24', 'CU-15 Alertas stock', 'InventarioController.Alertas'],
      ['RF-25', 'CU-16 Publicar reseña', 'ResenasController.Crear'],
      ['RF-26', 'CU-17 Moderar reseña', 'ResenasController.Aprobar/Rechazar'],
      ['RF-27', 'CU-18 Ver dashboard', 'ReportesController.Dashboard'],
      ['RF-28', 'CU-19 Exportar reporte', 'Frontend jsPDF + xlsx'],
    ],
    [2200, 3700, 3460]
  ),
  h2('10.2 Historial de cambios del sistema'),
  table(
    ['Versión', 'Fecha', 'Cambios principales', 'Requerimientos cubiertos'],
    [
      ['1.0', '2026-02-15', 'Versión inicial: catálogo, carrito, checkout y facturación.', 'RF-01 a RF-19'],
      ['1.1', '2026-03-02', 'Cupones de descuento + dashboard administrativo.', 'RF-14, RF-27, RF-28'],
      ['1.2', '2026-03-18', 'Inventario auditado con alertas de stock bajo.', 'RF-23, RF-24'],
      ['1.5', '2026-04-01', 'Reseñas con fotografías + moderación.', 'RF-25, RF-26'],
      ['2.0', '2026-04-16', 'Galería multi-imagen, confirmación cancelar y logout, mejoras UX.', 'RF-08 mejorado, RF-20 mejorado'],
    ],
    [1100, 1500, 4500, 2260]
  ),
  h2('10.3 Información del documento'),
  table(
    ['Atributo', 'Valor'],
    [
      ['Título', 'Documento Técnico - Tienda Virtual CR'],
      ['Versión', '2.0'],
      ['Fecha', '16 de abril de 2026'],
      ['Autor', 'Equipo de Desarrollo Tienda Virtual'],
      ['Idioma', 'Español (Costa Rica)'],
      ['Páginas', 'Ver índice'],
      ['Distribución', 'Interna - uso académico'],
      ['Vigencia', 'Hasta la siguiente revisión semestral'],
    ],
    [3000, 6360]
  ),
];

module.exports = { sec9, sec10 };
