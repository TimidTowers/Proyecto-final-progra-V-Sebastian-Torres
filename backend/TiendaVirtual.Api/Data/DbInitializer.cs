using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Models;

namespace TiendaVirtual.Api.Data;

/// <summary>
/// Siembra los datos iniciales que no pueden ir en HasData (como contraseñas
/// hasheadas con BCrypt y fechas dinámicas).
/// Además, garantiza que los 42 productos del catálogo existan en la base de
/// datos, incluso si esta fue creada con una versión anterior del HasData.
/// </summary>
public static class DbInitializer
{
    public static void Seed(AppDbContext db)
    {
        db.Database.EnsureCreated();

        // --------------------------------------------------------
        // Productos: verificar que el catálogo completo esté presente
        // --------------------------------------------------------
        SeedProductosFaltantes(db);

        // --------------------------------------------------------
        // Usuarios demo
        // --------------------------------------------------------
        if (!db.Usuarios.Any(u => u.Email == "admin@tienda.com"))
        {
            db.Usuarios.Add(new Usuario
            {
                Nombre = "Administrador",
                Email = "admin@tienda.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Rol = "Administrador",
                Activo = true,
                Telefono = "0000-0000",
                Direccion = "Oficina central"
            });
        }

        if (!db.Usuarios.Any(u => u.Email == "cliente@tienda.com"))
        {
            db.Usuarios.Add(new Usuario
            {
                Nombre = "Cliente Demo",
                Email = "cliente@tienda.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cliente123!"),
                Rol = "Cliente",
                Activo = true,
                Telefono = "8888-8888",
                Direccion = "San José, Costa Rica"
            });
        }

        db.SaveChanges();

        // --------------------------------------------------------
        // Cupones demo
        // --------------------------------------------------------
        if (!db.Cupones.Any())
        {
            db.Cupones.AddRange(
                new Cupon
                {
                    Codigo = "BIENVENIDA10",
                    Descripcion = "10% de descuento en tu primera compra",
                    Tipo = TipoDescuento.Porcentaje,
                    Valor = 10,
                    FechaInicio = DateTime.UtcNow.AddDays(-7),
                    FechaFin = DateTime.UtcNow.AddMonths(3),
                    LimiteUso = 100,
                    MontoMinimo = 10000,
                    Activo = true
                },
                new Cupon
                {
                    Codigo = "ENVIOGRATIS",
                    Descripcion = "5.000 colones de descuento para pedidos mayores a ₡25.000",
                    Tipo = TipoDescuento.MontoFijo,
                    Valor = 5000,
                    FechaInicio = DateTime.UtcNow.AddDays(-1),
                    FechaFin = DateTime.UtcNow.AddMonths(1),
                    LimiteUso = 0,
                    MontoMinimo = 25000,
                    Activo = true
                },
                new Cupon
                {
                    Codigo = "CRNAVIDAD",
                    Descripcion = "15% de descuento temporada alta",
                    Tipo = TipoDescuento.Porcentaje,
                    Valor = 15,
                    FechaInicio = DateTime.UtcNow,
                    FechaFin = DateTime.UtcNow.AddMonths(2),
                    LimiteUso = 50,
                    MontoMinimo = 50000,
                    Activo = true
                }
            );
            db.SaveChanges();
        }

        // --------------------------------------------------------
        // Dirección predeterminada para el cliente demo
        // --------------------------------------------------------
        var cliente = db.Usuarios.FirstOrDefault(u => u.Email == "cliente@tienda.com");
        if (cliente != null && !db.Direcciones.Any(d => d.UsuarioId == cliente.UsuarioId))
        {
            db.Direcciones.Add(new Direccion
            {
                UsuarioId = cliente.UsuarioId,
                Provincia = "Limón",
                Canton = "Guácimo",
                Distrito = "Guácimo",
                Detalle = "Del cruce 200m norte",
                Latitud = 10.174564601257563,
                Longitud = -83.7800279420646,
                Predeterminada = true
            });
            db.SaveChanges();
        }
    }

    // =================================================================
    //  Siembra de productos faltantes
    //  Garantiza que los 42 productos del catálogo estén presentes sin
    //  afectar productos creados manualmente por el usuario.
    // =================================================================
    private static void SeedProductosFaltantes(AppDbContext db)
    {
        var fc = new DateTime(2025, 1, 1);

        var catalogo = new List<Producto>
        {
            // ===== Celulares (CategoriaId = 5) =====
            new() { ProductoId = 1,  Nombre = "Smartphone X1",        Descripcion = "Teléfono inteligente 6.5\" · 128GB · 8GB RAM",          Precio = 350000m,  Stock = 15, StockMinimo = 5,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/25849099/pexels-photo-25849099.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 50,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 2,  Nombre = "iPhone 15 Pro",        Descripcion = "Apple A17 Pro · 256GB · cámara ProRAW",                 Precio = 695000m,  Stock = 10, StockMinimo = 3,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/5437583/pexels-photo-5437583.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 95,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 3,  Nombre = "Samsung Galaxy S24",   Descripcion = "Snapdragon 8 Gen 3 · 256GB · pantalla AMOLED 120Hz",    Precio = 550000m,  Stock = 12, StockMinimo = 4,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/20348037/pexels-photo-20348037.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 80,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 4,  Nombre = "Xiaomi Redmi Note 13", Descripcion = "108MP · batería 5000mAh · carga rápida 67W",            Precio = 145000m,  Stock = 25, StockMinimo = 6,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/12882853/pexels-photo-12882853.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 60,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 5,  Nombre = "Motorola Edge 50",     Descripcion = "Pantalla curva 144Hz · 256GB · IP68",                   Precio = 240000m,  Stock = 18, StockMinimo = 5,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/215583/pexels-photo-215583.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 45,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 6,  Nombre = "Google Pixel 8",       Descripcion = "Tensor G3 · 128GB · Android puro con 7 años de updates",Precio = 480000m,  Stock = 9,  StockMinimo = 3,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/1786433/pexels-photo-1786433.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 70,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 7,  Nombre = "Huawei Nova 12",       Descripcion = "Kirin · 256GB · batería 4600mAh",                       Precio = 280000m,  Stock = 14, StockMinimo = 4,  CategoriaId = 5, ImagenUrl = "https://images.pexels.com/photos/6373160/pexels-photo-6373160.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 35,  Activo = true, FechaCreacion = fc },

            // ===== Laptops (CategoriaId = 6) =====
            new() { ProductoId = 8,  Nombre = "Laptop Pro 15",        Descripcion = "Laptop profesional · 16GB RAM · 512GB SSD",             Precio = 750000m,  Stock = 8,  StockMinimo = 3,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/3184463/pexels-photo-3184463.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 75,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 9,  Nombre = "MacBook Air M3",       Descripcion = "Apple M3 · 8GB · 256GB · pantalla Retina 13\"",         Precio = 980000m,  Stock = 6,  StockMinimo = 2,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 92,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 10, Nombre = "Dell XPS 13",          Descripcion = "Intel Core i7 · 16GB · 512GB SSD · InfinityEdge",       Precio = 820000m,  Stock = 7,  StockMinimo = 2,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/16094054/pexels-photo-16094054.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 68,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 11, Nombre = "HP Pavilion 14",       Descripcion = "Ryzen 5 · 8GB · 512GB SSD · ideal estudiantes",         Precio = 450000m,  Stock = 12, StockMinimo = 4,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 55,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 12, Nombre = "Lenovo ThinkPad T14",  Descripcion = "Core i5 · 16GB · 1TB SSD · teclado retroiluminado",     Precio = 690000m,  Stock = 5,  StockMinimo = 2,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/1181647/pexels-photo-1181647.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 62,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 13, Nombre = "Asus ROG Strix G16",   Descripcion = "Core i9 · RTX 4070 · 32GB · 1TB (gamer)",              Precio = 1100000m, Stock = 4,  StockMinimo = 2,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/19012037/pexels-photo-19012037.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 85,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 14, Nombre = "Acer Aspire 5",        Descripcion = "Core i3 · 8GB · 256GB · básica de oficina",             Precio = 390000m,  Stock = 11, StockMinimo = 3,  CategoriaId = 6, ImagenUrl = "https://images.pexels.com/photos/6452/pexels-photo-6452.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 40,  Activo = true, FechaCreacion = fc },

            // ===== Caballero (CategoriaId = 7) =====
            new() { ProductoId = 15, Nombre = "Camisa Casual",        Descripcion = "Camisa de algodón manga larga · talla M",               Precio = 15000m,   Stock = 30, StockMinimo = 10, CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/9558233/pexels-photo-9558233.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 20,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 16, Nombre = "Camiseta Polo",        Descripcion = "Polo pique clásico · varios colores",                   Precio = 12000m,   Stock = 40, StockMinimo = 12, CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 28,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 17, Nombre = "Pantalón Chino",       Descripcion = "Corte slim · algodón stretch · beige",                  Precio = 22000m,   Stock = 22, StockMinimo = 6,  CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/18836627/pexels-photo-18836627.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 25,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 18, Nombre = "Jeans Clásicos",       Descripcion = "Denim resistente · corte regular",                      Precio = 18000m,   Stock = 28, StockMinimo = 8,  CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/206365/pexels-photo-206365.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 32,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 19, Nombre = "Chaqueta Jean",        Descripcion = "Chaqueta denim con bolsillos frontales",                Precio = 28000m,   Stock = 15, StockMinimo = 5,  CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 22,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 20, Nombre = "Zapatos de Cuero",     Descripcion = "Zapatos formales · cuero genuino",                      Precio = 45000m,   Stock = 18, StockMinimo = 6,  CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/7034913/pexels-photo-7034913.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 38,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 21, Nombre = "Suéter de Lana",       Descripcion = "Suéter cuello redondo · 100% lana",                     Precio = 20000m,   Stock = 20, StockMinimo = 6,  CategoriaId = 7, ImagenUrl = "https://images.pexels.com/photos/7015871/pexels-photo-7015871.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 18,  Activo = true, FechaCreacion = fc },

            // ===== Dama (CategoriaId = 8) =====
            new() { ProductoId = 22, Nombre = "Blusa de Seda",        Descripcion = "Blusa manga corta · seda suave",                        Precio = 18000m,   Stock = 26, StockMinimo = 8,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/18505097/pexels-photo-18505097.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 30,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 23, Nombre = "Vestido Floral",       Descripcion = "Vestido midi estampado floral · verano",                Precio = 26000m,   Stock = 20, StockMinimo = 5,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/1865726/pexels-photo-1865726.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 45,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 24, Nombre = "Falda Plisada",        Descripcion = "Falda media · plisado fino",                            Precio = 16000m,   Stock = 24, StockMinimo = 7,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/9178848/pexels-photo-9178848.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 22,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 25, Nombre = "Jeans Slim Fit",       Descripcion = "Denim elástico · tiro alto",                            Precio = 19000m,   Stock = 30, StockMinimo = 9,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/9260506/pexels-photo-9260506.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 40,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 26, Nombre = "Chaqueta Ligera",      Descripcion = "Chaqueta entretiempo · nylon impermeable",              Precio = 24000m,   Stock = 16, StockMinimo = 5,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/5629727/pexels-photo-5629727.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 27,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 27, Nombre = "Bolso de Mano",        Descripcion = "Bolso elegante · piel sintética · varios colores",      Precio = 32000m,   Stock = 14, StockMinimo = 4,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/932401/pexels-photo-932401.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 50,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 28, Nombre = "Zapatos de Tacón",     Descripcion = "Tacón 7cm · punta cerrada",                             Precio = 38000m,   Stock = 17, StockMinimo = 5,  CategoriaId = 8, ImagenUrl = "https://images.pexels.com/photos/134064/pexels-photo-134064.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 42,  Activo = true, FechaCreacion = fc },

            // ===== Hogar (CategoriaId = 3) =====
            new() { ProductoId = 29, Nombre = "Set de Sartenes",      Descripcion = "Juego de 3 sartenes antiadherentes",                    Precio = 25000m,   Stock = 12, StockMinimo = 4,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/3768169/pexels-photo-3768169.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 30,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 30, Nombre = "Licuadora Pro",        Descripcion = "1200W · vaso de vidrio 1.5L · 10 velocidades",          Precio = 45000m,   Stock = 10, StockMinimo = 3,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/5514988/pexels-photo-5514988.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 55,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 31, Nombre = "Aspiradora Vertical",  Descripcion = "Inalámbrica · 25 min autonomía · filtro HEPA",          Precio = 85000m,   Stock = 8,  StockMinimo = 3,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/4107284/pexels-photo-4107284.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 48,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 32, Nombre = "Plancha de Vapor",     Descripcion = "Suela cerámica · golpe de vapor 120g",                  Precio = 28000m,   Stock = 15, StockMinimo = 5,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/5202801/pexels-photo-5202801.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 25,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 33, Nombre = "Cafetera Express",     Descripcion = "15 bares · espumador de leche · 2 tazas",               Precio = 95000m,   Stock = 7,  StockMinimo = 2,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/2668498/pexels-photo-2668498.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 65,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 34, Nombre = "Juego de Sábanas",     Descripcion = "Matrimonial · 400 hilos · 100% algodón",                Precio = 32000m,   Stock = 20, StockMinimo = 6,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/2736388/pexels-photo-2736388.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 28,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 35, Nombre = "Vajilla 24 Piezas",    Descripcion = "Porcelana · servicio para 6 personas",                  Precio = 48000m,   Stock = 9,  StockMinimo = 3,  CategoriaId = 3, ImagenUrl = "https://images.pexels.com/photos/10970561/pexels-photo-10970561.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 33,  Activo = true, FechaCreacion = fc },

            // ===== Deportes (CategoriaId = 4) =====
            new() { ProductoId = 36, Nombre = "Balón de Fútbol",      Descripcion = "Balón oficial tamaño 5 · cosido a mano",                Precio = 12000m,   Stock = 25, StockMinimo = 8,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 40,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 37, Nombre = "Raqueta de Tenis",     Descripcion = "Grafito · cuerda sintética · funda incluida",           Precio = 35000m,   Stock = 14, StockMinimo = 4,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/1432039/pexels-photo-1432039.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 30,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 38, Nombre = "Guantes de Boxeo",     Descripcion = "12oz · piel sintética · muñequera ajustable",           Precio = 22000m,   Stock = 18, StockMinimo = 6,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/2628206/pexels-photo-2628206.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 22,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 39, Nombre = "Mat de Yoga",          Descripcion = "6mm · antideslizante · con correa",                     Precio = 15000m,   Stock = 30, StockMinimo = 10, CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/6958255/pexels-photo-6958255.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 35,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 40, Nombre = "Bicicleta BMX",        Descripcion = "Marco acero reforzado · 20\" · frenos V-brake",         Precio = 180000m,  Stock = 5,  StockMinimo = 2,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/1580234/pexels-photo-1580234.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 58,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 41, Nombre = "Juego de Pesas 20kg",  Descripcion = "Discos 2x5kg + 2x2.5kg + 2x2kg + barra",               Precio = 65000m,   Stock = 8,  StockMinimo = 3,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/260352/pexels-photo-260352.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 42,  Activo = true, FechaCreacion = fc },
            new() { ProductoId = 42, Nombre = "Jersey Deportivo",     Descripcion = "Dri-fit · transpirable · varios colores",               Precio = 18000m,   Stock = 28, StockMinimo = 8,  CategoriaId = 4, ImagenUrl = "https://images.pexels.com/photos/39002/pexels-photo-39002.jpeg?auto=compress&cs=tinysrgb&w=400", Popularidad = 26,  Activo = true, FechaCreacion = fc },
        };

        var idsExistentes = db.Productos.Select(p => p.ProductoId).ToHashSet();
        var faltantes = catalogo.Where(p => !idsExistentes.Contains(p.ProductoId)).ToList();

        if (faltantes.Count == 0) return;

        // Actualizar productos existentes que hayan cambiado (ej. nombre antiguo)
        foreach (var existente in db.Productos.Where(p => idsExistentes.Contains(p.ProductoId)))
        {
            var nuevo = catalogo.FirstOrDefault(c => c.ProductoId == existente.ProductoId);
            if (nuevo == null) continue;
            existente.Nombre       = nuevo.Nombre;
            existente.Descripcion  = nuevo.Descripcion;
            existente.Precio       = nuevo.Precio;
            existente.Stock        = nuevo.Stock;
            existente.StockMinimo  = nuevo.StockMinimo;
            existente.CategoriaId  = nuevo.CategoriaId;
            existente.ImagenUrl    = nuevo.ImagenUrl;
            existente.Popularidad  = nuevo.Popularidad;
        }

        // Insertar los productos que no existen, usando IDENTITY_INSERT
        // Debe hacerse dentro de una transacción para que ON/OFF y SaveChanges
        // compartan la misma conexión.
        if (faltantes.Count > 0)
        {
            using var tx = db.Database.BeginTransaction();
            db.Database.ExecuteSqlRaw("SET IDENTITY_INSERT [Productos] ON");
            db.Productos.AddRange(faltantes);
            db.SaveChanges();
            db.Database.ExecuteSqlRaw("SET IDENTITY_INSERT [Productos] OFF");
            tx.Commit();
        }
        else
        {
            db.SaveChanges(); // guardar actualizaciones de productos existentes
        }
        Console.WriteLine($"[SEED] {faltantes.Count} productos insertados, catálogo completo: {catalogo.Count}");
    }
}
