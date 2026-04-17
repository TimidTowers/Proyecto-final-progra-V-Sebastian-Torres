// Generador del Manual de Usuario - Tienda Virtual CR
// Salida: ../MANUAL_USUARIO.docx
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, PageNumber, PageBreak, TabStopType, TabStopPosition,
  TableOfContents, PageOrientation
} = require('docx');

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const CELL_MARGINS = { top: 80, bottom: 80, left: 120, right: 120 };

// Utilidades ----------------------------------------------------
const p = (text, opts = {}) => new Paragraph({
  spacing: { line: 360, after: 120 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  ...opts.para,
  children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size || 24, color: opts.color, font: 'Arial' })]
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  pageBreakBefore: true,
  children: [new TextRun({ text, bold: true, size: 36, color: '1F3864', font: 'Arial' })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text, bold: true, size: 28, color: '2E75B6', font: 'Arial' })]
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 120 },
  children: [new TextRun({ text, bold: true, size: 26, color: '2E75B6', font: 'Arial' })]
});

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { line: 320, after: 60 },
  children: [new TextRun({ text, size: 24, font: 'Arial' })]
});

const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { line: 320, after: 60 },
  children: [new TextRun({ text, size: 24, font: 'Arial' })]
});

const code = (text) => new Paragraph({
  spacing: { line: 280, after: 60 },
  shading: { fill: 'F2F2F2', type: ShadingType.CLEAR },
  children: [new TextRun({ text, size: 20, font: 'Consolas' })]
});

// Tabla helper --------------------------------------------------
function table(headers, rows, widths) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: '1F3864', type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 22, font: 'Arial' })]
      })]
    }))
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      borders: BORDERS,
      width: { size: widths[i], type: WidthType.DXA },
      shading: ri % 2 === 0 ? { fill: 'FFFFFF', type: ShadingType.CLEAR } : { fill: 'F4F8FB', type: ShadingType.CLEAR },
      margins: CELL_MARGINS,
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 22, font: 'Arial' })] })]
    }))
  }));
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...dataRows]
  });
}

// ===============================================================
// PORTADA
// ===============================================================
const portada = [
  new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'TIENDA VIRTUAL CR', bold: true, size: 56, color: '1F3864', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Plataforma de comercio electrónico móvil', italics: true, size: 32, color: '595959', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'MANUAL DE USUARIO', bold: true, size: 48, color: '2E75B6', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Versión 2.0', bold: true, size: 28, font: 'Arial' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Fecha de publicación: 16 de abril de 2026', size: 24, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Universidad — Programación V', size: 24, font: 'Arial' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Proyecto Final · Equipo de Desarrollo Tienda Virtual', size: 24, font: 'Arial' })] }),
  new Paragraph({ children: [new PageBreak()] })
];

// ===============================================================
// CONTROL DE VERSIONES
// ===============================================================
const controlVersiones = [
  new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: 'Control de versiones', bold: true, size: 36, color: '1F3864', font: 'Arial' })] }),
  table(
    ['Versión', 'Fecha', 'Autor', 'Descripción del cambio'],
    [
      ['1.0', '2026-02-15', 'Equipo Dev', 'Versión inicial: catálogo, carrito y checkout'],
      ['1.1', '2026-03-02', 'Equipo Dev', 'Se agregan cupones y reportes administrativos'],
      ['1.2', '2026-03-18', 'Equipo Dev', 'Inventario con alertas de stock bajo'],
      ['1.5', '2026-04-01', 'Equipo Dev', 'Reseñas con fotografías'],
      ['2.0', '2026-04-16', 'Equipo Dev', 'Galería multi-imagen, confirmación de logout, mejoras al cancelar pedidos'],
    ],
    [1300, 1500, 1500, 5060]
  ),
  new Paragraph({ children: [new PageBreak()] }),
];

// ===============================================================
// ÍNDICE
// ===============================================================
const indice = [
  new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: 'Índice', bold: true, size: 36, color: '1F3864', font: 'Arial' })] }),
  new TableOfContents('Contenido del manual', { hyperlink: true, headingStyleRange: '1-3' }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ===============================================================
// 1. INTRODUCCIÓN
// ===============================================================
const seccion1 = [
  h1('1. Introducción'),
  p('Tienda Virtual CR es una plataforma móvil de comercio electrónico desarrollada como proyecto final del curso Programación V. Su propósito es permitir la venta en línea de productos en Costa Rica con cumplimiento del Impuesto al Valor Agregado (IVA) del 13 %, generación automática de facturas electrónicas y gestión completa del catálogo, inventario, cupones de descuento y entregas mediante geolocalización.'),
  p('Este manual está dirigido a dos perfiles de usuario:'),
  bullet('Cliente final: persona que compra productos a través del catálogo, gestiona su carrito y realiza pagos.'),
  bullet('Administrador: encargado de gestionar productos, inventario, cupones, pedidos, reseñas y facturación.'),
  h2('1.1 Convenciones del documento'),
  p('A lo largo del manual se utilizan las siguientes convenciones tipográficas:'),
  bullet('Las acciones de menú aparecen en negrita: Inicio > Catálogo.'),
  bullet('Los nombres de botones aparecen entre comillas: "Agregar al carrito".'),
  bullet('El código y los identificadores aparecen en fuente monoespaciada.'),
  bullet('Los avisos importantes están resaltados en bloques de texto destacados.'),
];

// ===============================================================
// 2. REQUISITOS DEL SISTEMA
// ===============================================================
const seccion2 = [
  h1('2. Requisitos del sistema'),
  h2('2.1 Requisitos del servidor'),
  table(
    ['Componente', 'Especificación mínima', 'Recomendado'],
    [
      ['Sistema operativo', 'Windows 10 / Linux Ubuntu 22.04', 'Windows 11 / Ubuntu 24.04'],
      ['Procesador', 'Intel Core i3 o equivalente', 'Intel Core i5 o superior'],
      ['Memoria RAM', '4 GB', '8 GB o más'],
      ['Almacenamiento', '10 GB libres', '20 GB libres'],
      ['Plataforma', '.NET 9 SDK', '.NET 9 SDK + ASP.NET Core Runtime'],
      ['Base de datos', 'SQL Server 2019 Express', 'SQL Server 2022 Standard'],
      ['Puertos', '5229 (HTTP)', '5229 (HTTP) + 1433 (SQL)'],
    ],
    [2500, 3500, 3360]
  ),
  h2('2.2 Requisitos del cliente móvil'),
  table(
    ['Componente', 'Mínimo', 'Recomendado'],
    [
      ['Sistema', 'Android 10 (API 29)', 'Android 13+ (API 33)'],
      ['Memoria RAM', '2 GB', '4 GB o más'],
      ['Conectividad', 'Wi-Fi o 4G LTE', 'Wi-Fi 5 o superior'],
      ['Permisos', 'Ubicación, almacenamiento, cámara', 'Igual'],
    ],
    [2500, 3500, 3360]
  ),
  h2('2.3 Requisitos del cliente web'),
  bullet('Google Chrome 120+ / Microsoft Edge 120+ / Mozilla Firefox 121+ / Safari 17+'),
  bullet('Resolución mínima 360x640 (smartphone) - óptimo 1366x768 (laptop) o superior.'),
  bullet('JavaScript habilitado y conexión a internet estable.'),
];

// ===============================================================
// 3. INSTALACIÓN
// ===============================================================
const seccion3 = [
  h1('3. Instalación y primera ejecución'),
  h2('3.1 Despliegue del backend'),
  numbered('Clonar el repositorio del proyecto desde el servidor de control de versiones.'),
  numbered('Abrir la carpeta backend/TiendaVirtual.Api en una terminal.'),
  numbered('Configurar la cadena de conexión a SQL Server en appsettings.json.'),
  numbered('Restaurar los paquetes NuGet con el comando "dotnet restore".'),
  numbered('Compilar el proyecto con "dotnet build".'),
  numbered('Ejecutar la API con "dotnet run". El servicio quedará disponible en http://localhost:5229.'),
  p('Al iniciar por primera vez, el sistema crea automáticamente la base de datos, las tablas (incluida ProductoImagenes para galerías) y los usuarios de prueba mediante EnsureCreated() y un script SQL idempotente.'),
  h2('3.2 Despliegue del frontend móvil'),
  numbered('Abrir la carpeta frontend/tienda-virtual en una terminal.'),
  numbered('Instalar dependencias con "npm install".'),
  numbered('Configurar la URL del backend en src/environments/environment.ts.'),
  numbered('Compilar la aplicación con "npm run build".'),
  numbered('Para Android: ejecutar "npx cap sync android" y abrir Android Studio para generar el APK.'),
  numbered('Para web: ejecutar "ionic serve" y abrir http://localhost:8100 en el navegador.'),
  h2('3.3 Credenciales por defecto'),
  table(
    ['Rol', 'Usuario (email)', 'Contraseña'],
    [
      ['Administrador', 'admin@tienda.com', 'Admin123!'],
      ['Cliente de prueba', 'cliente@tienda.com', 'Cliente123!'],
    ],
    [2500, 4000, 2860]
  ),
  p('Importante: cambie las credenciales por defecto al desplegar en un entorno de producción.', { bold: true, color: 'C00000' }),
];

// ===============================================================
// 4. ACCESO A LA APLICACIÓN
// ===============================================================
const seccion4 = [
  h1('4. Acceso a la aplicación'),
  h2('4.1 Pantalla de inicio'),
  p('Al abrir la aplicación se muestra la pantalla principal con accesos directos al catálogo, ofertas destacadas y barra de navegación. Si el usuario no ha iniciado sesión, podrá explorar el catálogo pero no completar compras.'),
  h2('4.2 Registrarse como nuevo cliente'),
  numbered('Pulsar el menú lateral (icono de tres líneas en la esquina superior izquierda).'),
  numbered('Seleccionar "Registrarse".'),
  numbered('Completar nombre, correo electrónico, teléfono y contraseña.'),
  numbered('Confirmar la creación de la cuenta.'),
  numbered('El sistema asigna automáticamente el rol Cliente y emite un token JWT con duración de 8 horas.'),
  h2('4.3 Iniciar sesión'),
  numbered('Pulsar "Iniciar sesión" en el menú lateral.'),
  numbered('Ingresar email y contraseña.'),
  numbered('El sistema validará las credenciales contra el backend.'),
  numbered('Si son correctas, redirige al dashboard correspondiente al rol.'),
  numbered('Si son incorrectas, se muestra un mensaje "Credenciales inválidas".'),
  h2('4.4 Cerrar sesión'),
  p('Para cerrar sesión, abra el menú lateral y pulse "Cerrar sesión". La aplicación mostrará un cuadro de confirmación con los botones "Cancelar" y "Sí, cerrar". Esta confirmación evita cierres accidentales que podrían interrumpir una compra en curso. Al confirmar, el token JWT se elimina del almacenamiento local y se redirige al inicio.'),
];

// ===============================================================
// 5. MÓDULO CLIENTE
// ===============================================================
const seccion5 = [
  h1('5. Módulo Cliente'),
  h2('5.1 Navegar el catálogo'),
  p('La pantalla "Catálogo" muestra los productos en una cuadrícula de tarjetas con imagen, nombre, precio y un indicador de stock. Las funciones disponibles son:'),
  bullet('Filtrar por categoría: pulsar el icono de filtro y seleccionar una categoría jerárquica.'),
  bullet('Buscar por nombre: usar la barra superior de búsqueda con coincidencia parcial.'),
  bullet('Ordenar resultados: por nombre A-Z, precio ascendente o descendente, popularidad o más recientes.'),
  bullet('Filtrar por rango de precio mínimo y máximo.'),
  bullet('Ver alertas visuales si el producto está con stock bajo o agotado.'),
  h2('5.2 Detalle de producto'),
  p('Al pulsar una tarjeta del catálogo se abre la página de detalle, que muestra la galería de imágenes (hasta 5 imágenes con miniatura y vista ampliada), descripción completa, precio, stock disponible, categoría y la sección de reseñas con calificación promedio en estrellas. Acciones disponibles:'),
  bullet('Cambiar la cantidad a comprar dentro del stock disponible.'),
  bullet('Pulsar "Agregar al carrito" para añadir el producto.'),
  bullet('Deslizar entre las imágenes de la galería con gestos táctiles.'),
  bullet('Leer reseñas y calificaciones de otros clientes que ya compraron el producto.'),
  bullet('Si compró el producto previamente, podrá publicar una reseña con hasta 3 fotografías.'),
  h2('5.3 Carrito de compras'),
  p('El carrito muestra los productos agregados con su imagen, nombre, precio unitario, cantidad y subtotal. Operaciones permitidas:'),
  bullet('Modificar la cantidad de cada producto (con validación de stock disponible).'),
  bullet('Eliminar productos individualmente.'),
  bullet('Vaciar el carrito completo.'),
  bullet('Aplicar un cupón de descuento ingresando su código.'),
  bullet('Ver el resumen con subtotal, IVA (13 %), descuento y total estimado.'),
  bullet('Iniciar el proceso de checkout con el botón "Continuar".'),
  h2('5.4 Finalizar compra (Checkout)'),
  p('El proceso de checkout consta de cuatro pasos:'),
  numbered('Paso 1 — Dirección: seleccionar una dirección guardada o agregar una nueva. La aplicación abre un mapa Leaflet centrado en Costa Rica donde el usuario puede arrastrar el marcador hasta la ubicación exacta. El sistema calcula automáticamente el costo de envío según la distancia desde el centro de distribución.'),
  numbered('Paso 2 — Método de pago: seleccionar tarjeta, transferencia o pago contra entrega.'),
  numbered('Paso 3 — Resumen: revisar el desglose final con subtotal, IVA, costo de envío, descuento y total.'),
  numbered('Paso 4 — Confirmación: pulsar "Confirmar pedido". El sistema descuenta el inventario, genera la factura electrónica y muestra el número de orden.'),
  h2('5.5 Historial de pedidos'),
  p('La pantalla "Mis pedidos" muestra el listado completo de órdenes del cliente, con su número, fecha, estado, total y opciones para:'),
  bullet('Ver el detalle de un pedido específico con todos los productos y montos.'),
  bullet('Descargar la factura electrónica en formato PDF.'),
  bullet('Cancelar un pedido si aún está en estado Pendiente o Procesando. Al solicitar la cancelación, el sistema muestra una confirmación; al aceptar, se restablece el stock automáticamente y queda registro en el historial de movimientos.'),
  bullet('Calificar productos comprados con reseñas y fotografías.'),
  h2('5.6 Perfil y direcciones'),
  p('Desde el perfil el cliente puede:'),
  bullet('Actualizar nombre, teléfono y dirección postal.'),
  bullet('Cambiar la contraseña ingresando la actual y la nueva (mínimo 8 caracteres).'),
  bullet('Gestionar múltiples direcciones de envío y marcar una como predeterminada.'),
  bullet('Ver y eliminar direcciones obsoletas.'),
  bullet('Ver estadísticas resumidas: cantidad de pedidos, total gastado y productos favoritos.'),
];

// ===============================================================
// 6. MÓDULO ADMINISTRADOR
// ===============================================================
const seccion6 = [
  h1('6. Módulo Administrador'),
  h2('6.1 Dashboard administrativo'),
  p('El dashboard despliega indicadores clave de rendimiento (KPIs) y gráficos generados con Chart.js:'),
  bullet('Total vendido en el periodo seleccionado.'),
  bullet('Cantidad de pedidos y ticket promedio.'),
  bullet('Clientes activos en los últimos 30 días.'),
  bullet('Productos con stock bajo (alertas).'),
  bullet('Gráfico de ventas diarias (línea).'),
  bullet('Top 10 productos más vendidos (barras).'),
  bullet('Distribución por categoría (donut).'),
  bullet('Pedidos por estado y por método de pago (barras apiladas).'),
  h2('6.2 Gestión de productos'),
  p('La pestaña "Productos" lista todos los productos con paginación. Funciones disponibles:'),
  bullet('Crear producto nuevo con: nombre, descripción, precio, stock inicial, stock mínimo, categoría y galería multi-imagen (hasta 5 imágenes).'),
  bullet('Editar productos existentes incluyendo todas sus imágenes.'),
  bullet('Activar o desactivar productos sin eliminarlos del catálogo.'),
  bullet('Eliminar productos definitivamente (solo si no tienen pedidos asociados).'),
  bullet('Ver el indicador visual de stock bajo cuando el inventario es menor o igual al mínimo.'),
  h3('6.2.1 Galería multi-imagen de productos'),
  p('La nueva versión 2.0 permite gestionar varias imágenes por producto. En el formulario:'),
  numbered('Pulse "Agregar URL" e ingrese la URL de una imagen externa, o use "Cargar archivo" para seleccionar imágenes desde el dispositivo.'),
  numbered('Las imágenes se comprimen automáticamente a 800 píxeles de ancho y se convierten a JPEG con calidad 70 % para optimizar el almacenamiento.'),
  numbered('La primera imagen agregada queda marcada como principal por defecto.'),
  numbered('Pulse el icono de estrella sobre una imagen para cambiar la imagen principal.'),
  numbered('Use las flechas para reordenar las imágenes en la galería.'),
  numbered('Pulse el icono de papelera para eliminar una imagen.'),
  p('Reglas de validación: máximo 5 imágenes por producto, tamaño máximo 2 MB por imagen, formatos aceptados PNG, JPEG, GIF y data URIs base64.'),
  h2('6.3 Gestión de categorías'),
  p('Las categorías permiten organizar los productos jerárquicamente. Cada categoría puede tener una categoría padre, formando un árbol de profundidad ilimitada. Funciones:'),
  bullet('Crear categoría con nombre, descripción opcional, icono Ionicon y categoría padre opcional.'),
  bullet('Editar y reasignar la jerarquía.'),
  bullet('Activar/desactivar para ocultar del catálogo sin perder los productos asociados.'),
  bullet('Eliminar (solo si no tiene productos ni subcategorías).'),
  h2('6.4 Cupones de descuento'),
  p('Los cupones permiten aplicar descuentos a las compras. Tipos disponibles:'),
  bullet('Porcentaje: descuento porcentual sobre el subtotal del pedido.'),
  bullet('Monto fijo: descuento de un monto específico en colones.'),
  p('Cada cupón tiene los siguientes parámetros:'),
  bullet('Código único que el cliente debe ingresar.'),
  bullet('Fecha de inicio y fecha de finalización.'),
  bullet('Límite de usos totales y monto mínimo de compra requerido.'),
  bullet('Producto específico al cual aplica (opcional).'),
  bullet('Estado activo/inactivo.'),
  h2('6.5 Inventario'),
  p('El módulo Inventario centraliza la gestión de stock con tres vistas:'),
  h3('6.5.1 Alertas de stock bajo'),
  p('Lista los productos cuyo stock actual es menor o igual al stock mínimo configurado. Permite reabastecer rápidamente con un solo clic.'),
  h3('6.5.2 Movimientos de inventario'),
  p('Permite registrar entradas, salidas y ajustes manuales. Cada movimiento queda auditado con: producto, tipo (Entrada/Salida/Ajuste), cantidad, stock anterior, stock nuevo, motivo, fecha y usuario que ejecutó la acción.'),
  h3('6.5.3 Historial de movimientos'),
  p('Muestra la trazabilidad completa de todos los cambios de stock con filtros por producto, tipo de movimiento y rango de fechas.'),
  h2('6.6 Facturas electrónicas'),
  p('La sección Facturas lista todas las facturas emitidas con:'),
  bullet('Número consecutivo único generado automáticamente.'),
  bullet('Información del cliente (nombre, email, teléfono).'),
  bullet('Detalle de productos, cantidades y precios.'),
  bullet('Cálculo separado de subtotal, descuentos, base imponible, IVA 13 % y total.'),
  bullet('Descarga en formato PDF apto para enviar por correo o imprimir.'),
  h2('6.7 Reseñas y moderación'),
  p('El administrador puede moderar las reseñas publicadas por clientes:'),
  bullet('Ver listado de reseñas pendientes de aprobación.'),
  bullet('Aprobar reseñas para que aparezcan públicamente en el detalle del producto.'),
  bullet('Rechazar reseñas con un motivo que se notifica al cliente.'),
  bullet('Ver fotografías adjuntas (hasta 3 por reseña).'),
];

// ===============================================================
// 7. CASOS DE USO COMUNES
// ===============================================================
const seccion7 = [
  h1('7. Casos de uso comunes'),
  h2('7.1 Caso de uso: Comprar un producto'),
  p('Actor: Cliente. Precondición: Sesión iniciada con rol Cliente y al menos una dirección registrada.'),
  numbered('Iniciar sesión con email y contraseña.'),
  numbered('Navegar al catálogo y buscar el producto deseado.'),
  numbered('Pulsar el producto para ver su detalle y galería.'),
  numbered('Seleccionar la cantidad y pulsar "Agregar al carrito".'),
  numbered('Pulsar el icono del carrito y revisar los productos.'),
  numbered('Aplicar un cupón de descuento si dispone de uno.'),
  numbered('Pulsar "Continuar" e iniciar el checkout.'),
  numbered('Seleccionar la dirección de envío en el mapa.'),
  numbered('Elegir el método de pago.'),
  numbered('Confirmar el pedido. El sistema genera factura y descuenta inventario.'),
  h2('7.2 Caso de uso: Cancelar un pedido'),
  p('Actor: Cliente. Precondición: Pedido en estado Pendiente o Procesando.'),
  numbered('Acceder a "Mis pedidos" desde el menú principal.'),
  numbered('Seleccionar el pedido a cancelar.'),
  numbered('Pulsar el botón "Cancelar pedido".'),
  numbered('Confirmar la cancelación en el cuadro de diálogo.'),
  numbered('El sistema valida el estado, restaura el inventario y registra un movimiento de auditoría.'),
  numbered('Se muestra un mensaje de confirmación y el pedido cambia a estado Cancelado.'),
  h2('7.3 Caso de uso: Crear un producto con galería'),
  p('Actor: Administrador. Precondición: Sesión iniciada con rol Administrador.'),
  numbered('Acceder a la pestaña "Productos" en el panel administrativo.'),
  numbered('Pulsar "Nuevo producto".'),
  numbered('Completar nombre, descripción, precio, stock y categoría.'),
  numbered('Agregar entre 1 y 5 imágenes mediante URL externa o cargando archivos locales.'),
  numbered('Marcar una imagen como principal usando el icono de estrella.'),
  numbered('Reordenar las imágenes con las flechas.'),
  numbered('Pulsar "Guardar". El producto queda disponible inmediatamente en el catálogo.'),
  h2('7.4 Caso de uso: Reabastecer stock'),
  p('Actor: Administrador. Precondición: Hay productos con alerta de stock bajo.'),
  numbered('Acceder al módulo Inventario.'),
  numbered('Revisar la sección "Alertas de stock bajo".'),
  numbered('Seleccionar el producto a reabastecer.'),
  numbered('Registrar un movimiento de tipo Entrada con la cantidad y un motivo descriptivo.'),
  numbered('Confirmar el movimiento. El stock se actualiza y queda en el historial.'),
];

// ===============================================================
// 8. GLOSARIO
// ===============================================================
const seccion8 = [
  h1('8. Glosario de términos técnicos'),
  table(
    ['Término', 'Definición'],
    [
      ['API', 'Interfaz de Programación de Aplicaciones. Permite que el frontend se comunique con el backend mediante peticiones HTTP.'],
      ['Backend', 'Lado del servidor que procesa la lógica de negocio, accede a la base de datos y emite las facturas.'],
      ['Capacitor', 'Framework que empaqueta la aplicación web Ionic dentro de un contenedor nativo Android/iOS.'],
      ['Checkout', 'Proceso de finalización de la compra: dirección, pago y confirmación.'],
      ['Cupón', 'Código alfanumérico que aplica un descuento porcentual o de monto fijo en una compra.'],
      ['Endpoint', 'Dirección URL específica de la API que ejecuta una acción (ej. /api/productos).'],
      ['Frontend', 'Aplicación visible para el usuario final, ejecutada en navegador o dispositivo móvil.'],
      ['IVA', 'Impuesto al Valor Agregado del 13 % aplicado a las ventas en Costa Rica.'],
      ['JWT', 'JSON Web Token. Cadena cifrada que identifica al usuario autenticado durante 8 horas.'],
      ['KPI', 'Indicador Clave de Rendimiento mostrado en el dashboard administrativo.'],
      ['Módulo', 'Conjunto de funcionalidades agrupadas (ej. módulo Cliente, módulo Administrador).'],
      ['Pedido', 'Solicitud de compra confirmada por el cliente, con productos, total y estado.'],
      ['Reseña', 'Opinión calificada (1-5 estrellas) publicada por un cliente sobre un producto.'],
      ['Rol', 'Perfil de permisos: Cliente o Administrador.'],
      ['Stock', 'Cantidad disponible de un producto en inventario.'],
      ['Stock mínimo', 'Umbral de alerta. Si el stock cae a este valor o menos, se muestra alerta.'],
      ['Token', 'Credencial generada al iniciar sesión, guardada en el dispositivo.'],
    ],
    [2400, 6960]
  ),
];

// ===============================================================
// 9. MENSAJES DE ERROR
// ===============================================================
const seccion9 = [
  h1('9. Mensajes de error y soluciones'),
  table(
    ['Mensaje', 'Causa probable', 'Solución'],
    [
      ['No se pudo conectar al backend. Revisa que la API esté corriendo.', 'El servicio backend no está activo o la URL en environment.ts es incorrecta.', 'Iniciar la API con dotnet run y verificar que escucha en el puerto 5229.'],
      ['Credenciales inválidas', 'Email o contraseña incorrectos.', 'Verificar las credenciales o usar la opción de recuperación de contraseña.'],
      ['Token expirado. Inicie sesión nuevamente.', 'El JWT superó su tiempo de vida (8 horas).', 'Iniciar sesión nuevamente para obtener un nuevo token.'],
      ['Stock insuficiente', 'La cantidad solicitada supera el stock disponible.', 'Reducir la cantidad o esperar a que se reabastezca.'],
      ['Cupón inválido o expirado', 'El cupón no existe, está vencido o agotó sus usos.', 'Verificar el código y la vigencia.'],
      ['No se puede cancelar el pedido en estado X', 'El pedido ya fue enviado o entregado.', 'Contactar al administrador para solicitar devolución.'],
      ['Imagen demasiado grande', 'El archivo supera 2 MB después de la compresión.', 'Usar una imagen de menor resolución.'],
      ['Máximo 5 imágenes por producto', 'Se intentó agregar una sexta imagen.', 'Eliminar una existente antes de agregar una nueva.'],
      ['No se pudo conectar al servicio de mapas', 'Sin conexión a internet o bloqueo de OpenStreetMap.', 'Verificar conexión y permitir acceso al dominio osm.org.'],
      ['Sin permisos para esta operación', 'El usuario actual no tiene rol Administrador.', 'Iniciar sesión con una cuenta con permisos adecuados.'],
      ['Error de validación: campos requeridos', 'Faltan campos obligatorios en el formulario.', 'Completar todos los campos marcados con asterisco.'],
      ['Invalid object name ProductoImagenes', 'Tabla nueva no existente en BD legacy.', 'Reiniciar la API: el script de inicio crea la tabla automáticamente.'],
    ],
    [2800, 3000, 3560]
  ),
];

// ===============================================================
// 10. PREGUNTAS FRECUENTES
// ===============================================================
const seccion10 = [
  h1('10. Preguntas frecuentes (FAQ)'),
  h3('10.1 ¿Necesito conexión a internet para usar la aplicación?'),
  p('Sí. La aplicación requiere conexión a internet para consultar el catálogo, autenticarse, procesar pagos y registrar pedidos. La caché local solo funciona como respaldo de lectura del catálogo previamente visitado.'),
  h3('10.2 ¿Cómo recupero mi contraseña?'),
  p('Actualmente la recuperación se gestiona contactando al administrador del sistema. Una futura versión incluirá recuperación automática vía correo electrónico.'),
  h3('10.3 ¿Puedo modificar un pedido después de confirmarlo?'),
  p('No es posible modificar un pedido confirmado. Solo puede cancelarlo si aún se encuentra en estado Pendiente o Procesando, lo que restaurará el inventario.'),
  h3('10.4 ¿Cuál es el costo de envío?'),
  p('El costo se calcula automáticamente según la distancia desde el centro de distribución (San José) hasta la dirección seleccionada en el mapa. Compras superiores a un monto definido tienen envío gratis.'),
  h3('10.5 ¿Puedo cargar imágenes desde mi dispositivo?'),
  p('Sí. En el formulario de productos use el botón "Cargar archivo" para seleccionar imágenes locales. Estas se comprimen y se almacenan como base64 dentro de la base de datos.'),
  h3('10.6 ¿La factura tiene validez fiscal?'),
  p('La factura genera el cálculo correcto de IVA al 13 % y un consecutivo único. Para uso fiscal oficial debe registrarse el establecimiento ante el Ministerio de Hacienda.'),
  h3('10.7 ¿Cuántos cupones puedo usar a la vez?'),
  p('Solo un cupón por compra. Los descuentos no son acumulables.'),
  h3('10.8 ¿Cómo se calculan las estrellas de un producto?'),
  p('Es el promedio aritmético de todas las reseñas aprobadas, con redondeo a una decimal. Los productos sin reseñas muestran "Sin calificación".'),
  h3('10.9 ¿Puedo eliminar un producto con pedidos históricos?'),
  p('No. Para preservar la integridad de los reportes, los productos con pedidos asociados solo pueden desactivarse, lo que los oculta del catálogo sin afectar el historial.'),
  h3('10.10 ¿Qué pasa si cierro sesión accidentalmente?'),
  p('Desde la versión 2.0 el cierre de sesión requiere confirmación explícita en un cuadro de diálogo, evitando cierres por error. Si confirma el cierre, simplemente vuelva a iniciar sesión: el carrito se preserva en el servidor.'),
];

// ===============================================================
// 11. SOPORTE Y ANEXOS
// ===============================================================
const seccion11 = [
  h1('11. Soporte y anexos'),
  h2('11.1 Canales de soporte'),
  p('Para reportar incidencias o solicitar soporte técnico, los usuarios pueden contactar al equipo de desarrollo a través de los siguientes canales:'),
  bullet('Correo electrónico: soporte@tiendavirtualcr.example.com'),
  bullet('Repositorio Git: https://example.com/tienda-virtual-cr'),
  bullet('Sistema de tickets interno (solo administradores).'),
  h2('11.2 Validación con stakeholders'),
  table(
    ['Stakeholder', 'Rol', 'Fecha de validación', 'Resultado'],
    [
      ['Profesor del curso', 'Sponsor académico', '2026-04-10', 'Aprobado con observaciones menores'],
      ['Compañeros del equipo', 'QA cruzado', '2026-04-12', 'Aprobado'],
      ['Cliente piloto (familiar)', 'Usuario final', '2026-04-14', 'Aprobado'],
      ['Administrador piloto', 'Usuario final', '2026-04-15', 'Aprobado tras aplicar mejoras a UX'],
    ],
    [2300, 2300, 2300, 2460]
  ),
  h2('11.3 Información del documento'),
  table(
    ['Atributo', 'Valor'],
    [
      ['Título', 'Manual de Usuario - Tienda Virtual CR'],
      ['Versión', '2.0'],
      ['Fecha', '16 de abril de 2026'],
      ['Autor', 'Equipo de Desarrollo Tienda Virtual'],
      ['Idioma', 'Español (Costa Rica)'],
      ['Páginas', 'Ver índice'],
      ['Distribución', 'Interna - uso académico'],
    ],
    [3000, 6360]
  ),
];

// ===============================================================
// DOCUMENTO
// ===============================================================
const doc = new Document({
  creator: 'Equipo Tienda Virtual CR',
  title: 'Manual de Usuario Tienda Virtual CR',
  description: 'Manual de usuario completo del sistema Tienda Virtual CR v2.0',
  styles: {
    default: { document: { run: { font: 'Arial', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: '2E75B6' },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1F3864', space: 1 } },
          children: [new TextRun({ text: 'Tienda Virtual CR · Manual de Usuario v2.0', size: 18, color: '595959', font: 'Arial', italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: '1F3864', space: 1 } },
          children: [
            new TextRun({ text: '© 2026 Equipo Tienda Virtual CR · Programación V', size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ text: '\tPágina ', size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ text: ' de ', size: 18, color: '595959', font: 'Arial' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '595959', font: 'Arial' }),
          ],
        })],
      }),
    },
    children: [
      ...portada,
      ...controlVersiones,
      ...indice,
      ...seccion1,
      ...seccion2,
      ...seccion3,
      ...seccion4,
      ...seccion5,
      ...seccion6,
      ...seccion7,
      ...seccion8,
      ...seccion9,
      ...seccion10,
      ...seccion11,
    ],
  }],
});

const out = path.join(__dirname, '..', 'MANUAL_USUARIO.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(out, buffer);
  console.log('Manual generado en:', out, '(' + buffer.length + ' bytes)');
});
