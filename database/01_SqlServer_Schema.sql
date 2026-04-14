-- =====================================================================
--  Tienda Virtual - Esquema completo para SQL Server
--  Ejecutar como sa o usuario con permisos CREATE DATABASE
-- =====================================================================

IF DB_ID('TiendaVirtualDB') IS NULL
BEGIN
    CREATE DATABASE TiendaVirtualDB;
END
GO

USE TiendaVirtualDB;
GO

-- ---------------------------------------------------------------------
-- Usuarios
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        UsuarioId       INT IDENTITY(1,1) PRIMARY KEY,
        Nombre          NVARCHAR(100) NOT NULL,
        Email           NVARCHAR(150) NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(500) NOT NULL,
        Rol             NVARCHAR(20)  NOT NULL DEFAULT 'Cliente',
        Telefono        NVARCHAR(20)  NULL,
        Direccion       NVARCHAR(250) NULL,
        Activo          BIT           NOT NULL DEFAULT 1,
        FechaRegistro   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- ---------------------------------------------------------------------
-- Categorías (con soporte jerárquico)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Categorias', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categorias (
        CategoriaId      INT IDENTITY(1,1) PRIMARY KEY,
        Nombre           NVARCHAR(80)  NOT NULL,
        Descripcion      NVARCHAR(250) NULL,
        Icono            NVARCHAR(250) NULL,
        Activo           BIT           NOT NULL DEFAULT 1,
        CategoriaPadreId INT           NULL,
        CONSTRAINT FK_Categorias_Padre
            FOREIGN KEY (CategoriaPadreId) REFERENCES dbo.Categorias(CategoriaId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Productos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos (
        ProductoId     INT IDENTITY(1,1) PRIMARY KEY,
        Nombre         NVARCHAR(150)  NOT NULL,
        Descripcion    NVARCHAR(1000) NULL,
        Precio         DECIMAL(18,2)  NOT NULL,
        Stock          INT            NOT NULL DEFAULT 0,
        StockMinimo    INT            NOT NULL DEFAULT 5,
        ImagenUrl      NVARCHAR(500)  NULL,
        Popularidad    INT            NOT NULL DEFAULT 0,
        Activo         BIT            NOT NULL DEFAULT 1,
        FechaCreacion  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
        CategoriaId    INT            NOT NULL,
        CONSTRAINT FK_Productos_Categorias
            FOREIGN KEY (CategoriaId) REFERENCES dbo.Categorias(CategoriaId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Cupones de descuento
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Cupones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cupones (
        CuponId       INT IDENTITY(1,1) PRIMARY KEY,
        Codigo        NVARCHAR(30)  NOT NULL UNIQUE,
        Descripcion   NVARCHAR(200) NULL,
        Tipo          INT           NOT NULL, -- 1 Porcentaje, 2 MontoFijo
        Valor         DECIMAL(18,2) NOT NULL,
        FechaInicio   DATETIME2     NOT NULL,
        FechaFin      DATETIME2     NOT NULL,
        LimiteUso     INT           NOT NULL DEFAULT 0,
        UsosActuales  INT           NOT NULL DEFAULT 0,
        MontoMinimo   DECIMAL(18,2) NOT NULL DEFAULT 0,
        ProductoId    INT           NULL,
        Activo        BIT           NOT NULL DEFAULT 1,
        CONSTRAINT FK_Cupones_Productos
            FOREIGN KEY (ProductoId) REFERENCES dbo.Productos(ProductoId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Direcciones (una o varias por usuario, con coordenadas)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Direcciones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Direcciones (
        DireccionId    INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId      INT            NOT NULL,
        Provincia      NVARCHAR(80)   NOT NULL,
        Canton         NVARCHAR(80)   NOT NULL,
        Distrito       NVARCHAR(80)   NOT NULL,
        Detalle        NVARCHAR(500)  NOT NULL,
        Latitud        FLOAT          NOT NULL,
        Longitud       FLOAT          NOT NULL,
        Predeterminada BIT            NOT NULL DEFAULT 0,
        FechaCreacion  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Direcciones_Usuarios
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId) ON DELETE CASCADE
    );
END
GO

-- ---------------------------------------------------------------------
-- Carritos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Carritos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Carritos (
        CarritoItemId  INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId      INT           NOT NULL,
        ProductoId     INT           NOT NULL,
        Cantidad       INT           NOT NULL,
        PrecioUnitario DECIMAL(18,2) NOT NULL,
        FechaAgregado  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Carritos_Usuarios
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId),
        CONSTRAINT FK_Carritos_Productos
            FOREIGN KEY (ProductoId) REFERENCES dbo.Productos(ProductoId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Pedidos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pedidos (
        PedidoId       INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId      INT            NOT NULL,
        Fecha          DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
        Subtotal       DECIMAL(18,2)  NOT NULL DEFAULT 0,
        Iva            DECIMAL(18,2)  NOT NULL DEFAULT 0,
        Descuento      DECIMAL(18,2)  NOT NULL DEFAULT 0,
        CostoEnvio     DECIMAL(18,2)  NOT NULL DEFAULT 0,
        Total          DECIMAL(18,2)  NOT NULL DEFAULT 0,
        Estado         NVARCHAR(30)   NOT NULL DEFAULT 'Pendiente',
        MetodoPago     NVARCHAR(30)   NOT NULL DEFAULT 'Simulado',
        DireccionEnvio NVARCHAR(250)  NULL,
        Latitud        FLOAT          NULL,
        Longitud       FLOAT          NULL,
        EsProforma     BIT            NOT NULL DEFAULT 0,
        CuponId        INT            NULL,
        CONSTRAINT FK_Pedidos_Usuarios
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId),
        CONSTRAINT FK_Pedidos_Cupones
            FOREIGN KEY (CuponId) REFERENCES dbo.Cupones(CuponId)
    );
END
GO

-- ---------------------------------------------------------------------
-- PedidoDetalles
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.PedidoDetalles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PedidoDetalles (
        PedidoDetalleId INT IDENTITY(1,1) PRIMARY KEY,
        PedidoId        INT            NOT NULL,
        ProductoId      INT            NOT NULL,
        Cantidad        INT            NOT NULL,
        PrecioUnitario  DECIMAL(18,2)  NOT NULL,
        Subtotal        DECIMAL(18,2)  NOT NULL,
        CONSTRAINT FK_Detalles_Pedidos
            FOREIGN KEY (PedidoId) REFERENCES dbo.Pedidos(PedidoId) ON DELETE CASCADE,
        CONSTRAINT FK_Detalles_Productos
            FOREIGN KEY (ProductoId) REFERENCES dbo.Productos(ProductoId)
    );
END
GO

-- ---------------------------------------------------------------------
-- MovimientosInventario (historial de entradas/salidas/ajustes)
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.MovimientosInventario', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MovimientosInventario (
        MovimientoId   INT IDENTITY(1,1) PRIMARY KEY,
        ProductoId     INT           NOT NULL,
        Tipo           INT           NOT NULL, -- 1 Entrada, 2 Salida, 3 Ajuste
        Cantidad       INT           NOT NULL,
        StockAnterior  INT           NOT NULL,
        StockNuevo     INT           NOT NULL,
        Motivo         NVARCHAR(250) NULL,
        Fecha          DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
        UsuarioId      INT           NULL,
        CONSTRAINT FK_Movimientos_Productos
            FOREIGN KEY (ProductoId) REFERENCES dbo.Productos(ProductoId) ON DELETE CASCADE,
        CONSTRAINT FK_Movimientos_Usuarios
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Facturas electrónicas
-- ---------------------------------------------------------------------
IF OBJECT_ID('dbo.Facturas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Facturas (
        FacturaId          INT IDENTITY(1,1) PRIMARY KEY,
        NumeroConsecutivo  NVARCHAR(30)  NOT NULL UNIQUE,
        ClaveNumerica      NVARCHAR(60)  NULL,
        PedidoId           INT           NOT NULL UNIQUE,
        UsuarioId          INT           NOT NULL,
        Subtotal           DECIMAL(18,2) NOT NULL,
        Descuento          DECIMAL(18,2) NOT NULL,
        BaseImponible      DECIMAL(18,2) NOT NULL,
        Iva                DECIMAL(18,2) NOT NULL,
        CostoEnvio         DECIMAL(18,2) NOT NULL DEFAULT 0,
        Total              DECIMAL(18,2) NOT NULL,
        FechaEmision       DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Facturas_Pedidos
            FOREIGN KEY (PedidoId) REFERENCES dbo.Pedidos(PedidoId) ON DELETE CASCADE,
        CONSTRAINT FK_Facturas_Usuarios
            FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId)
    );
END
GO

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Productos_Categoria')
    CREATE INDEX IX_Productos_Categoria ON dbo.Productos(CategoriaId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Productos_StockMinimo')
    CREATE INDEX IX_Productos_StockMinimo ON dbo.Productos(Stock, StockMinimo);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Pedidos_Usuario')
    CREATE INDEX IX_Pedidos_Usuario ON dbo.Pedidos(UsuarioId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Pedidos_Fecha')
    CREATE INDEX IX_Pedidos_Fecha ON dbo.Pedidos(Fecha);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Carritos_Usuario')
    CREATE INDEX IX_Carritos_Usuario ON dbo.Carritos(UsuarioId);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Movimientos_Producto')
    CREATE INDEX IX_Movimientos_Producto ON dbo.MovimientosInventario(ProductoId, Fecha);
GO

PRINT 'Esquema de TiendaVirtualDB creado correctamente.';
GO
