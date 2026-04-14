# Manual de Usuario — Tienda Virtual CR

**Versión 2.0**
**Aplicación móvil + Backend ASP.NET Core + Base de datos SQL Server**
**Proyecto final de Programación V**

---

## Contenido

1. [Introducción](#1-introducción)
2. [Requisitos del sistema](#2-requisitos-del-sistema)
3. [Instalación y primera ejecución](#3-instalación-y-primera-ejecución)
4. [Acceso a la aplicación](#4-acceso-a-la-aplicación)
5. [Módulo Cliente](#5-módulo-cliente)
   - 5.1 [Navegar el catálogo](#51-navegar-el-catálogo)
   - 5.2 [Detalle de producto](#52-detalle-de-producto)
   - 5.3 [Carrito de compras](#53-carrito-de-compras)
   - 5.4 [Finalizar compra (checkout)](#54-finalizar-compra-checkout)
   - 5.5 [Historial de pedidos](#55-historial-de-pedidos)
   - 5.6 [Perfil y direcciones](#56-perfil-y-direcciones)
6. [Módulo Administrador](#6-módulo-administrador)
   - 6.1 [Dashboard](#61-dashboard)
   - 6.2 [Productos](#62-productos)
   - 6.3 [Categorías](#63-categorías)
   - 6.4 [Cupones de descuento](#64-cupones-de-descuento)
   - 6.5 [Inventario](#65-inventario)
   - 6.6 [Facturas electrónicas](#66-facturas-electrónicas)
7. [Cálculos fiscales y logísticos](#7-cálculos-fiscales-y-logísticos)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)
9. [Solución de problemas](#9-solución-de-problemas)

---

## 1. Introducción

**Tienda Virtual CR** es una aplicación móvil full-stack diseñada para la venta en línea
en Costa Rica. Permite a un cliente explorar un catálogo jerárquico de productos,
armar un carrito, canjear cupones de descuento, seleccionar la dirección de entrega
sobre un mapa y pagar. La compra genera automáticamente una **factura electrónica con
IVA del 13 %**, que puede descargarse en PDF.

Un panel administrativo (rol *Administrador*) gestiona el catálogo, el inventario con
alertas de stock bajo, cupones, reportes con gráficos interactivos y facturas emitidas.

### Arquitectura

| Capa             | Tecnología                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| Frontend         | Ionic 8 + Angular 20 + Capacitor 8 + Chart.js + Leaflet                 |
| Backend          | ASP.NET Core 9 Web API + Entity Framework Core + JWT + BCrypt           |
| Base de datos    | SQL Server 2022 (producción) / SQLite (caché offline móvil)             |
| Mapas            | OpenStreetMap vía Leaflet (sin API key)                                 |
| Reportes         | jsPDF + jspdf-autotable (PDF) · xlsx + file-saver (Excel)               |

---

## 2. Requisitos del sistema

### Para el servidor

- Windows / Linux / macOS
- **.NET 9 SDK**
- **SQL Server 2019+** (o Express) accesible con autenticación Windows
- Puerto **5000** (HTTP) o **5001** (HTTPS) libres

### Para el frontend

- **Node.js 20+** y **npm 10+**
- **Ionic CLI** (`npm install -g @ionic/cli`)
- Navegador moderno: Chrome 120+, Edge 120+, Firefox 121+ o Safari 17+

### Para la app móvil (opcional)

- **Android Studio** (SDK 34+) para compilar APK
- Dispositivo o emulador Android 10+

---

## 3. Instalación y primera ejecución

### 3.1 Base de datos

Si aún no existe la base, créela con los scripts:

```bash
cd database
sqlcmd -S "TU_SERVIDOR" -E -C -i 01_SqlServer_Schema.sql
sqlcmd -S "TU_SERVIDOR" -E -C -i 02_SqlServer_Datos.sql
```

> El backend también la crea automáticamente al arrancar con `DbInitializer.Seed()`,
> que además inserta los usuarios demo y los datos de ejemplo.

### 3.2 Backend

```bash
cd backend/TiendaVirtual.Api
dotnet restore
dotnet run
```

La API queda disponible en `http://localhost:5000` con documentación Swagger en
`http://localhost:5000/swagger`.

### 3.3 Frontend web

```bash
cd frontend/tienda-virtual
npm install
ionic serve
```

Se abrirá `http://localhost:8100` con la versión web de la app.

### 3.4 App Android (opcional)

```bash
ionic build
npx cap sync android
npx cap open android
```

---

## 4. Acceso a la aplicación

La app abre en la pantalla de **Inicio de sesión**.

### Usuarios demo incluidos

| Rol            | Email                 | Contraseña |
| -------------- | --------------------- | ---------- |
| Administrador  | admin@tienda.cr       | Admin123!  |
| Cliente        | cliente@tienda.cr     | Cliente123!|

### Registro de nuevo cliente

En la pantalla de login, toca **Registrarse**, completa nombre, email (único) y
contraseña (mínimo 6 caracteres). Al confirmar, iniciarás sesión automáticamente
con rol *Cliente*.

---

## 5. Módulo Cliente

### 5.1 Navegar el catálogo

La pantalla principal muestra todos los productos activos. Dispones de:

- **Búsqueda por nombre** (barra superior, con autocompletado).
- **Filtro por categoría**: al elegir una categoría raíz se incluyen también sus
  subcategorías. Por ejemplo, al seleccionar *Electrónica* verás *Celulares* y
  *Laptops*.
- **Orden**: precio asc/desc, más populares, nombre.
- **Rango de precio** (opcional).

Cada tarjeta muestra imagen, nombre, precio en colones, categoría y un botón
**Agregar**. Si el stock está por debajo del mínimo, se muestra un aviso visual
(solo en la vista administrativa; el cliente siempre ve el producto si hay
existencias).

### 5.2 Detalle de producto

Al tocar un producto se abre la pantalla de detalle, que incluye:

- Imagen, descripción completa, precio y stock disponible.
- Selector de cantidad (no permite exceder el stock).
- Botón **Agregar al carrito**.

### 5.3 Carrito de compras

Accesible desde el icono del carrito en la barra superior. Permite:

- Ver cada producto con imagen, nombre, cantidad y subtotal.
- **Aumentar/disminuir** cantidad con los botones `+` y `–`.
- **Eliminar** un ítem (papelera).
- **Vaciar carrito** por completo.
- Ver el **subtotal** previo al checkout.

### 5.4 Finalizar compra (checkout)

El checkout recopila tres bloques de información:

1. **Dirección de entrega**
   - Puedes usar una dirección guardada de tu perfil o crear una nueva.
   - Aparece un **mapa interactivo (Leaflet)** donde puedes tocar un punto para
     ubicar la entrega. Las coordenadas se guardan automáticamente.
   - El sistema verifica que el punto esté dentro del territorio continental de
     Costa Rica; en caso contrario se muestra un error.

2. **Método de pago** (simulado)
   - Tarjeta (con campos de número, vencimiento y CVV).
   - Efectivo contra entrega.
   - Transferencia.

3. **Cupón de descuento** (opcional)
   - Escribe el código y toca **Validar**.
   - Si es válido, el descuento se aplica de inmediato al resumen.
   - Si no lo es, verás un mensaje claro: *cupón no existe*, *vencido*, *monto
     mínimo no alcanzado*, *límite de usos alcanzado*, etc.

**Resumen antes de pagar** muestra:

```
Subtotal         ₡ 45.000
Descuento        -₡ 4.500   (BIENVENIDA10)
Base imponible   ₡ 40.500
IVA 13 %         ₡  5.265
Envío            ₡  2.700   (8.9 km)
────────────────
TOTAL            ₡ 48.465
```

Opciones finales:

- **Confirmar compra** → reduce stock, genera factura, vacía carrito y ofrece descargar
  el PDF.
- **Generar proforma (PDF)** → crea un pedido con estado `Proforma` sin afectar stock,
  útil para cotizaciones.

### 5.5 Historial de pedidos

La sección **Mis pedidos** lista todas tus compras con:

- Número, fecha, estado (Pendiente, Procesando, Enviado, Entregado, Cancelado).
- Total con desglose.
- Botón **Ver factura** que descarga el PDF electrónico.
- Botón **Reimprimir proforma** para pedidos en estado Proforma.

### 5.6 Perfil y direcciones

En **Perfil** puedes:

- Ver y editar tus datos personales.
- Gestionar **direcciones guardadas**: agregar, editar, marcar una como
  *predeterminada* y eliminar.
- Cada dirección incluye provincia, cantón, distrito, detalle y coordenadas GPS
  elegidas en el mapa.
- Cambiar entre **modo claro y oscuro** desde el interruptor de tema.

---

## 6. Módulo Administrador

Entra con el usuario `admin@tienda.cr` y toca **Administración** en el menú lateral.
El panel se organiza en seis pestañas navegables con un segmento superior.

### 6.1 Dashboard

Pantalla de inicio con métricas en tiempo real:

**KPIs principales (tarjetas):**

- Total vendido (₡)
- Cantidad de pedidos
- Ticket promedio
- Clientes activos (compradores únicos)
- Productos con stock bajo

**Gráficos interactivos:**

| Gráfico             | Tipo         | Qué muestra                                   |
| ------------------- | ------------ | --------------------------------------------- |
| Ventas por día      | Líneas       | Evolución temporal de ingresos                |
| Top productos       | Barras       | 10 productos más vendidos por monto           |
| Top categorías      | Dona         | Participación de cada categoría en el total   |
| Métodos de pago     | Circular     | Distribución por forma de pago                |

**Filtros disponibles:**

- Fecha desde / hasta
- Categoría
- Método de pago

**Acciones:**

- **Aplicar** (recalcula con filtros)
- **Limpiar** (vuelve al rango por defecto)
- **Excel**: descarga un libro con todas las hojas del dashboard.

### 6.2 Productos

Lista todos los productos activos con imagen, nombre, categoría, stock y precio.
Un producto con stock por debajo del mínimo se marca en rojo con la etiqueta
**¡Stock bajo!**.

**Acciones:**

- **+** (botón flotante): crear producto nuevo. Formulario con nombre, descripción,
  precio, stock inicial, stock mínimo (default 5), URL imagen y categoría.
- **Lápiz**: editar nombre, precio, stock y stock mínimo.
- **Papelera**: eliminar (borrado lógico: `Activo = false`).

> Al crear un producto con stock > 0 se registra automáticamente un movimiento de
> inventario tipo *Entrada*. Al editar el stock se registra un *Ajuste*.

### 6.3 Categorías

Vista de árbol con categorías raíz y sus subcategorías. Cada nodo muestra su icono
Ionicons y descripción.

**Acciones:**

- **Nueva categoría raíz**: botón superior.
- **+** en una categoría raíz: crear subcategoría dentro.
- **Papelera**: eliminar. Una categoría no puede borrarse si tiene productos activos
  o subcategorías; el sistema lo impide con un mensaje explicativo.

### 6.4 Cupones de descuento

Gestión completa de códigos promocionales.

**Campos de un cupón:**

| Campo         | Descripción                                             |
| ------------- | ------------------------------------------------------- |
| Código        | Texto único, ej. `BIENVENIDA10`                         |
| Descripción   | Texto explicativo                                       |
| Tipo          | *Porcentaje* o *Monto fijo*                             |
| Valor         | 10 (para 10 %) o 5000 (para ₡5.000)                     |
| Fecha inicio  | Desde cuándo es válido                                  |
| Fecha fin     | Hasta cuándo                                            |
| Límite de uso | 0 = ilimitado, n = cantidad máxima de canjes            |
| Monto mínimo  | Subtotal necesario para poder canjear                   |
| Producto      | (Opcional) restringe el cupón a un único producto       |

**Acciones:**

- **Nuevo cupón**: botón superior con formulario en alerta.
- **Play / Pause** (icono lateral): activa/desactiva sin borrar.
- **Papelera**: eliminar definitivamente.

El contador *Usos actuales* avanza automáticamente cuando un cliente canjea el
cupón en el checkout.

### 6.5 Inventario

Sección dedicada a la gestión del stock. Combina tres vistas:

**Alertas de stock bajo (tarjeta superior)**
Solo aparece si hay productos con `stock ≤ stockMinimo`. Muestra nombre, categoría
y niveles. Incluye botón **Notificar por correo** que envía aviso al administrador
(en modo demo lo registra en consola del servidor).

**Acciones principales**

- **Reabastecer**: formulario para seleccionar un producto, ingresar cantidad a
  agregar y motivo. Genera un movimiento *Entrada* automáticamente.
- **Excel**: descarga el historial de movimientos filtrado.

**Historial de movimientos**
Lista cronológica (descendente) con:

- Icono verde ↓ para *Entrada*, rojo ↑ para *Salida*, naranja ↻ para *Ajuste*.
- Producto, cantidad, stock antes → stock después, fecha, usuario responsable
  y motivo.

### 6.6 Facturas electrónicas

Listado de todas las facturas generadas por el sistema. Cada renglón muestra:

- Número consecutivo (formato `FE-0000000001`)
- Cliente y fecha de emisión
- Base imponible e IVA
- Total

**Acciones:**

- **Download** (icono): genera y descarga el **PDF de la factura** con desglose
  tributario completo, clave numérica de 50 dígitos y pie de página legal.
- **Exportar Excel**: todas las facturas a un libro `.xlsx`.

---

## 7. Cálculos fiscales y logísticos

### IVA 13 % (Costa Rica)

```
Base imponible = Subtotal − Descuento
IVA            = Base imponible × 0.13
Total          = Base imponible + IVA + Costo de envío
```

### Costo de envío

El cálculo se hace desde las coordenadas de la tienda
(`10.174564601257563, −83.7800279420646`) usando la fórmula de **Haversine**:

1. Si la dirección está fuera de Costa Rica continental (bounding box
   lat 8.0 – 11.25, lng −85.95 – −82.55) → **error, no se acepta**.
2. Si el subtotal ≥ **₡50.000** → **envío gratis**.
3. Caso contrario:
   ```
   costo = 1500 (base) + 300 × distanciaKm
   ```
   con un tope máximo de **₡10.000**.

### Cupones

Validación secuencial:

1. ¿Existe el código? → *Cupón no encontrado*.
2. ¿Está activo? → *Cupón inactivo*.
3. ¿Fecha actual entre inicio y fin? → *Cupón fuera de vigencia*.
4. ¿Usos actuales < límite? → *Límite de usos alcanzado*.
5. ¿Subtotal ≥ monto mínimo? → *Monto mínimo de ₡X no alcanzado*.
6. Si es específico: ¿producto está en el carrito? → *El cupón no aplica a los
   productos seleccionados*.

Si todas las reglas pasan, se calcula:

```
Porcentaje: descuento = subtotal × valor / 100
Monto fijo: descuento = min(valor, subtotal)
```

### Facturación consecutiva

- Número: `FE-{10 dígitos}` incremental.
- Clave numérica: `506{ddMMyy}{pedidoId:D10}{padding}` (50 caracteres totales).
- Inmutable una vez creada.

---

## 8. Preguntas frecuentes

**¿Qué pasa si quiero comprar desde fuera de Costa Rica?**
El sistema detecta la ubicación vía GPS del mapa. Solo acepta direcciones dentro
del territorio continental de Costa Rica.

**¿Puedo usar varios cupones a la vez?**
No. Solo uno por pedido. Si aplicas uno nuevo, reemplaza al anterior.

**¿El envío gratis incluye el IVA en el cálculo del umbral?**
No. Los ₡50.000 se miden sobre el **subtotal neto** (antes de IVA).

**¿Puedo cambiar la contraseña del administrador?**
Sí, desde la pantalla de Perfil del administrador.

**¿Los datos se sincronizan al usar la app offline?**
La app móvil mantiene un caché SQLite del catálogo y del carrito. Los pedidos
deben confirmarse estando en línea.

**¿Puedo exportar reportes a Excel?**
Sí, tanto el dashboard completo como el historial de movimientos de inventario
y el listado de facturas tienen botón *Excel*.

**¿El PDF de la factura cumple con Hacienda?**
El documento es **demostrativo**. Incluye consecutivo y clave numérica con el
formato costarricense, pero no está firmado digitalmente ni transmitido al API
del Ministerio de Hacienda.

---

## 9. Solución de problemas

| Síntoma                                             | Causa probable                                      | Solución                                                    |
| --------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| "No se puede conectar con el servidor"              | Backend apagado o URL equivocada                    | `dotnet run` en `backend/TiendaVirtual.Api`                 |
| "Credenciales inválidas"                            | Contraseña mal escrita                              | Verificar usuarios demo; probar *olvidé contraseña*         |
| El mapa no carga                                    | Sin internet                                        | Conectarse a red Wi-Fi o datos móviles                      |
| "Cupón fuera de vigencia"                           | `FechaFin` pasada                                   | Admin: editar el cupón o crear uno nuevo                    |
| "Stock insuficiente" al confirmar                   | Otro cliente compró primero                         | Reducir cantidad o esperar reabastecimiento                 |
| Dashboard sin datos                                 | Aún no hay pedidos en el rango                      | Ajustar filtros de fecha o crear pedidos demo               |
| El PDF se ve mal en móvil                           | Visor predeterminado limitado                       | Abrir con Google Drive / Adobe Reader                       |
| "Dirección fuera de Costa Rica"                     | Punto del mapa fuera del bounding box               | Mover el marcador dentro del territorio nacional            |

---

**Fin del manual.**
Para soporte técnico, contacta al equipo del proyecto de Programación V.
