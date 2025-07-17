using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using DividiFacil.Domain.Models;
using DividiFacil.Data;
using Microsoft.AspNetCore.Authorization;

namespace DividiFacil.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public UsuariosController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("{idUsuario}/token-fcm")]
        public async Task<IActionResult> RegistrarTokenFcm(string idUsuario, [FromBody] TokenFcmDto dto)
        {
            var usuario = await _db.Usuarios.FindAsync(Guid.Parse(idUsuario));
            if (usuario == null) return NotFound();
            if (usuario.Plan.ToLower() != "premium" && usuario.Plan.ToLower() != "pro")
                return Forbid("Solo Premium/Pro pueden registrar token FCM");
            usuario.TokenNotificacion = dto.Token;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    public class TokenFcmDto { public string Token { get; set; } }
}
