      
using DividiFacil.API.Helpers;
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
        private readonly IUsuarioService _usuarioService;

        public GastosController(IGastoService gastoService, IUsuarioService usuarioService)
        {
            _gastoService = gastoService;
            _usuarioService = usuarioService;
        }
        /// <summary>
        /// Sube un comprobante de gasto (solo Premium/Pro)
        /// </summary>
        [HttpPost("upload-comprobante")]
        [RequestSizeLimit(5_000_000)] // 5MB
        public async Task<IActionResult> UploadComprobante([FromForm] IFormFile file)
        {
            var idUsuario = GetUserId();
            if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                return Forbid("Usuario no autenticado");

            // Consultar el plan del usuario
            var usuarioResult = await _usuarioService.GetByIdAsync(idUsuarioGuid);
            if (!usuarioResult.Exito || usuarioResult.Data == null)
                return Forbid("Usuario no encontrado");

            var plan = usuarioResult.Data.Plan?.ToLowerInvariant() ?? "free";
            if (plan != "premium" && plan != "pro")
                return Forbid("Solo usuarios Premium o Pro pueden adjuntar comprobantes.");

            if (file == null || file.Length == 0)
                return BadRequest("Archivo no válido.");

            // Validar tipo de archivo
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest("Tipo de archivo no permitido. Solo imágenes o PDF.");

            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                var relativePath = await Helpers.FileHelper.SaveComprobanteAsync(file, rootPath);
                return Ok(new { path = relativePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar el archivo: {ex.Message}");
            }
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

            if (resultado.Data == null)
                return StatusCode(500, "Ocurrió un error inesperado al crear el gasto.");

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
            var idUsuario = UsuarioHelper.ObtenerIdUsuario(User);

            if (!UsuarioHelper.ValidarIdUsuario(idUsuario, out var idUsuarioGuid))
            {
                return BadRequest(new ResponseDto
                {
                    Exito = false,
                    Mensaje = "Usuario no autenticado o ID de usuario inválido"
                });
            }

            var resultado = await _gastoService.GetPaginatedByGrupoAsync(idGrupo, paginacion, idUsuario);
            return resultado.Exito ? Ok(resultado) : BadRequest(resultado);
        }
        
          /// <summary>
        /// Exporta los gastos de un grupo a PDF o Excel (solo Premium/Pro)
        /// </summary>
        [HttpGet("grupo/{idGrupo:guid}/exportar")]
        public async Task<IActionResult> ExportarGastosPorGrupo(Guid idGrupo, [FromQuery] string formato = "pdf")
        {
            var idUsuario = GetUserId();
            if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                return Forbid("Usuario no autenticado");

            // Consultar el plan del usuario
            var usuarioResult = await _usuarioService.GetByIdAsync(idUsuarioGuid);
            if (!usuarioResult.Exito || usuarioResult.Data == null)
                return Forbid("Usuario no encontrado");

            var plan = usuarioResult.Data.Plan?.ToLowerInvariant() ?? "free";
            if (plan != "premium" && plan != "pro")
                return Forbid("Solo usuarios Premium o Pro pueden exportar gastos.");

            // Obtener los gastos del grupo
            var resultado = await _gastoService.GetByGrupoAsync(idGrupo, idUsuario);
            if (!resultado.Exito || resultado.Data == null)
                return BadRequest("No se pudieron obtener los gastos del grupo.");

            // Generar archivo (PDF o Excel)
            byte[] archivoBytes;
            string contentType;
            string fileName;
            if (formato.ToLower() == "excel" || formato.ToLower() == "xlsx")
            {
                // Implementar generación real de Excel
                archivoBytes = System.Text.Encoding.UTF8.GetBytes("Funcionalidad de exportación a Excel en desarrollo.");
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"gastos_{idGrupo}.xlsx";
            }
            else
            {
                // Implementar generación real de PDF
                archivoBytes = System.Text.Encoding.UTF8.GetBytes("Funcionalidad de exportación a PDF en desarrollo.");
                contentType = "application/pdf";
                fileName = $"gastos_{idGrupo}.pdf";
            }

            // Retornar archivo descargable
            return File(archivoBytes, contentType, fileName);
        }
    }
}