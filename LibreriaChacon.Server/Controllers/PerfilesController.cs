using Microsoft.AspNetCore.Authorization;
using LibreriaChacon.Server.DTOs; 

namespace LibreriaChacon.Server.Controllers
{
    using LibreriaChacon.Server.Contexts;
    using LibreriaChacon.Server.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class PerfilesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PerfilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/perfiles  (Obtener todos los perfiles)
        [HttpGet]
        [Authorize(Roles = "Administrador")] 
        public async Task<ActionResult<IEnumerable<Perfil>>> GetPerfiles()
        {
            return await _context.Perfiles.ToListAsync();
        }

        // GET: api/perfiles/{id} 
        [HttpGet("{id}")]
        public async Task<ActionResult<Perfil>> GetPerfil(Guid id)
        {
            var perfil = await _context.Perfiles.FindAsync(id);

            if (perfil == null)
            {
                return NotFound();
            }

            return perfil;
        }

        // POST: api/perfiles  (Crear un nuevo perfil - REGISTRO)
        [HttpPost]
        [AllowAnonymous] 
        public async Task<ActionResult<Perfil>> PostPerfil(PerfilCreateDto perfilDto) 
        {
            // Validar si el email ya existe
            if (await _context.Perfiles.AnyAsync(p => p.Email == perfilDto.Email))
            {
                return BadRequest("El correo electrónico ya está en uso.");
            }

            var perfil = new Perfil
            {
                Id = Guid.NewGuid(),
                NombreCompleto = perfilDto.NombreCompleto,
                Email = perfilDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(perfilDto.Password), // Hashing de la contraseña
                Rol = "Cliente", // Se asigna el rol por defecto en el servidor
                FechaCreacion = DateTime.UtcNow,
                Nit = perfilDto.Nit 

            };

            _context.Perfiles.Add(perfil);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPerfil), new { id = perfil.Id }, perfil);
        }

        // PUT: api/perfiles/{id}  (Actualizar un perfil existente)
        
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPerfil(Guid id, Perfil perfil)
        {
            if (id != perfil.Id)
            {
                return BadRequest();
            }

           
            _context.Entry(perfil).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PerfilExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/perfiles/{id}  (Eliminar un perfil)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")] 
        public async Task<IActionResult> DeletePerfil(Guid id)
        {
            var perfil = await _context.Perfiles.FindAsync(id);
            if (perfil == null)
            {
                return NotFound();
            }

            _context.Perfiles.Remove(perfil);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PerfilExists(Guid id)
        {
            return _context.Perfiles.Any(e => e.Id == id);
        }
    }
}