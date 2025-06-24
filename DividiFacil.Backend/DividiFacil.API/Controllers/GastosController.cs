using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Gasto;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DividiFacil.API.Controllers
{
    [Authorize]
    public class GastosController : ApiControllerBase
    {
        private readonly IGastoService _gastoService;

        public GastosController(IGastoService gastoService)
        {
            _gastoService = gastoService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetGastoById(Guid id)
        {
            var resultado = await _gastoService.GetByIdAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("grupo/{idGrupo:guid}")]
        public async Task<IActionResult> GetGastosByGrupo(Guid idGrupo)
        {
            var resultado = await _gastoService.GetByGrupoAsync(idGrupo, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("recientes")]
        public async Task<IActionResult> GetGastosRecientes([FromQuery] int cantidad = 10)
        {
            var resultado = await _gastoService.GetRecientesAsync(GetUserId(), cantidad);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("grupo/{idGrupo:guid}/saldos")]
        public async Task<IActionResult> GetSaldosGrupo(Guid idGrupo)
        {
            var resultado = await _gastoService.GetSaldosGrupoAsync(idGrupo, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("mis-saldos")]
        public async Task<IActionResult> GetSaldosUsuario()
        {
            var resultado = await _gastoService.GetSaldosUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost]
        public async Task<IActionResult> CrearGasto([FromBody] GastoCreacionDto gastoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _gastoService.CrearGastoAsync(gastoDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return CreatedAtAction(nameof(GetGastoById), new { id = resultado.Data.IdGasto }, resultado);
        }

        [HttpPost("{idGasto:guid}/detalle/{idDetalle:guid}/marcar-pagado")]
        public async Task<IActionResult> MarcarComoPagado(Guid idGasto, Guid idDetalle)
        {
            var resultado = await _gastoService.MarcarComoPagadoAsync(idGasto, idDetalle, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> EliminarGasto(Guid id)
        {
            var resultado = await _gastoService.EliminarGastoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("grupo/{idGrupo}/paginado")]
        public async Task<IActionResult> GetByGrupoPaginado(Guid idGrupo, [FromQuery] PaginacionDto paginacion)
        {
            var idUsuario = User.Identity?.Name ?? string.Empty;
            var resultado = await _gastoService.GetPaginatedByGrupoAsync(idGrupo, paginacion, idUsuario);
            return resultado.Exito ? Ok(resultado) : BadRequest(resultado);
        }
    }
}