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
    public class NotificacionesController : ApiControllerBase
    {
        private readonly INotificacionService _notificacionService;

        public NotificacionesController(INotificacionService notificacionService)
        {
            _notificacionService = notificacionService;
        }

        /// <summary>
        /// Obtiene las notificaciones pendientes del usuario actual
        /// </summary>
        /// <returns>Lista de notificaciones pendientes</returns>
        /// <response code="200">Notificaciones obtenidas correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet("pendientes")]
        [ProducesResponseType(typeof(ResponseDto<List<NotificacionDto>>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetNotificacionesPendientes()
        {
            var resultado = await _notificacionService.GetNotificacionesPendientesByUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Obtiene las notificaciones de un grupo
        /// </summary>
        /// <param name="idGrupo">ID del grupo</param>
        /// <returns>Lista de notificaciones del grupo</returns>
        /// <response code="200">Notificaciones obtenidas correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet("grupo/{idGrupo:guid}")]
        [ProducesResponseType(typeof(ResponseDto<List<NotificacionDto>>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetNotificacionesPorGrupo(Guid idGrupo)
        {
            var resultado = await _notificacionService.GetByGrupoAsync(idGrupo, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Marca una notificación como enviada
        /// </summary>
        /// <param name="id">ID de la notificación</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Notificación marcada como enviada correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpPut("{id:guid}/marcar-enviada")]
        [ProducesResponseType(typeof(ResponseDto), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> MarcarComoEnviada(Guid id)
        {
            var resultado = await _notificacionService.MarcarComoEnviadaAsync(id, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Obtiene la configuración de notificaciones del usuario actual
        /// </summary>
        /// <returns>Configuración de notificaciones</returns>
        /// <response code="200">Configuración obtenida correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpGet("configuracion")]
        [ProducesResponseType(typeof(ResponseDto<ConfiguracionNotificacionesDto>), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> GetConfiguracionNotificaciones()
        {
            var resultado = await _notificacionService.GetConfiguracionByUsuarioAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        /// <summary>
        /// Actualiza la configuración de notificaciones del usuario actual
        /// </summary>
        /// <param name="configuracion">Datos de la configuración</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Configuración actualizada correctamente</response>
        /// <response code="400">Si hay errores en la solicitud</response>
        /// <response code="401">Si el usuario no está autenticado</response>
        [HttpPut("configuracion")]
        [ProducesResponseType(typeof(ResponseDto), 200)]
        [ProducesResponseType(typeof(ResponseDto), 400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> ActualizarConfiguracion([FromBody] ConfiguracionNotificacionesDto configuracion)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _notificacionService.ActualizarConfiguracionAsync(configuracion, GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }
    }
}