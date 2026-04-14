# Tienda Virtual para Móviles — Proyecto Final Programación V

Aplicación móvil multiplataforma (iOS/Android) construida con **Ionic + Angular**,
respaldada por un backend en **ASP.NET Core Web API** con **SQL Server** y una base
de datos local **SQLite** para uso offline.

## Estructura del repositorio

```
Proyecto final progra V/
├─ backend/                 # API REST ASP.NET Core (.NET 9)
│  └─ TiendaVirtual.Api/
├─ frontend/                # Aplicación Ionic + Angular
│  └─ tienda-virtual/
├─ database/                # Scripts SQL Server y SQLite
├─ docs/                    # (opcional) documentación del proyecto
└─ README.md
```

## Requisitos

| Herramienta           | Versión mínima |
| --------------------- | -------------- |
| Node.js               | 20+            |
| npm                   | 10+            |
| .NET SDK              | 9.0            |
| SQL Server / LocalDB  | 2019 +         |
| Ionic CLI             | 7+  (`npm i -g @ionic/cli`) |
| Android Studio        | Flamingo +     |
| JDK                   | 17             |

## 1. Levantar el **backend** desde Visual Studio Code

```bash
cd backend/TiendaVirtual.Api
dotnet restore
dotnet run
```

- La API queda corriendo en `http://localhost:5229`.
- Swagger: <http://localhost:5229/swagger>.
- La cadena de conexión está en `appsettings.json` apuntando a la instancia
  `Timid\HOTBOYSINC` de SQL Server con autenticación integrada. Cámbiala si usas
  otra instancia (por ejemplo `(localdb)\MSSQLLocalDB` si instalas LocalDB).
- Al arrancar, el backend **crea automáticamente la base `TiendaVirtualDB`**,
  aplica el esquema y siembra datos iniciales:
  - Categorías: Electrónica, Ropa, Hogar, Deportes.
  - 5 productos demo.
  - Usuario **admin@tienda.com** / `Admin123!`
  - Usuario **cliente@tienda.com** / `Cliente123!`

> Si prefieres crear la BD manualmente, usa los scripts en `database/`:
> `01_SqlServer_Schema.sql` y `02_SqlServer_Datos.sql`.

### Endpoints principales

| Método | Ruta                       | Descripción                          |
| ------ | -------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`       | Crea cuenta (rol Cliente)            |
| POST   | `/api/auth/login`          | Devuelve JWT                         |
| GET    | `/api/productos`           | Listado con filtros + ordenamiento   |
| GET    | `/api/productos/autocomplete?q=` | Búsqueda inteligente           |
| GET    | `/api/categorias`          | Categorías activas                   |
| GET    | `/api/carrito`             | Carrito del usuario autenticado      |
| POST   | `/api/pedidos`             | Crea pedido/proforma                 |
| GET    | `/api/reportes/ventas`     | Reporte de ventas (Administrador)    |
| GET    | `/api/reportes/usuarios`   | Reporte de usuarios (Administrador)  |
| GET    | `/api/reportes/inventario` | Reporte de inventario (Administrador)|

## 2. Levantar el **frontend** desde Visual Studio Code

```bash
cd frontend/tienda-virtual
npm install       # solo la primera vez
ionic serve
```

La app queda corriendo en <http://localhost:8100>. Todos los cambios de código
se reflejan en caliente.

> Si cambias el puerto del backend, edítalo en
> `src/environments/environment.ts` (`apiUrl`).

## 3. Correr la app en **Android Studio**

```bash
cd frontend/tienda-virtual
ionic build                 # compila la web
npx cap sync android        # copia assets al proyecto nativo
npx cap open android        # abre Android Studio
```

En Android Studio:
1. Espera a que Gradle termine de sincronizar.
2. Selecciona un **emulador** (AVD) o un dispositivo físico conectado por USB.
3. Presiona el botón **Run** (`Shift + F10`).

### Conectar el emulador al backend local

En el emulador de Android, `localhost` apunta al propio emulador, **no** a tu PC.
Para que la app se comunique con la API:

- Usa `http://10.0.2.2:5229/api` en `environment.ts` cuando pruebes en el emulador.
- Si usas un dispositivo físico, usa la IP LAN de tu computadora (por ejemplo
  `http://192.168.1.10:5229/api`) y asegúrate de que ambos estén en la misma red.
- El backend ya tiene **CORS** habilitado para orígenes de Ionic/Capacitor.

Si tu API solo corre en HTTPS con certificado autofirmado, habilita texto plano
agregando `cleartext: true` al `server` de `capacitor.config.ts` y recompila.

## 4. Funcionalidades implementadas

### Componentes de Ionic usados

Alert, Card, Menu, Button, Content, FAB (Floating action button), Datetime,
List, Item, Image, Maps (iframe), Toast, Toggle, Toolbar, Tabs,
Item-Sliding, Modal, Segment, Searchbar, Refresher, Badge, Chip.

### Modos de la aplicación (3 temas)

- **Claro** (por defecto)
- **Oscuro**
- **Alto contraste**

Se alternan desde el **menú lateral** y quedan persistidos en `localStorage`.

### Módulos

- **Catálogo dinámico** con:
  - Filtros por categoría, precio, popularidad.
  - Búsqueda con **autocompletado**.
  - Orden por nombre, precio y popularidad.
- **Carrito persistente** sincronizado con el backend cuando el usuario está
  logueado; en modo offline usa `localStorage` (SQLite como cache local
  opcional, incluido en `database/03_SQLite_Schema.sql`).
- **Simulador de pago** (tarjeta / efectivo / transferencia) con validación
  de stock en tiempo real desde el backend.
- **Registro / login con JWT** (guardado en `localStorage`).
  Dos roles: `Cliente` y `Administrador`.
- **Proformas** con descarga de PDF (jsPDF).
- **Pedidos** con cambio de estado (confirmado, enviado, entregado, cancelado)
  solo visible para el administrador.
- **Panel de administración**: CRUD de productos + reportes de ventas,
  usuarios e inventario.
- **Gestos**: `ion-item-sliding` para eliminar items del carrito.
- **Bootstrap 5** disponible para utilidades de grid/espaciado.

## 5. Usuarios demo

| Rol            | Email                | Contraseña |
| -------------- | -------------------- | ---------- |
| Administrador  | admin@tienda.com     | Admin123!  |
| Cliente        | cliente@tienda.com   | Cliente123!|

## 6. Workflow recomendado en Visual Studio Code

Abrir la carpeta raíz `Proyecto final progra V/` en VS Code y trabajar con dos
terminales:

- Terminal 1 — Backend:
  ```bash
  cd backend/TiendaVirtual.Api
  dotnet watch run
  ```
- Terminal 2 — Frontend:
  ```bash
  cd frontend/tienda-virtual
  ionic serve
  ```

Extensiones recomendadas:
- **C# Dev Kit**
- **Angular Language Service**
- **Ionic** (oficial de Ionic)
- **ESLint**
- **SQL Server (mssql)** para ejecutar los scripts de `database/`.

## 7. Generar APK firmada (para entrega)

```bash
cd frontend/tienda-virtual
ionic build --prod
npx cap sync android
cd android
./gradlew assembleRelease      # Linux/macOS
gradlew.bat assembleRelease    # Windows
```

El APK queda en `android/app/build/outputs/apk/release/`.

## 8. Documentación del proyecto (a entregar)

En la carpeta `docs/` puedes colocar:
- Manual de usuario.
- Documento del proyecto (introducción, objetivos, requerimientos, MER, UML,
  casos de uso, conclusiones) según los requisitos del PDF.
- Diagrama entidad-relación (`database/01_SqlServer_Schema.sql` sirve como
  referencia del modelo).
