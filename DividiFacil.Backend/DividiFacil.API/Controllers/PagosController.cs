using DividiFacil.Domain.DTOs.Pago;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DividiFacil.API.Controllers
{
    [Authorize]
    public class PagosController : ApiControllerBase
    {
        private readonly IPagoService _pagoService;

        public PagosController(IPagoService pagoService)
        {
            _pagoService = pagoService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPagoById(Guid id)
        {
            var resultado = await _pagoService.GetByIdAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("realizados")]
        public async Task<IActionResult> GetPagosRealizados()
        {
            var resultado = await _pagoService.GetByUsuarioAsync(GetUserId(), false);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("recibidos")]
        public async Task<IActionResult> GetPagosRecibidos()
        {
            var resultado = await _pagoService.GetByUsuarioAsync(GetUserId(), true);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpGet("grupo/{idGrupo:guid}")]
        public async Task<IActionResult> GetPagosByGrupo(Guid idGrupo)
        {
            var resultado = await _pagoService.GetByGrupoAsync(idGrupo, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost]
        public async Task<IActionResult> CrearPago([FromBody] PagoCreacionDto pagoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _pagoService.CrearPagoAsync(pagoDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return CreatedAtAction(nameof(GetPagoById), new { id = resultado.Data.IdPago }, resultado);
        }

        [HttpPost("{id:guid}/confirmar")]
        public async Task<IActionResult> ConfirmarPago(Guid id)
        {
            var resultado = await _pagoService.ConfirmarPagoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("{id:guid}/rechazar")]
        public async Task<IActionResult> RechazarPago(Guid id, [FromBody] RechazoDto rechazoDto)
        {
            var resultado = await _pagoService.RechazarPagoAsync(id, GetUserId(), rechazoDto.Motivo);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> EliminarPago(Guid id)
        {
            var resultado = await _pagoService.EliminarPagoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }
    }

    public class RechazoDto
    {
        public string? Motivo { get; set; }
    }
}