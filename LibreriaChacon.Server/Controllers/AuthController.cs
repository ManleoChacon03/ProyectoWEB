using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.DTOs;
using LibreriaChacon.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Asegúrate de tener tu DbContext
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LibreriaChacon.Server.Controllers
{
   

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Tu DbContext
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
        {
            // 1. Buscar al usuario por email
            var perfil = await _context.Perfiles.FirstOrDefaultAsync(p => p.Email == loginRequest.Email);

            if (perfil == null)
            {
                return Unauthorized("Credenciales inválidas."); // Email no encontrado
            }

            // 2. Verificar la contraseña con BCrypt
            bool esPasswordValida = BCrypt.Net.BCrypt.Verify(loginRequest.Password, perfil.Password);

            if (!esPasswordValida)
            {
                return Unauthorized("Credenciales inválidas."); // Contraseña incorrecta
            }

            // 3. Si las credenciales son válidas, generar el token JWT
            var token = GenerateJwtToken(perfil);

            return Ok(new LoginResponseDto
            {
                Token = token,
                NombreCompleto = perfil.NombreCompleto,
                Rol = perfil.Rol
            });
        }

        private string GenerateJwtToken(Perfil perfil)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Crear los "claims" (información que viaja en el token)
            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, perfil.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, perfil.Email),
            new Claim("role", perfil.Rol), // <-- CAMBIO CLAVE: Usamos el string "role"
            new Claim("nombre_completo", perfil.NombreCompleto)
            // Puedes agregar más claims si lo necesitas
        };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8), // Duración del token
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
