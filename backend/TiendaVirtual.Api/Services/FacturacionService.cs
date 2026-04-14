namespace TiendaVirtual.Api.Services;

/// <summary>
/// Lógica de negocio compartida para cálculos de IVA, cupones y delivery.
/// Mantener esta lógica en un solo lugar evita que controllers y tests se
/// desalineen con la política tributaria real.
/// </summary>
public class FacturacionService
{
    /// <summary>IVA vigente en Costa Rica (13%).</summary>
    public const decimal TasaIva = 0.13m;

    /// <summary>Coordenada de origen de la tienda para calcular distancia de envío.</summary>
    public const double TiendaLat = 10.174564601257563;
    public const double TiendaLng = -83.7800279420646;

    /// <summary>Tarifa máxima de delivery dentro del rango permitido (colones).</summary>
    public const decimal TarifaMaxima = 10_000m;

    /// <summary>Monto a partir del cual el envío es gratis (colones).</summary>
    public const decimal MontoEnvioGratis = 50_000m;

    /// <summary>Tarifa mínima para envíos cortos.</summary>
    public const decimal TarifaMinima = 1_500m;

    /// <summary>
    /// Calcula la tarifa de envío en colones en base a la distancia desde la tienda.
    /// - Si el subtotal supera <see cref="MontoEnvioGratis"/> → 0.
    /// - Tope superior de <see cref="TarifaMaxima"/>.
    /// - Escala lineal de ≈ 300 colones por km sobre una base mínima.
    /// </summary>
    public decimal CalcularCostoEnvio(double latDestino, double lngDestino, decimal subtotal)
    {
        if (subtotal >= MontoEnvioGratis)
            return 0;

        var km = (decimal)CalcularDistanciaKm(TiendaLat, TiendaLng, latDestino, lngDestino);
        var tarifa = TarifaMinima + (km * 300m);

        if (tarifa < TarifaMinima) tarifa = TarifaMinima;
        if (tarifa > TarifaMaxima) tarifa = TarifaMaxima;
        return Math.Round(tarifa, 2);
    }

    /// <summary>Calcula el IVA (13%) sobre una base imponible.</summary>
    public decimal CalcularIva(decimal baseImponible)
        => Math.Round(baseImponible * TasaIva, 2);

    /// <summary>
    /// Fórmula de Haversine para distancia entre dos puntos GPS, en km.
    /// </summary>
    public static double CalcularDistanciaKm(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371.0; // radio de la Tierra en km
        double dLat = ToRad(lat2 - lat1);
        double dLng = ToRad(lng2 - lng1);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                 + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
                 * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRad(double deg) => deg * Math.PI / 180.0;

    /// <summary>
    /// Bounding-box de Costa Rica. Simple pero suficiente para validar que una
    /// dirección no esté fuera del país.
    /// </summary>
    public static bool EstaEnCostaRica(double lat, double lng)
        => lat >= 8.0 && lat <= 11.25 && lng >= -85.95 && lng <= -82.55;
}
