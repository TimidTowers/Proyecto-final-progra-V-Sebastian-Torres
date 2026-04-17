// Secciones 1-3: Introducción, Descripción, Objetivos
const { Paragraph, TextRun, AlignmentType, PageBreak } = require('docx');
const { p, h1, h2, h3, bullet, numbered, table, pageBreak } = require('./tecnico-helpers');

// PORTADA
const portada = [
  new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'TIENDA VIRTUAL CR', bold: true, size: 56, color: '1F3864', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Plataforma de comercio electrónico móvil', italics: true, size: 28, color: '595959', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1400 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'DOCUMENTO TÉCNICO', bold: true, size: 48, color: '2E75B6', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 240 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Análisis, Diseño y Modelado del Sistema', size: 28, color: '404040', font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1600 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Versión 2.0', bold: true, size: 28, font: 'Arial' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Fecha de publicación: 16 de abril de 2026', size: 24, font: 'Arial' })] }),
  new Paragraph({ spacing: { before: 1000 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Universidad — Programación V', size: 24, font: 'Arial' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Proyecto Final · Equipo de Desarrollo Tienda Virtual', size: 24, font: 'Arial' })] }),
  pageBreak(),
];

const controlVer = [
  new Paragraph({ heading: 'Heading1',
    children: [new TextRun({ text: 'Control de versiones del documento', bold: true, size: 36, color: '1F3864', font: 'Arial' })] }),
  table(
    ['Versión', 'Fecha', 'Autor', 'Descripción del cambio'],
    [
      ['0.1', '2026-02-01', 'Equipo Dev', 'Borrador inicial: introducción y objetivos'],
      ['0.5', '2026-02-20', 'Equipo Dev', 'Levantamiento y definición de requerimientos'],
      ['1.0', '2026-03-05', 'Equipo Dev', 'Modelo entidad-relación y script SQL'],
      ['1.5', '2026-03-25', 'Equipo Dev', 'Diagramas UML completos'],
      ['1.8', '2026-04-08', 'Equipo Dev', 'Análisis detallado de requerimientos'],
      ['2.0', '2026-04-16', 'Equipo Dev', 'Galería multi-imagen, módulo de reseñas, validación final'],
    ],
    [1300, 1500, 1500, 5060]
  ),
  pageBreak(),
];

// 1. INTRODUCCIÓN
const sec1 = [
  h1('1. Introducción del proyecto'),
  h2('1.1 Contextualización'),
  p('El comercio electrónico en Costa Rica ha experimentado un crecimiento sostenido en los últimos años, impulsado por la masificación de dispositivos móviles y la digitalización forzada por la pandemia de COVID-19. Pequeñas y medianas empresas (PyMEs) costarricenses requieren herramientas accesibles para vender en línea con cumplimiento de las obligaciones tributarias locales (IVA del 13 %), gestión integrada de inventarios y experiencia de usuario optimizada para dispositivos móviles.'),
  p('El presente proyecto, Tienda Virtual CR, surge como respuesta académica a esta necesidad, desarrollado en el marco del curso Programación V. Combina arquitectura cliente-servidor moderna utilizando ASP.NET Core 9 en el backend, Ionic 8 con Angular 20 en el frontend y SQL Server como motor de base de datos relacional.'),
  h2('1.2 Justificación'),
  p('La justificación del proyecto se fundamenta en cuatro ejes principales:'),
  bullet('Académico: aplica integralmente los conocimientos de Programación V (frameworks modernos, patrones de diseño, arquitectura por capas, autenticación, persistencia y consumo de servicios REST).'),
  bullet('Tecnológico: utiliza un stack actualizado y demandado en el mercado laboral (.NET 9, Angular 20, Capacitor 8, JWT, EF Core).'),
  bullet('Funcional: ofrece una solución completa de e-commerce (catálogo, carrito, checkout, facturación electrónica, inventario, reportes) lista para extenderse a un caso real.'),
  bullet('Local: incorpora particularidades del mercado costarricense (cálculo de IVA al 13 %, geolocalización con OpenStreetMap centrada en Costa Rica, cálculo de envío por distancia).'),
  h2('1.3 Alcance'),
  p('El alcance del sistema cubre los siguientes módulos funcionales:'),
  bullet('Autenticación con dos roles diferenciados (Cliente y Administrador) basada en JWT.'),
  bullet('Catálogo jerárquico de productos con categorías, búsqueda, filtros, ordenamiento y galería multi-imagen.'),
  bullet('Carrito de compras persistente, cálculo automático de subtotal, IVA y descuentos.'),
  bullet('Checkout con selección de dirección sobre mapa interactivo y cálculo dinámico de costo de envío.'),
  bullet('Generación automática de factura electrónica con consecutivo único.'),
  bullet('Gestión administrativa de productos, categorías, cupones, inventario y reseñas.'),
  bullet('Dashboard con KPIs y gráficos interactivos (Chart.js).'),
  bullet('Aplicación móvil empaquetada con Capacitor para Android.'),
  p('Quedan fuera del alcance: integración con pasarelas de pago reales (Tilopay, BAC, Banco Nacional), envío automático de correos transaccionales y certificación oficial ante el Ministerio de Hacienda como facturador electrónico.'),
  h2('1.4 Visión general del sistema'),
  p('Tienda Virtual CR es una plataforma full-stack de tres capas:'),
  bullet('Capa de presentación: aplicación Ionic + Angular ejecutable en navegadores web modernos y empaquetada como APK Android mediante Capacitor.'),
  bullet('Capa de aplicación: API REST en ASP.NET Core 9 con controladores por dominio, servicios inyectados y autenticación JWT.'),
  bullet('Capa de datos: motor SQL Server con esquema relacional normalizado a 3FN, gestionado mediante Entity Framework Core con DbInitializer para datos de prueba.'),
];

// 2. DESCRIPCIÓN
const sec2 = [
  h1('2. Descripción del proyecto'),
  h2('2.1 Problemática a resolver'),
  p('Las PyMEs costarricenses enfrentan barreras significativas para vender en línea: las plataformas internacionales (Shopify, WooCommerce) no contemplan los detalles fiscales locales, requieren conocimiento técnico avanzado o tienen costos prohibitivos. Las soluciones a la medida son caras y dejan al comerciante sin control sobre la lógica de negocio. Adicionalmente, la mayoría no proveen aplicación móvil nativa ni cálculo automatizado de envío basado en geolocalización.'),
  p('Las problemáticas específicas que aborda Tienda Virtual CR son:'),
  numbered('Ausencia de cálculo automático de IVA al 13 % con desglose en factura.'),
  numbered('Falta de control de stock en tiempo real con alertas de bajo inventario.'),
  numbered('Dificultad para gestionar campañas promocionales mediante cupones.'),
  numbered('Falta de visibilidad gerencial mediante un dashboard analítico.'),
  numbered('Carencia de aplicación móvil nativa para clientes finales.'),
  numbered('Inexistencia de cálculo geográfico de costo de envío para Costa Rica.'),
  h2('2.2 Solución propuesta'),
  p('La solución propuesta es una plataforma integral de e-commerce con las siguientes características diferenciadoras:'),
  bullet('Backend RESTful en ASP.NET Core 9 que centraliza la lógica de negocio y persistencia.'),
  bullet('Aplicación cliente única (Ionic + Angular) que se compila tanto para web como para Android.'),
  bullet('Cálculo fiscal automático con separación de subtotal, base imponible, IVA y total.'),
  bullet('Inventario auditado: cada movimiento queda registrado con usuario, fecha, motivo y stocks anterior/nuevo.'),
  bullet('Gestión de cupones con vigencia, límite de usos y aplicación opcional a productos específicos.'),
  bullet('Galería multi-imagen por producto (hasta 5 imágenes con compresión automática).'),
  bullet('Reseñas con calificación de 1 a 5 estrellas y hasta 3 fotografías por reseña.'),
  bullet('Mapa interactivo con OpenStreetMap para selección de dirección y cálculo de envío.'),
  bullet('Dashboard con 8 indicadores y exportación de reportes a PDF y Excel.'),
  h2('2.3 Usuarios objetivo'),
  table(
    ['Tipo de usuario', 'Descripción', 'Necesidades principales'],
    [
      ['Cliente final', 'Persona que adquiere productos a través de la app móvil o web.', 'Catálogo claro, checkout rápido, historial de compras, factura descargable.'],
      ['Administrador', 'Encargado del comercio que gestiona el sistema día a día.', 'Gestión de productos, control de inventario, reportes, atención de pedidos.'],
      ['Encargado de bodega', 'Subrol del administrador centrado en stock.', 'Movimientos de inventario, alertas de stock bajo, trazabilidad.'],
      ['Contador / financiero', 'Subrol del administrador enfocado en facturación.', 'Facturas emitidas, reporte de ventas, cierre de periodos.'],
    ],
    [2200, 3500, 3660]
  ),
  h2('2.4 Beneficios esperados'),
  bullet('Reducción del tiempo de gestión administrativa hasta en un 60 % mediante automatización.'),
  bullet('Aumento de ventas por accesibilidad móvil (estudios indican +30 % en m-commerce).'),
  bullet('Cumplimiento fiscal automático evitando errores manuales en cálculo de IVA.'),
  bullet('Trazabilidad completa de inventario que reduce mermas y discrepancias.'),
  bullet('Toma de decisiones basada en datos gracias al dashboard.'),
  bullet('Experiencia de usuario coherente en web y móvil.'),
];

// 3. OBJETIVOS
const sec3 = [
  h1('3. Objetivos'),
  h2('3.1 Objetivo general'),
  p('Diseñar, desarrollar e implementar una plataforma de comercio electrónico móvil para Costa Rica, integrando catálogo, carrito, checkout con geolocalización, facturación electrónica con IVA al 13 %, control de inventario auditado y gestión administrativa con dashboard analítico, utilizando un stack moderno (.NET 9, Angular 20, Ionic 8, SQL Server) y siguiendo buenas prácticas de arquitectura por capas, seguridad mediante JWT y experiencia de usuario responsiva.'),
  h2('3.2 Objetivos específicos'),
  table(
    ['Código', 'Objetivo específico', 'Indicador medible'],
    [
      ['OE-01', 'Implementar autenticación segura con JWT y BCrypt diferenciando roles Cliente y Administrador.', '100 % de endpoints protegidos con [Authorize]; contraseñas con hash de costo 11.'],
      ['OE-02', 'Desarrollar un catálogo jerárquico con búsqueda, filtros, ordenamiento y galería multi-imagen (hasta 5 por producto).', 'Catálogo con respuesta menor a 500 ms para 100 productos; galería operativa.'],
      ['OE-03', 'Construir un proceso de checkout completo con selección de dirección sobre mapa, cálculo de envío y generación automática de factura electrónica con desglose de IVA al 13 %.', 'Checkout en menos de 5 pasos; factura PDF generada en menos de 2 segundos.'],
      ['OE-04', 'Implementar un módulo de inventario auditado con alertas de stock bajo, movimientos tipados (Entrada, Salida, Ajuste) y trazabilidad por usuario.', 'Cada movimiento registra usuario, motivo y stocks anterior/nuevo; alertas operativas.'],
      ['OE-05', 'Crear un dashboard administrativo con al menos 8 KPIs y 5 gráficos interactivos exportables a PDF y Excel.', 'KPIs cargan en menos de 1 segundo; exportaciones funcionales.'],
      ['OE-06', 'Empaquetar la aplicación frontend con Capacitor para distribución como APK Android funcional.', 'APK genera y se instala correctamente en dispositivos Android 10+.'],
      ['OE-07', 'Documentar el sistema con manual de usuario, documento técnico, modelos UML y diccionario de datos completos.', 'Documentación entregada en formato Word con índice y validada por stakeholders.'],
    ],
    [1200, 4500, 3660]
  ),
];

module.exports = { portada, controlVer, sec1, sec2, sec3 };
