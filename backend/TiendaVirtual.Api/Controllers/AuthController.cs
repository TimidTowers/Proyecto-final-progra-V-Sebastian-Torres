using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TiendaVirtual.Api.Data;
using TiendaVirtual.Api.Dtos;
using TiendaVirtual.Api.Models;
using TiendaVirtual.Api.Services;

namespace TiendaVirtual.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthController(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (await _db.Usuarios.AnyAsync(u => u.Email == req.Email))
            return BadRequest(new { message = "El correo ya está registrado." });

        var usuario = new Usuario
        {
            Nombre = req.Nombre,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Rol = "Cliente",
            Telefono = req.Telefono,
            Direccion = req.Direccion,
            Activo = true
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        var (token, expires) = _jwt.GenerateToken(usuario);
        return Ok(new AuthResponse(usuario.UsuarioId, usuario.Nombre, usuario.Email, usuario.Rol, token, expires));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Email == req.Email && u.Activo);
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Password, usuario.PasswordHash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        var (token, expires) = _jwt.GenerateToken(usuario);
        return Ok(new AuthResponse(usuario.UsuarioId, usuario.Nombre, usuario.Email, usuario.Rol, token, expires));
    }
}
