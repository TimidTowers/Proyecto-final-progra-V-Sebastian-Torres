-- =====================================================================
--  Base local SQLite - cache offline para la app Ionic
--  Se crea con: sqlite3 tienda.db < 03_SQLite_Schema.sql
-- =====================================================================

CREATE TABLE IF NOT EXISTS Categorias (
    CategoriaId      INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre           TEXT NOT NULL,
    Descripcion      TEXT,
    Icono            TEXT,
    CategoriaPadreId INTEGER,
    Activo           INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (CategoriaPadreId) REFERENCES Categorias(CategoriaId)
);

CREATE TABLE IF NOT EXISTS Productos (
    ProductoId    INTEGER PRIMARY KEY AUTOINCREMENT,
    Nombre        TEXT NOT NULL,
    Descripcion   TEXT,
    Precio        REAL NOT NULL,
    Stock         INTEGER NOT NULL DEFAULT 0,
    StockMinimo   INTEGER NOT NULL DEFAULT 5,
    ImagenUrl     TEXT,
    Popularidad   INTEGER NOT NULL DEFAULT 0,
    CategoriaId   INTEGER NOT NULL,
    Activo        INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (CategoriaId) REFERENCES Categorias(CategoriaId)
);

CREATE TABLE IF NOT EXISTS CarritoLocal (
    Id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ProductoId     INTEGER NOT NULL,
    Nombre         TEXT NOT NULL,
    ImagenUrl      TEXT,
    Cantidad       INTEGER NOT NULL,
    PrecioUnitario REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS PedidosLocal (
    PedidoId      INTEGER PRIMARY KEY AUTOINCREMENT,
    Fecha         TEXT NOT NULL,
    Subtotal      REAL NOT NULL DEFAULT 0,
    Iva           REAL NOT NULL DEFAULT 0,
    Descuento     REAL NOT NULL DEFAULT 0,
    CostoEnvio    REAL NOT NULL DEFAULT 0,
    Total         REAL NOT NULL,
    Estado        TEXT NOT NULL,
    EsProforma    INTEGER NOT NULL DEFAULT 0,
    NumeroFactura TEXT,
    JsonDetalles  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS CuponesLocal (
    CuponId     INTEGER PRIMARY KEY AUTOINCREMENT,
    Codigo      TEXT NOT NULL UNIQUE,
    Descripcion TEXT,
    Tipo        INTEGER NOT NULL,
    Valor       REAL NOT NULL,
    FechaFin    TEXT,
    MontoMinimo REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS IX_Productos_Categoria ON Productos(CategoriaId);
CREATE INDEX IF NOT EXISTS IX_Productos_Stock ON Productos(Stock, StockMinimo);
