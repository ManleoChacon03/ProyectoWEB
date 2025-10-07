// CAMBIO: Añadidos nuevos 'usings'
using Microsoft.AspNetCore.Authorization;
using LibreriaChacon.Server.DTOs; // Suponiendo que creas una carpeta DTOs

namespace LibreriaChacon.Server.Controllers
{
    using LibreriaChacon.Server.Contexts;
    using LibreriaChacon.Server.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // CAMBIO: Se protege todo el controlador por defecto. Solo usuarios con token pueden acceder.
    public class PerfilesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PerfilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/perfiles  (Obtener todos los perfiles)
        [HttpGet]
        [Authorize(Roles = "Administrador")] // CAMBIO: Solo los administradores pueden ver todos los perfiles.
        public async Task<ActionResult<IEnumerable<Perfil>>> GetPerfiles()
        {
            return await _context.Perfiles.ToListAsync();
        }

        // GET: api/perfiles/{id}  (Obtener un perfil por su ID)
        [HttpGet("{id}")]
        // CAMBIO: Se mantiene [Authorize]. Un usuario logueado puede ver perfiles (se podría mejorar para que solo vea el suyo).
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
        [AllowAnonymous] // CAMBIO: Se permite el acceso anónimo para que cualquiera pueda registrarse.
        public async Task<ActionResult<Perfil>> PostPerfil(PerfilCreateDto perfilDto) // CAMBIO: Se usa un DTO en lugar del modelo.
        {
            // Validar si el email ya existe
            if (await _context.Perfiles.AnyAsync(p => p.Email == perfilDto.Email))
            {
                return BadRequest("El correo electrónico ya está en uso.");
            }

            // CAMBIO: Se mapea el DTO a un nuevo objeto Perfil y se hashea la contraseña.
            var perfil = new Perfil
            {
                Id = Guid.NewGuid(),
                NombreCompleto = perfilDto.NombreCompleto,
                Email = perfilDto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(perfilDto.Password), // Hashing de la contraseña
                Rol = "Cliente", // Se asigna el rol por defecto en el servidor
                FechaCreacion = DateTime.UtcNow
            };

            _context.Perfiles.Add(perfil);
            await _context.SaveChangesAsync();

            // Devuelve una respuesta 201 Created con la ubicación del nuevo recurso
            return CreatedAtAction(nameof(GetPerfil), new { id = perfil.Id }, perfil);
        }

        // PUT: api/perfiles/{id}  (Actualizar un perfil existente)
        // NOTA: Este método requeriría lógica adicional para manejar la actualización de contraseña de forma segura.
        // Por ahora, se protege para que solo usuarios autenticados puedan intentarlo.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPerfil(Guid id, Perfil perfil)
        {
            if (id != perfil.Id)
            {
                return BadRequest();
            }

            // ADVERTENCIA: Este método no maneja correctamente la actualización de contraseñas.
            // Si el 'perfil' entrante no tiene la contraseña, podría borrar la existente.
            // Se necesita una lógica más avanzada con un DTO de actualización.

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
        [Authorize(Roles = "Administrador")] // CAMBIO: Solo los administradores pueden borrar perfiles.
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