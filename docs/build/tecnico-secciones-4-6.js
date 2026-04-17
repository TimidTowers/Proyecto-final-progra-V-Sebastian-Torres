// Secciones 4-6: Levantamiento, Definición y Análisis Detallado de Requerimientos
const { p, h1, h2, h3, bullet, numbered, table, code } = require('./tecnico-helpers');

// 4. LEVANTAMIENTO DE REQUERIMIENTOS
const sec4 = [
  h1('4. Levantamiento de requerimientos'),
  h2('4.1 Metodología utilizada'),
  p('La metodología empleada para el levantamiento de requerimientos combinó elementos de las siguientes aproximaciones:'),
  bullet('Análisis orientado a casos de uso (UML 2.5): identificación de actores, escenarios principales y excepciones.'),
  bullet('Investigación documental: revisión de plataformas de e-commerce existentes (Shopify, WooCommerce) y normativa fiscal costarricense.'),
  bullet('Prototipado iterativo: bocetos de baja fidelidad refinados en cada sprint con feedback del profesor y compañeros.'),
  bullet('Marco ágil Scrum simplificado: 5 sprints de dos semanas con reuniones semanales, backlog priorizado y retrospectivas.'),
  h2('4.2 Técnicas de recolección'),
  h3('4.2.1 Entrevistas'),
  p('Se realizaron entrevistas semiestructuradas con tres perfiles representativos:'),
  table(
    ['Entrevistado', 'Perfil', 'Duración', 'Hallazgos clave'],
    [
      ['E-01', 'Comerciante PyME (artesanías)', '45 min', 'Necesita inventario simple y factura con IVA desglosado.'],
      ['E-02', 'Cliente regular de e-commerce', '30 min', 'Valora el mapa para confirmar dirección y poder cancelar pedidos.'],
      ['E-03', 'Contador independiente', '40 min', 'Requiere consecutivo único, base imponible y reporte exportable.'],
    ],
    [1300, 2700, 1300, 4060]
  ),
  h3('4.2.2 Encuestas'),
  p('Se aplicó una encuesta digital a 25 personas (compañeros, familiares y profesionales) con preguntas sobre hábitos de compra en línea. Resultados destacados:'),
  bullet('92 % prefiere realizar compras desde el celular antes que desde computadora.'),
  bullet('80 % considera importante poder ver fotografías de los productos desde múltiples ángulos.'),
  bullet('72 % ha cancelado un pedido al menos una vez tras realizarlo.'),
  bullet('88 % considera fundamental ver el costo de envío antes de pagar.'),
  bullet('64 % consulta reseñas de otros clientes antes de comprar.'),
  h3('4.2.3 Observación'),
  p('Se observaron 5 sesiones de compra real en aplicaciones de e-commerce populares (Amazon, MercadoLibre, AliExpress, PedidosYa, Walmart CR) para identificar patrones de UX exitosos. Hallazgos:'),
  bullet('Los usuarios esperan ver el subtotal acumulado en tiempo real al modificar cantidades en el carrito.'),
  bullet('Los confirmaciones explícitas (modal de "¿Está seguro?") son esperadas en acciones destructivas como cancelar pedido o cerrar sesión.'),
  bullet('La galería de imágenes con miniaturas y zoom táctil es estándar de la industria.'),
  bullet('El mapa interactivo es preferido sobre formularios extensos de dirección.'),
  h3('4.2.4 Revisión de documentación'),
  bullet('Ley 9635 de Fortalecimiento de las Finanzas Públicas (IVA en Costa Rica).'),
  bullet('Documentación oficial de Microsoft sobre ASP.NET Core 9 y EF Core.'),
  bullet('Guías de Ionic Framework 8 y Capacitor 8.'),
  bullet('OWASP Top 10 (vulnerabilidades web a evitar).'),
  h2('4.3 Stakeholders identificados'),
  table(
    ['Stakeholder', 'Tipo', 'Interés en el proyecto', 'Influencia'],
    [
      ['Profesor del curso', 'Sponsor académico', 'Validar aplicación de conceptos del curso.', 'Alta'],
      ['Equipo de desarrollo', 'Implementadores', 'Entregar producto funcional dentro del plazo.', 'Alta'],
      ['Compañeros del curso', 'Pares revisores', 'Evaluar calidad técnica del proyecto.', 'Media'],
      ['Cliente piloto', 'Usuario final (cliente)', 'Probar la experiencia de compra.', 'Media'],
      ['Administrador piloto', 'Usuario final (admin)', 'Validar la gestión administrativa.', 'Media'],
      ['Comerciante hipotético', 'Beneficiario final', 'Adoptar el sistema en su negocio.', 'Baja'],
      ['Ministerio de Hacienda', 'Regulador externo', 'Cumplimiento fiscal (IVA).', 'Baja'],
    ],
    [2300, 1800, 3000, 2260]
  ),
  h2('4.4 Resultados obtenidos'),
  p('El levantamiento generó un total de 38 requerimientos: 28 funcionales y 10 no funcionales, agrupados en 8 módulos. Estos requerimientos fueron priorizados con la técnica MoSCoW (Must, Should, Could, Won\'t):'),
  bullet('Must (crítico): 22 requerimientos.'),
  bullet('Should (importante): 11 requerimientos.'),
  bullet('Could (deseable): 5 requerimientos.'),
  bullet('Won\'t (fuera de alcance): 7 requerimientos identificados pero pospuestos para futuras versiones (ej. integración con pasarela de pago real, recuperación automática de contraseña por correo, multi-idioma).'),
];

// 5. DEFINICIÓN DE REQUERIMIENTOS
const sec5 = [
  h1('5. Definición de requerimientos'),
  h2('5.1 Requerimientos funcionales'),
  p('Cada requerimiento funcional posee un código único con el prefijo RF, una descripción y una prioridad (A=Alta, M=Media, B=Baja).'),
  h3('5.1.1 Módulo de Autenticación'),
  table(
    ['Código', 'Descripción', 'Prioridad'],
    [
      ['RF-01', 'El sistema debe permitir el registro de nuevos clientes con email único.', 'A'],
      ['RF-02', 'El sistema debe autenticar a los usuarios mediante email y contraseña, devolviendo un token JWT con vigencia de 8 horas.', 'A'],
      ['RF-03', 'El sistema debe aplicar BCrypt con costo 11 para el hash de contraseñas.', 'A'],
      ['RF-04', 'El sistema debe diferenciar dos roles: Cliente y Administrador.', 'A'],
      ['RF-05', 'El sistema debe permitir el cambio de contraseña validando la contraseña actual.', 'M'],
    ],
    [1200, 6800, 1360]
  ),
  h3('5.1.2 Módulo de Catálogo'),
  table(
    ['Código', 'Descripción', 'Prioridad'],
    [
      ['RF-06', 'El sistema debe listar productos con paginación, filtros por categoría, búsqueda por nombre y rango de precio.', 'A'],
      ['RF-07', 'El sistema debe organizar productos en categorías jerárquicas con profundidad ilimitada.', 'A'],
      ['RF-08', 'El sistema debe permitir hasta 5 imágenes por producto con marcado de imagen principal.', 'A'],
      ['RF-09', 'El sistema debe mostrar el stock disponible y marcar productos con stock bajo.', 'A'],
      ['RF-10', 'El sistema debe ordenar productos por nombre, precio, popularidad o fecha de creación.', 'M'],
    ],
    [1200, 6800, 1360]
  ),
  h3('5.1.3 Módulo de Carrito y Checkout'),
  table(
    ['Código', 'Descripción', 'Prioridad'],
    [
      ['RF-11', 'El sistema debe persistir el carrito de cada usuario en el servidor.', 'A'],
      ['RF-12', 'El sistema debe validar el stock disponible al agregar o modificar cantidades.', 'A'],
      ['RF-13', 'El sistema debe calcular subtotal, IVA al 13 %, descuentos y total automáticamente.', 'A'],
      ['RF-14', 'El sistema debe permitir aplicar un cupón de descuento por compra.', 'A'],
      ['RF-15', 'El sistema debe permitir seleccionar dirección de envío sobre un mapa interactivo.', 'A'],
      ['RF-16', 'El sistema debe calcular el costo de envío en función de la distancia geográfica.', 'A'],
      ['RF-17', 'El sistema debe ofrecer envío gratuito a partir de un monto mínimo configurable.', 'M'],
    ],
    [1200, 6800, 1360]
  ),
  h3('5.1.4 Módulo de Pedidos y Facturación'),
  table(
    ['Código', 'Descripción', 'Prioridad'],
    [
      ['RF-18', 'El sistema debe generar una factura electrónica con consecutivo único al confirmar un pedido.', 'A'],
      ['RF-19', 'El sistema debe permitir descargar la factura en formato PDF.', 'A'],
      ['RF-20', 'El sistema debe permitir al cliente cancelar un pedido en estado Pendiente o Procesando, restableciendo el stock.', 'A'],
      ['RF-21', 'El sistema debe registrar el historial de pedidos por cliente.', 'A'],
      ['RF-22', 'El sistema debe permitir al administrador cambiar el estado de un pedido (Procesando, Enviado, Entregado, Cancelado).', 'A'],
    ],
    [1200, 6800, 1360]
  ),
  h3('5.1.5 Módulo de Inventario y Reseñas'),
  table(
    ['Código', 'Descripción', 'Prioridad'],
    [
      ['RF-23', 'El sistema debe registrar movimientos de inventario tipados (Entrada, Salida, Ajuste) con auditoría.', 'A'],
      ['RF-24', 'El sistema debe generar alertas para productos con stock menor o igual al mínimo configurado.', 'A'],
      ['RF-25', 'El sistema debe permitir a clientes publicar reseñas (1-5 estrellas) con hasta 3 fotografías.', 'M'],
      ['RF-26', 'El sistema debe permitir al administrador moderar reseñas (aprobar o rechazar).', 'M'],
      ['RF-27', 'El sistema debe mostrar un dashboard con KPIs y gráficos administrativos.', 'A'],
      ['RF-28', 'El sistema debe permitir exportar reportes a PDF y Excel.', 'M'],
    ],
    [1200, 6800, 1360]
  ),
  h2('5.2 Requerimientos no funcionales'),
  table(
    ['Código', 'Categoría', 'Descripción', 'Prioridad'],
    [
      ['RNF-01', 'Rendimiento', 'El sistema debe responder consultas del catálogo en menos de 500 ms con hasta 100 productos.', 'A'],
      ['RNF-02', 'Rendimiento', 'El dashboard debe cargar todos los KPIs en menos de 1 segundo.', 'M'],
      ['RNF-03', 'Seguridad', 'El sistema debe proteger todos los endpoints sensibles con autenticación JWT.', 'A'],
      ['RNF-04', 'Seguridad', 'El sistema debe almacenar las contraseñas con hash BCrypt de costo 11 o superior.', 'A'],
      ['RNF-05', 'Usabilidad', 'La interfaz debe ser responsiva, funcional desde 360 px hasta 1920 px de ancho.', 'A'],
      ['RNF-06', 'Compatibilidad', 'La aplicación debe ejecutarse en navegadores Chrome 120+, Edge 120+, Firefox 121+ y Safari 17+.', 'A'],
      ['RNF-07', 'Mantenibilidad', 'El código debe seguir convenciones del lenguaje (C# StyleCop, TypeScript ESLint).', 'M'],
      ['RNF-08', 'Disponibilidad', 'El backend debe permitir despliegue continuo con tiempos de inicio menores a 10 segundos.', 'M'],
      ['RNF-09', 'Portabilidad', 'La aplicación frontend debe empaquetarse como APK Android sin cambios al código.', 'A'],
      ['RNF-10', 'Auditabilidad', 'Todas las acciones administrativas críticas deben quedar registradas con usuario y fecha.', 'A'],
    ],
    [1100, 1700, 5400, 1160]
  ),
];

// 6. ANÁLISIS DETALLADO
const sec6 = [
  h1('6. Análisis detallado de requerimientos'),
  p('A continuación se detallan los requerimientos críticos mediante casos de uso completos con precondiciones, postcondiciones, flujo principal, flujos alternativos, excepciones y reglas de negocio.'),

  h2('6.1 CU-01 Registrar cliente'),
  table(
    ['Campo', 'Detalle'],
    [
      ['Código', 'CU-01'],
      ['Requerimiento asociado', 'RF-01, RF-03'],
      ['Actor', 'Cliente (no autenticado)'],
      ['Precondiciones', 'El usuario no posee cuenta previa con el mismo email.'],
      ['Postcondición', 'Usuario creado en estado Activo con rol Cliente y token JWT emitido.'],
      ['Flujo principal', '1. El usuario abre la pantalla de registro.\n2. Ingresa nombre, email, teléfono y contraseña.\n3. Pulsa el botón Registrarse.\n4. El sistema valida el email único y la fortaleza de la contraseña.\n5. El sistema aplica BCrypt al password y crea el registro Usuario.\n6. El sistema genera y devuelve el token JWT.\n7. El sistema redirige al dashboard del cliente.'],
      ['Flujos alternativos', 'A1. El email ya existe: el sistema muestra "Ya hay una cuenta con ese email" y permite cambiar de email.\nA2. La contraseña no cumple requisitos: el sistema muestra los criterios faltantes.'],
      ['Excepciones', 'E1. Falla de conexión con la base de datos: se muestra error 500 y se invita a reintentar.'],
      ['Reglas de negocio', 'RN-01: el email debe ser único.\nRN-02: la contraseña debe tener mínimo 8 caracteres con al menos una letra y un número.\nRN-03: el rol por defecto es Cliente.'],
    ],
    [2400, 6960]
  ),

  h2('6.2 CU-02 Iniciar sesión'),
  table(
    ['Campo', 'Detalle'],
    [
      ['Código', 'CU-02'],
      ['Requerimiento asociado', 'RF-02'],
      ['Actor', 'Cliente o Administrador'],
      ['Precondiciones', 'El usuario tiene cuenta creada y activa.'],
      ['Postcondición', 'Token JWT entregado y almacenado en el cliente; sesión iniciada.'],
      ['Flujo principal', '1. El usuario abre la pantalla de login.\n2. Ingresa email y contraseña.\n3. Pulsa Iniciar sesión.\n4. El sistema verifica las credenciales contra la tabla Usuarios usando BCrypt.Verify.\n5. El sistema genera el JWT con claims (UsuarioId, Rol, exp).\n6. El sistema redirige al dashboard correspondiente al rol.'],
      ['Flujos alternativos', 'A1. Cuenta inactiva: muestra "Cuenta deshabilitada, contacte al administrador".'],
      ['Excepciones', 'E1. Credenciales inválidas: muestra "Credenciales inválidas" sin distinguir si el error fue en email o password (mitigación de enumeración de usuarios).'],
      ['Reglas de negocio', 'RN-04: el JWT vence a las 8 horas.\nRN-05: tras 5 intentos fallidos consecutivos en menos de 5 minutos, se aplica retraso exponencial (mitigación de fuerza bruta).'],
    ],
    [2400, 6960]
  ),

  h2('6.3 CU-03 Realizar compra'),
  table(
    ['Campo', 'Detalle'],
    [
      ['Código', 'CU-03'],
      ['Requerimiento asociado', 'RF-11 a RF-19'],
      ['Actor', 'Cliente'],
      ['Precondiciones', 'Sesión iniciada como Cliente. Carrito con al menos un producto. Al menos una dirección registrada.'],
      ['Postcondición', 'Pedido registrado en estado Pendiente con factura emitida y stock descontado.'],
      ['Flujo principal', '1. El cliente abre el carrito.\n2. Pulsa Continuar.\n3. Selecciona dirección o agrega una nueva en el mapa.\n4. El sistema calcula el costo de envío por distancia.\n5. El cliente elige el método de pago.\n6. Revisa el resumen final con subtotal, IVA, descuento, envío y total.\n7. Pulsa Confirmar pedido.\n8. El sistema crea Pedido y PedidoDetalles, descuenta el stock dentro de una transacción, genera la Factura con consecutivo único y vacía el carrito.\n9. El sistema muestra confirmación con número de orden.'],
      ['Flujos alternativos', 'A1. El cliente aplica un cupón válido en el carrito antes del paso 1.\nA2. El cliente alcanza el monto mínimo de envío gratis y el costo de envío queda en 0.'],
      ['Excepciones', 'E1. Stock insuficiente al confirmar: la transacción se aborta y se notifica el producto sin stock.\nE2. Falla en la generación de factura: el pedido se marca como pendiente de facturación y se reintenta.'],
      ['Reglas de negocio', 'RN-06: el IVA es 13 % sobre la base imponible.\nRN-07: el consecutivo de factura es secuencial e irrepetible.\nRN-08: el cupón solo aplica si la fecha actual está entre fechaInicio y fechaFin y usosActuales menor a limiteUso.'],
    ],
    [2400, 6960]
  ),

  h2('6.4 CU-04 Cancelar pedido'),
  table(
    ['Campo', 'Detalle'],
    [
      ['Código', 'CU-04'],
      ['Requerimiento asociado', 'RF-20'],
      ['Actor', 'Cliente'],
      ['Precondiciones', 'Pedido en estado Pendiente o Procesando que pertenece al cliente actual.'],
      ['Postcondición', 'Pedido en estado Cancelado, stock restaurado, movimiento de inventario tipo Entrada con motivo Cancelación.'],
      ['Flujo principal', '1. El cliente abre Mis pedidos y selecciona el pedido.\n2. Pulsa Cancelar pedido.\n3. El sistema muestra cuadro de confirmación.\n4. El cliente confirma.\n5. El sistema valida el estado del pedido en backend.\n6. El sistema actualiza el estado a Cancelado.\n7. El sistema restaura el stock de cada PedidoDetalle.\n8. El sistema registra un MovimientoInventario por cada producto restaurado.\n9. Notifica al cliente con un toast de éxito.'],
      ['Flujos alternativos', 'A1. El cliente cancela el cuadro de confirmación: no se realiza ninguna acción.'],
      ['Excepciones', 'E1. El pedido ya no está en estado cancelable: el backend retorna 400 y el frontend muestra "No se puede cancelar el pedido en estado X".\nE2. Error en transacción: rollback completo, ningún cambio persiste.'],
      ['Reglas de negocio', 'RN-09: solo el dueño del pedido (o un admin) puede cancelarlo.\nRN-10: la cancelación es atómica (transacción).\nRN-11: cada movimiento de inventario queda auditado con usuario y fecha.'],
    ],
    [2400, 6960]
  ),

  h2('6.5 CU-05 Gestionar producto con galería'),
  table(
    ['Campo', 'Detalle'],
    [
      ['Código', 'CU-05'],
      ['Requerimiento asociado', 'RF-08'],
      ['Actor', 'Administrador'],
      ['Precondiciones', 'Sesión iniciada con rol Administrador.'],
      ['Postcondición', 'Producto creado o actualizado con su galería de imágenes sincronizada.'],
      ['Flujo principal', '1. El admin abre Productos y pulsa Nuevo o edita uno existente.\n2. Completa los datos básicos.\n3. Agrega imágenes mediante URL o cargando archivos locales.\n4. El sistema comprime las imágenes locales a 800 px y JPEG 70 %.\n5. El admin marca una imagen como principal y reordena.\n6. Pulsa Guardar.\n7. El backend valida (máx. 5 imágenes, máx. 2 MB cada una, formato válido).\n8. El backend sincroniza ProductoImagenes (delete missing, update existing, insert new).\n9. El backend asegura una sola imagen marcada como principal.'],
      ['Flujos alternativos', 'A1. El admin elimina una imagen existente: marcada para borrado al guardar.'],
      ['Excepciones', 'E1. Más de 5 imágenes: rechaza con 400.\nE2. Imagen mayor a 2 MB tras compresión: rechaza con 413.'],
      ['Reglas de negocio', 'RN-12: máximo 5 imágenes por producto.\nRN-13: si no se marca principal, la primera por orden lo es.\nRN-14: ImagenUrl del Producto se sincroniza automáticamente con la principal.'],
    ],
    [2400, 6960]
  ),
];

module.exports = { sec4, sec5, sec6 };
