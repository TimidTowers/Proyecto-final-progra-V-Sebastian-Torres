-- =====================================================================
--  Datos iniciales para TiendaVirtualDB
--  (categorías jerárquicas, productos demo, cupones)
-- =====================================================================
USE TiendaVirtualDB;
GO

-- ---------------------------------------------------------------------
-- Categorías raíz
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Categorias WHERE Nombre = N'Electrónica')
    INSERT INTO dbo.Categorias (Nombre, Descripcion, Icono) VALUES
        (N'Electrónica', N'Dispositivos electrónicos', 'hardware-chip'),
        (N'Ropa',        N'Ropa y accesorios',          'shirt'),
        (N'Hogar',       N'Artículos para el hogar',    'home'),
        (N'Deportes',    N'Artículos deportivos',       'football');
GO

-- ---------------------------------------------------------------------
-- Subcategorías (demuestran la jerarquía)
-- ---------------------------------------------------------------------
DECLARE @ele INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Electrónica');
DECLARE @rop INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Ropa');

IF NOT EXISTS (SELECT 1 FROM dbo.Categorias WHERE Nombre = N'Celulares')
    INSERT INTO dbo.Categorias (Nombre, Descripcion, Icono, CategoriaPadreId) VALUES
        (N'Celulares', N'Smartphones y accesorios', 'phone-portrait', @ele),
        (N'Laptops',   N'Computadoras portátiles',  'laptop',         @ele),
        (N'Caballero', N'Ropa para hombre',         'man',            @rop),
        (N'Dama',      N'Ropa para mujer',          'woman',          @rop);
GO

-- ---------------------------------------------------------------------
-- Productos demo (7 por subcategoría)
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Productos)
BEGIN
    DECLARE @cel  INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Celulares');
    DECLARE @lap  INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Laptops');
    DECLARE @cab  INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Caballero');
    DECLARE @dam  INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Dama');
    DECLARE @hog2 INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Hogar');
    DECLARE @dep2 INT = (SELECT TOP 1 CategoriaId FROM dbo.Categorias WHERE Nombre=N'Deportes');

    -- Celulares
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Smartphone X1',         N'Teléfono inteligente 6.5" · 128GB · 8GB RAM',             350000, 15,  5, 'https://picsum.photos/seed/cel1/400/300', 50, @cel),
        (N'iPhone 15 Pro',         N'Apple A17 Pro · 256GB · cámara ProRAW',                   695000, 10,  3, 'https://picsum.photos/seed/cel2/400/300', 95, @cel),
        (N'Samsung Galaxy S24',    N'Snapdragon 8 Gen 3 · 256GB · AMOLED 120Hz',               550000, 12,  4, 'https://picsum.photos/seed/cel3/400/300', 80, @cel),
        (N'Xiaomi Redmi Note 13',  N'108MP · batería 5000mAh · carga rápida 67W',              145000, 25,  6, 'https://picsum.photos/seed/cel4/400/300', 60, @cel),
        (N'Motorola Edge 50',      N'Pantalla curva 144Hz · 256GB · IP68',                     240000, 18,  5, 'https://picsum.photos/seed/cel5/400/300', 45, @cel),
        (N'Google Pixel 8',        N'Tensor G3 · 128GB · Android puro con 7 años de updates',  480000,  9,  3, 'https://picsum.photos/seed/cel6/400/300', 70, @cel),
        (N'Huawei Nova 12',        N'Kirin · 256GB · batería 4600mAh',                         280000, 14,  4, 'https://picsum.photos/seed/cel7/400/300', 35, @cel);

    -- Laptops
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Laptop Pro 15',         N'Laptop profesional · 16GB RAM · 512GB SSD',                750000,  8, 3, 'https://picsum.photos/seed/lap1/400/300', 75, @lap),
        (N'MacBook Air M3',        N'Apple M3 · 8GB · 256GB · pantalla Retina 13"',             980000,  6, 2, 'https://picsum.photos/seed/lap2/400/300', 92, @lap),
        (N'Dell XPS 13',           N'Intel Core i7 · 16GB · 512GB SSD · InfinityEdge',          820000,  7, 2, 'https://picsum.photos/seed/lap3/400/300', 68, @lap),
        (N'HP Pavilion 14',        N'Ryzen 5 · 8GB · 512GB SSD · ideal estudiantes',            450000, 12, 4, 'https://picsum.photos/seed/lap4/400/300', 55, @lap),
        (N'Lenovo ThinkPad T14',   N'Core i5 · 16GB · 1TB SSD · teclado retroiluminado',        690000,  5, 2, 'https://picsum.photos/seed/lap5/400/300', 62, @lap),
        (N'Asus ROG Strix G16',    N'Core i9 · RTX 4070 · 32GB · 1TB (gamer)',                 1100000,  4, 2, 'https://picsum.photos/seed/lap6/400/300', 85, @lap),
        (N'Acer Aspire 5',         N'Core i3 · 8GB · 256GB · básica de oficina',                390000, 11, 3, 'https://picsum.photos/seed/lap7/400/300', 40, @lap);

    -- Caballero
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Camisa Casual',         N'Camisa de algodón manga larga · talla M',                   15000, 30, 10, 'https://picsum.photos/seed/cab1/400/300', 20, @cab),
        (N'Camiseta Polo',         N'Polo pique clásico · varios colores',                       12000, 40, 12, 'https://picsum.photos/seed/cab2/400/300', 28, @cab),
        (N'Pantalón Chino',        N'Corte slim · algodón stretch · beige',                      22000, 22,  6, 'https://picsum.photos/seed/cab3/400/300', 25, @cab),
        (N'Jeans Clásicos',        N'Denim resistente · corte regular',                          18000, 28,  8, 'https://picsum.photos/seed/cab4/400/300', 32, @cab),
        (N'Chaqueta Jean',         N'Chaqueta denim con bolsillos frontales',                    28000, 15,  5, 'https://picsum.photos/seed/cab5/400/300', 22, @cab),
        (N'Zapatos de Cuero',      N'Zapatos formales · cuero genuino',                          45000, 18,  6, 'https://picsum.photos/seed/cab6/400/300', 38, @cab),
        (N'Suéter de Lana',        N'Suéter cuello redondo · 100% lana',                         20000, 20,  6, 'https://picsum.photos/seed/cab7/400/300', 18, @cab);

    -- Dama
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Blusa de Seda',         N'Blusa manga corta · seda suave',                            18000, 26,  8, 'https://picsum.photos/seed/dam1/400/300', 30, @dam),
        (N'Vestido Floral',        N'Vestido midi estampado floral · verano',                    26000, 20,  5, 'https://picsum.photos/seed/dam2/400/300', 45, @dam),
        (N'Falda Plisada',         N'Falda media · plisado fino',                                16000, 24,  7, 'https://picsum.photos/seed/dam3/400/300', 22, @dam),
        (N'Jeans Slim Fit',        N'Denim elástico · tiro alto',                                19000, 30,  9, 'https://picsum.photos/seed/dam4/400/300', 40, @dam),
        (N'Chaqueta Ligera',       N'Chaqueta entretiempo · nylon impermeable',                   24000, 16,  5, 'https://picsum.photos/seed/dam5/400/300', 27, @dam),
        (N'Bolso de Mano',         N'Bolso elegante · piel sintética · varios colores',           32000, 14,  4, 'https://picsum.photos/seed/dam6/400/300', 50, @dam),
        (N'Zapatos de Tacón',      N'Tacón 7cm · punta cerrada',                                 38000, 17,  5, 'https://picsum.photos/seed/dam7/400/300', 42, @dam);

    -- Hogar
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Set de Sartenes',       N'Juego de 3 sartenes antiadherentes',                        25000, 12, 4, 'https://picsum.photos/seed/hog1/400/300', 30, @hog2),
        (N'Licuadora Pro',         N'1200W · vaso de vidrio 1.5L · 10 velocidades',              45000, 10, 3, 'https://picsum.photos/seed/hog2/400/300', 55, @hog2),
        (N'Aspiradora Vertical',   N'Inalámbrica · 25 min autonomía · filtro HEPA',              85000,  8, 3, 'https://picsum.photos/seed/hog3/400/300', 48, @hog2),
        (N'Plancha de Vapor',      N'Suela cerámica · golpe de vapor 120g',                      28000, 15, 5, 'https://picsum.photos/seed/hog4/400/300', 25, @hog2),
        (N'Cafetera Express',      N'15 bares · espumador de leche · 2 tazas',                   95000,  7, 2, 'https://picsum.photos/seed/hog5/400/300', 65, @hog2),
        (N'Juego de Sábanas',      N'Matrimonial · 400 hilos · 100% algodón',                    32000, 20, 6, 'https://picsum.photos/seed/hog6/400/300', 28, @hog2),
        (N'Vajilla 24 Piezas',     N'Porcelana · servicio para 6 personas',                      48000,  9, 3, 'https://picsum.photos/seed/hog7/400/300', 33, @hog2);

    -- Deportes
    INSERT INTO dbo.Productos (Nombre, Descripcion, Precio, Stock, StockMinimo, ImagenUrl, Popularidad, CategoriaId) VALUES
        (N'Balón de Fútbol',       N'Balón oficial tamaño 5 · cosido a mano',                    12000, 25,  8, 'https://picsum.photos/seed/dep1/400/300', 40, @dep2),
        (N'Raqueta de Tenis',      N'Grafito · cuerda sintética · funda incluida',               35000, 14,  4, 'https://picsum.photos/seed/dep2/400/300', 30, @dep2),
        (N'Guantes de Boxeo',      N'12oz · piel sintética · muñequera ajustable',               22000, 18,  6, 'https://picsum.photos/seed/dep3/400/300', 22, @dep2),
        (N'Mat de Yoga',           N'6mm · antideslizante · con correa',                         15000, 30, 10, 'https://picsum.photos/seed/dep4/400/300', 35, @dep2),
        (N'Bicicleta BMX',         N'Marco acero reforzado · 20" · frenos V-brake',             180000,  5,  2, 'https://picsum.photos/seed/dep5/400/300', 58, @dep2),
        (N'Juego de Pesas 20kg',   N'Discos 2x5kg + 2x2.5kg + 2x2kg + barra',                    65000,  8,  3, 'https://picsum.photos/seed/dep6/400/300', 42, @dep2),
        (N'Jersey Deportivo',      N'Dri-fit · transpirable · varios colores',                   18000, 28,  8, 'https://picsum.photos/seed/dep7/400/300', 26, @dep2);
END
GO

-- ---------------------------------------------------------------------
-- Cupones demo
-- ---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Cupones WHERE Codigo = 'BIENVENIDA10')
    INSERT INTO dbo.Cupones (Codigo, Descripcion, Tipo, Valor, FechaInicio, FechaFin, LimiteUso, MontoMinimo, Activo) VALUES
        ('BIENVENIDA10', N'10% de descuento en tu primera compra', 1, 10,
            DATEADD(DAY, -7, SYSUTCDATETIME()), DATEADD(MONTH, 3, SYSUTCDATETIME()), 100, 10000, 1),
        ('ENVIOGRATIS',  N'5.000 colones de descuento en pedidos >= 25.000', 2, 5000,
            DATEADD(DAY, -1, SYSUTCDATETIME()), DATEADD(MONTH, 1, SYSUTCDATETIME()),   0, 25000, 1),
        ('CRNAVIDAD',    N'15% de descuento temporada alta', 1, 15,
            SYSUTCDATETIME(), DATEADD(MONTH, 2, SYSUTCDATETIME()), 50, 50000, 1);
GO

-- Nota: los usuarios iniciales (admin/cliente) se crean automáticamente
-- por la aplicación (DbInitializer.Seed) para poder usar hashing BCrypt.
PRINT 'Datos semilla cargados en TiendaVirtualDB.';
GO
