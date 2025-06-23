using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Notificacion;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class RecordatoriosController : ApiControllerBase
    {
        private readonly IRecordatorioService _recordatorioService;

        public RecordatoriosController(IRecordatorioService recordatorioService)
        {
            _recordatorioService = recordatorioService;
        }

        /// <summary>
        /// Obtiene todos los recordatorios del usuario actual
        /// </summary>
        /// <returns>Lista de recordatorios</returns>
        /// <response code="200">Recordatorios obtenidos correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet]
        [ProducesResponseType(typeof(ResponseDto<List<RecordatorioDto>>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetRecordatorios()
        {
            var resultado = await _recordatorioService.GetRecordatoriosByUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Obtiene los recordatorios pendientes del usuario actual (próximos 7 días)
        /// </summary>
        /// <returns>Lista de recordatorios pendientes</returns>
        /// <response code="200">Recordatorios obtenidos correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet("pendientes")]
        [ProducesResponseType(typeof(ResponseDto<List<RecordatorioDto>>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetRecordatoriosPendientes()
        {
            var resultado = await _recordatorioService.GetRecordatoriosPendientesByUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Obtiene los recordatorios de un grupo
        /// </summary>
        /// <param name="idGrupo">ID del grupo</param>
        /// <returns>Lista de recordatorios del grupo</returns>
        /// <response code="200">Recordatorios obtenidos correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet("grupo/{idGrupo:guid}")]
        [ProducesResponseType(typeof(ResponseDto<List<RecordatorioDto>>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetRecordatoriosPorGrupo(Guid idGrupo)
        {
            var resultado = await _recordatorioService.GetRecordatoriosByGrupoAsync(idGrupo, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Crea un nuevo recordatorio
        /// </summary>
        /// <param name="recordatorioDto">Datos del recordatorio</param>
        /// <returns>Recordatorio creado</returns>
        /// <response code="201">Recordatorio creado correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpPost]
        [ProducesResponseType(typeof(ResponseDto<RecordatorioDto>), 201)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> CrearRecordatorio([FromBody] CrearRecordatorioDto recordatorioDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _recordatorioService.CrearRecordatorioAsync(recordatorioDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return CreatedAtAction(nameof(GetRecordatorios), resultado);
        }

        /// <summary>
        /// Actualiza un recordatorio existente
        /// </summary>
        /// <param name="id">ID del recordatorio</param>
        /// <param name="recordatorioDto">Datos actualizados del recordatorio</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Recordatorio actualizado correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(ResponseDto), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> ActualizarRecordatorio(Guid id, [FromBody] CrearRecordatorioDto recordatorioDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _recordatorioService.ActualizarRecordatorioAsync(id, recordatorioDto, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Elimina un recordatorio
        /// </summary>
        /// <param name="id">ID del recordatorio</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Recordatorio eliminado correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(typeof(ResponseDto), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> EliminarRecordatorio(Guid id)
        {
            var resultado = await _recordatorioService.EliminarRecordatorioAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Marca un recordatorio como completado
        /// </summary>
        /// <param name="id">ID del recordatorio</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Recordatorio marcado como completado correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpPut("{id:guid}/completar")]
        [ProducesResponseType(typeof(ResponseDto), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> MarcarComoCompletado(Guid id)
        {
            var resultado = await _recordatorioService.MarcarComoCompletadoAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }
    }
}