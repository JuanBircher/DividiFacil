// Añadir estas anotaciones al controlador y sus métodos

using DividiFacil.API.Controllers;
using DividiFacil.Domain.DTOs.Balance;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BalanceController : ApiControllerBase
{
    private readonly IBalanceService _balanceService;

    public BalanceController(IBalanceService balanceService)
    {
        _balanceService = balanceService;
    }

    /// <summary>
    /// Obtiene el balance detallado de un grupo
    /// </summary>
    /// <param name="idGrupo">ID del grupo</param>
    /// <returns>Balance completo del grupo con saldos y deudas detalladas</returns>
    /// <response code="200">Balance obtenido correctamente</response>
    /// <response code="400">Si hay errores en la solicitud</response>
    /// <response code="401">Si el usuario no está autenticado</response>
    [HttpGet("grupo/{idGrupo:guid}")]
    [ProducesResponseType(typeof(ResponseDto<BalanceGrupoDto>), 200)]
    [ProducesResponseType(typeof(ResponseDto), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetBalanceGrupo(Guid idGrupo)
    {
        var resultado = await _balanceService.CalcularBalanceGrupoAsync(idGrupo, GetUserId());

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    /// <summary>
    /// Obtiene las deudas simplificadas de un grupo
    /// </summary>
    /// <param name="idGrupo">ID del grupo</param>
    /// <returns>Lista de deudas simplificadas optimizadas</returns>
    /// <response code="200">Deudas simplificadas obtenidas correctamente</response>
    /// <response code="400">Si hay errores en la solicitud</response>
    /// <response code="401">Si el usuario no está autenticado</response>
    [HttpGet("grupo/{idGrupo:guid}/simplificado")]
    [ProducesResponseType(typeof(ResponseDto<List<DeudaSimplificadaDto>>), 200)]
    [ProducesResponseType(typeof(ResponseDto), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetDeudasSimplificadas(Guid idGrupo)
    {
        var resultado = await _balanceService.SimplificarDeudasAsync(idGrupo, GetUserId());

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    /// <summary>
    /// Obtiene el balance del usuario actual en todos los grupos
    /// </summary>
    /// <returns>Lista de balances del usuario por grupo</returns>
    /// <response code="200">Balances obtenidos correctamente</response>
    /// <response code="400">Si hay errores en la solicitud</response>
    /// <response code="401">Si el usuario no está autenticado</response>
    [HttpGet("usuario")]
    [ProducesResponseType(typeof(ResponseDto<List<BalanceUsuarioDto>>), 200)]
    [ProducesResponseType(typeof(ResponseDto), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetBalanceUsuario()
    {
        var resultado = await _balanceService.ObtenerBalanceUsuarioAsync(GetUserId());

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }

    /// <summary>
    /// Obtiene el historial de movimientos de un grupo (gastos y pagos)
    /// </summary>
    /// <param name="idGrupo">ID del grupo</param>
    /// <returns>Lista de movimientos ordenados por fecha</returns>
    /// <response code="200">Historial obtenido correctamente</response>
    /// <response code="400">Si hay errores en la solicitud</response>
    /// <response code="401">Si el usuario no está autenticado</response>
    [HttpGet("grupo/{idGrupo:guid}/movimientos")]
    [ProducesResponseType(typeof(ResponseDto<List<MovimientoDto>>), 200)]
    [ProducesResponseType(typeof(ResponseDto), 400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetHistorialMovimientos(Guid idGrupo)
    {
        var resultado = await _balanceService.ObtenerHistorialMovimientosAsync(idGrupo, GetUserId());

        if (!resultado.Exito)
            return BadRequest(resultado);

        return Ok(resultado);
    }
}