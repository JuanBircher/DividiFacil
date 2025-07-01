using DividiFacil.API.Helpers;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Grupo;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DividiFacil.API.Controllers
{
    [Authorize]
    public class GruposController : ApiControllerBase
    {
        private readonly IGrupoService _grupoService;

        public GruposController(IGrupoService grupoService)
        {
            _grupoService = grupoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetGruposByUsuario()
        {
            var resultado = await _grupoService.GetByUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetGrupoById(Guid id)
        {
            var resultado = await _grupoService.GetByIdAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("{id:guid}/miembros")]
        public async Task<IActionResult> GetGrupoConMiembros(Guid id)
        {
            var resultado = await _grupoService.GetConMiembrosAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("codigo/{codigo}")]
        public async Task<IActionResult> GetGrupoByCodigo(string codigo)
        {
            var resultado = await _grupoService.GetByCodigoAccesoAsync(codigo);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost]
        public async Task<IActionResult> CrearGrupo([FromBody] GrupoCreacionDto grupoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _grupoService.CrearGrupoAsync(grupoDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return CreatedAtAction(nameof(GetGrupoById), new { id = resultado.Data.IdGrupo }, resultado);
        }

        [HttpPost("{id:guid}/codigo-acceso")]
        public async Task<IActionResult> GenerarCodigoAcceso(Guid id)
        {
            var resultado = await _grupoService.GenerarCodigoAccesoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("{id:guid}/miembros")]
        public async Task<IActionResult> AgregarMiembro(Guid id, [FromBody] InvitacionDto invitacionDto)
        {
            var idUsuario = UsuarioHelper.ObtenerIdUsuario(User);
            
            if (!UsuarioHelper.ValidarIdUsuario(idUsuario, out var idUsuarioGuid))
            {
                return BadRequest(new ResponseDto
                {
                    Exito = false,
                    Mensaje = "Usuario no autenticado o ID de usuario inválido"
                });
            }

            var resultado = await _grupoService.AgregarMiembroAsync(id, invitacionDto, idUsuario);
            return resultado.Exito ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> ActualizarGrupo(Guid id, [FromBody] GrupoCreacionDto grupoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _grupoService.ActualizarGrupoAsync(id, grupoDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPut("{id:guid}/miembros/{idMiembro:guid}/rol")]
        public async Task<IActionResult> CambiarRolMiembro(Guid id, Guid idMiembro, [FromBody] CambioRolDto cambioRolDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _grupoService.CambiarRolMiembroAsync(id, idMiembro, cambioRolDto.NuevoRol, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> EliminarGrupo(Guid id)
        {
            var resultado = await _grupoService.EliminarGrupoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpDelete("{id:guid}/miembros/{idMiembro:guid}")]
        public async Task<IActionResult> EliminarMiembro(Guid id, Guid idMiembro)
        {
            var resultado = await _grupoService.EliminarMiembroAsync(id, idMiembro, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }
    }

    public class CambioRolDto
    {
        public string NuevoRol { get; set; }
    }
}