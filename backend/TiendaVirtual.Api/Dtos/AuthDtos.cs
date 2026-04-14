using System.ComponentModel.DataAnnotations;

namespace TiendaVirtual.Api.Dtos;

public record LoginRequest([Required] string Email, [Required] string Password);

public record RegisterRequest(
    [Required] string Nombre,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    string? Telefono,
    string? Direccion
);

public record AuthResponse(
    int UsuarioId,
    string Nombre,
    string Email,
    string Rol,
    string Token,
    DateTime Expiracion
);
