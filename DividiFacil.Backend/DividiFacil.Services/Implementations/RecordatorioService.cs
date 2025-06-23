using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Notificacion;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class RecordatorioService : IRecordatorioService
    {
        private readonly IRecordatorioRepository _recordatorioRepository;
        private readonly IDetalleGastoRepository _detalleGastoRepository;
        private readonly IPagoRepository _pagoRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguracionNotificacionesRepository _configuracionRepository;
        private readonly INotificacionRepository _notificacionRepository;

        public RecordatorioService(
            IRecordatorioRepository recordatorioRepository,
            IDetalleGastoRepository detalleGastoRepository,
            IPagoRepository pagoRepository,
            IGastoRepository gastoRepository,
            IGrupoRepository grupoRepository,
            IUsuarioRepository usuarioRepository,
            IConfiguracionNotificacionesRepository configuracionRepository,
            INotificacionRepository notificacionRepository)
        {
            _recordatorioRepository = recordatorioRepository;
            _detalleGastoRepository = detalleGastoRepository;
            _pagoRepository = pagoRepository;
            _gastoRepository = gastoRepository;
            _grupoRepository = grupoRepository;
            _usuarioRepository = usuarioRepository;
            _configuracionRepository = configuracionRepository;
            _notificacionRepository = notificacionRepository;
        }

        public async Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosByUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<List<RecordatorioDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var recordatorios = await _recordatorioRepository.GetByUsuarioAsync(idUsuarioGuid);

                response.Data = recordatorios.Select(r => new RecordatorioDto
                {
                    IdRecordatorio = r.IdRecordatorio,
                    IdUsuario = r.IdUsuario,
                    IdGrupo = r.IdGrupo,
                    IdReferencia = r.IdReferencia,
                    Titulo = r.Titulo,
                    Mensaje = r.Mensaje,
                    Tipo = r.Tipo,
                    FechaCreacion = r.FechaCreacion,
                    FechaRecordatorio = r.FechaRecordatorio,
                    Completado = r.Completado,
                    Repetir = r.Repetir,
                    FrecuenciaRepeticion = r.FrecuenciaRepeticion,
                    Estado = r.Estado,
                    NombreUsuario = r.Usuario?.Nombre ?? string.Empty,
                    NombreGrupo = r.Grupo?.NombreGrupo ?? string.Empty
                }).ToList();

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener recordatorios: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosPendientesByUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<List<RecordatorioDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var recordatorios = await _recordatorioRepository.GetPendientesByUsuarioAsync(idUsuarioGuid);

                response.Data = recordatorios.Select(r => new RecordatorioDto
                {
                    IdRecordatorio = r.IdRecordatorio,
                    IdUsuario = r.IdUsuario,
                    IdGrupo = r.IdGrupo,
                    IdReferencia = r.IdReferencia,
                    Titulo = r.Titulo,
                    Mensaje = r.Mensaje,
                    Tipo = r.Tipo,
                    FechaCreacion = r.FechaCreacion,
                    FechaRecordatorio = r.FechaRecordatorio,
                    Completado = r.Completado,
                    Repetir = r.Repetir,
                    FrecuenciaRepeticion = r.FrecuenciaRepeticion,
                    Estado = r.Estado,
                    NombreUsuario = r.Usuario?.Nombre ?? string.Empty,
                    NombreGrupo = r.Grupo?.NombreGrupo ?? string.Empty
                }).ToList();

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener recordatorios pendientes: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosByGrupoAsync(Guid idGrupo, string idUsuario)
        {
            var response = new ResponseDto<List<RecordatorioDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var _))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Aquí podría verificar si el usuario pertenece al grupo

                var recordatorios = await _recordatorioRepository.GetByGrupoAsync(idGrupo);

                response.Data = recordatorios.Select(r => new RecordatorioDto
                {
                    IdRecordatorio = r.IdRecordatorio,
                    IdUsuario = r.IdUsuario,
                    IdGrupo = r.IdGrupo,
                    IdReferencia = r.IdReferencia,
                    Titulo = r.Titulo,
                    Mensaje = r.Mensaje,
                    Tipo = r.Tipo,
                    FechaCreacion = r.FechaCreacion,
                    FechaRecordatorio = r.FechaRecordatorio,
                    Completado = r.Completado,
                    Repetir = r.Repetir,
                    FrecuenciaRepeticion = r.FrecuenciaRepeticion,
                    Estado = r.Estado,
                    NombreUsuario = r.Usuario?.Nombre ?? string.Empty,
                    NombreGrupo = r.Grupo?.NombreGrupo ?? string.Empty
                }).ToList();

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener recordatorios del grupo: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<RecordatorioDto>> CrearRecordatorioAsync(CrearRecordatorioDto recordatorioDto, string idUsuario)
        {
            var response = new ResponseDto<RecordatorioDto>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Verificar grupo si aplica
                var grupo = await _grupoRepository.GetByIdAsync(recordatorioDto.IdGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar pertenencia al grupo si es necesario

                // Crear recordatorio
                var recordatorio = new Recordatorio
                {
                    IdRecordatorio = Guid.NewGuid(),
                    IdUsuario = idUsuarioGuid,
                    IdGrupo = recordatorioDto.IdGrupo,
                    IdReferencia = recordatorioDto.IdReferencia,
                    Titulo = recordatorioDto.Titulo,
                    Mensaje = recordatorioDto.Mensaje,
                    Tipo = recordatorioDto.Tipo,
                    FechaCreacion = DateTime.UtcNow,
                    FechaRecordatorio = recordatorioDto.FechaRecordatorio,
                    Completado = false,
                    Repetir = recordatorioDto.Repetir,
                    FrecuenciaRepeticion = recordatorioDto.FrecuenciaRepeticion,
                    Estado = "Pendiente"
                };

                await _recordatorioRepository.CreateAsync(recordatorio);
                await _recordatorioRepository.SaveAsync();

                response.Data = new RecordatorioDto
                {
                    IdRecordatorio = recordatorio.IdRecordatorio,
                    IdUsuario = recordatorio.IdUsuario,
                    IdGrupo = recordatorio.IdGrupo,
                    IdReferencia = recordatorio.IdReferencia,
                    Titulo = recordatorio.Titulo,
                    Mensaje = recordatorio.Mensaje,
                    Tipo = recordatorio.Tipo,
                    FechaCreacion = recordatorio.FechaCreacion,
                    FechaRecordatorio = recordatorio.FechaRecordatorio,
                    Completado = recordatorio.Completado,
                    Repetir = recordatorio.Repetir,
                    FrecuenciaRepeticion = recordatorio.FrecuenciaRepeticion,
                    Estado = recordatorio.Estado,
                    NombreUsuario = string.Empty,
                    NombreGrupo = grupo.NombreGrupo
                };

                response.Mensaje = "Recordatorio creado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al crear recordatorio: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> ActualizarRecordatorioAsync(Guid idRecordatorio, CrearRecordatorioDto recordatorioDto, string idUsuario)
        {
            var response = new ResponseDto();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var recordatorio = await _recordatorioRepository.GetByIdAsync(idRecordatorio);
                if (recordatorio == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Recordatorio no encontrado";
                    return response;
                }

                if (recordatorio.IdUsuario != idUsuarioGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para modificar este recordatorio";
                    return response;
                }

                // Verificar grupo si aplica
                var grupo = await _grupoRepository.GetByIdAsync(recordatorioDto.IdGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar pertenencia al grupo si es necesario

                // Actualizar recordatorio
                recordatorio.IdGrupo = recordatorioDto.IdGrupo;
                recordatorio.IdReferencia = recordatorioDto.IdReferencia;
                recordatorio.Titulo = recordatorioDto.Titulo;
                recordatorio.Mensaje = recordatorioDto.Mensaje;
                recordatorio.Tipo = recordatorioDto.Tipo;
                recordatorio.FechaRecordatorio = recordatorioDto.FechaRecordatorio;
                recordatorio.Repetir = recordatorioDto.Repetir;
                recordatorio.FrecuenciaRepeticion = recordatorioDto.FrecuenciaRepeticion;

                await _recordatorioRepository.UpdateAsync(recordatorio);
                await _recordatorioRepository.SaveAsync();

                response.Mensaje = "Recordatorio actualizado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al actualizar recordatorio: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> EliminarRecordatorioAsync(Guid idRecordatorio, string idUsuario)
        {
            var response = new ResponseDto();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var recordatorio = await _recordatorioRepository.GetByIdAsync(idRecordatorio);
                if (recordatorio == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Recordatorio no encontrado";
                    return response;
                }

                if (recordatorio.IdUsuario != idUsuarioGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para eliminar este recordatorio";
                    return response;
                }

                await _recordatorioRepository.DeleteAsync(idRecordatorio);
                await _recordatorioRepository.SaveAsync();

                response.Mensaje = "Recordatorio eliminado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al eliminar recordatorio: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> MarcarComoCompletadoAsync(Guid idRecordatorio, string idUsuario)
        {
            var response = new ResponseDto();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var recordatorio = await _recordatorioRepository.GetByIdAsync(idRecordatorio);
                if (recordatorio == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Recordatorio no encontrado";
                    return response;
                }

                if (recordatorio.IdUsuario != idUsuarioGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para modificar este recordatorio";
                    return response;
                }

                if (await _recordatorioRepository.MarcarComoCompletadoAsync(idRecordatorio))
                {
                    await _recordatorioRepository.SaveAsync();

                    // Si el recordatorio es recurrente, crear uno nuevo
                    if (recordatorio.Repetir)
                    {
                        await CrearRecordatorioRecurrenteAsync(recordatorio);
                    }

                    response.Mensaje = "Recordatorio marcado como completado";
                }
                else
                {
                    response.Exito = false;
                    response.Mensaje = "Error al marcar recordatorio como completado";
                }

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al marcar recordatorio como completado: {ex.Message}";
                return response;
            }
        }

        private async Task CrearRecordatorioRecurrenteAsync(Recordatorio recordatorioCompletado)
        {
            try
            {
                var nuevoRecordatorio = new Recordatorio
                {
                    IdRecordatorio = Guid.NewGuid(),
                    IdUsuario = recordatorioCompletado.IdUsuario,
                    IdGrupo = recordatorioCompletado.IdGrupo,
                    IdReferencia = recordatorioCompletado.IdReferencia,
                    Titulo = recordatorioCompletado.Titulo,
                    Mensaje = recordatorioCompletado.Mensaje,
                    Tipo = recordatorioCompletado.Tipo,
                    FechaCreacion = DateTime.UtcNow,
                    Completado = false,
                    Repetir = true,
                    FrecuenciaRepeticion = recordatorioCompletado.FrecuenciaRepeticion,
                    Estado = "Pendiente"
                };

                // Calcular la próxima fecha de recordatorio
                switch (recordatorioCompletado.FrecuenciaRepeticion.ToLower())
                {
                    case "diario":
                        nuevoRecordatorio.FechaRecordatorio = DateTime.UtcNow.AddDays(1);
                        break;
                    case "semanal":
                        nuevoRecordatorio.FechaRecordatorio = DateTime.UtcNow.AddDays(7);
                        break;
                    case "mensual":
                        nuevoRecordatorio.FechaRecordatorio = DateTime.UtcNow.AddMonths(1);
                        break;
                    default:
                        nuevoRecordatorio.FechaRecordatorio = DateTime.UtcNow.AddDays(1);
                        break;
                }

                await _recordatorioRepository.CreateAsync(nuevoRecordatorio);
                await _recordatorioRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error
            }
        }

        public async Task CrearRecordatorioDeudaAsync(Guid idDetalleGasto)
        {
            try
            {
                var detalle = await _detalleGastoRepository.GetByIdAsync(idDetalleGasto);
                if (detalle == null || detalle.Pagado)
                    return;

                var gasto = await _gastoRepository.GetByIdAsync(detalle.IdGasto);
                if (gasto == null)
                    return;

                // Verificar configuración de notificaciones del usuario
                var config = await _configuracionRepository.GetByUsuarioAsync(detalle.IdMiembroDeudor);
                if (config == null || !config.RecordatoriosDeudas)
                    return;

                var miembro = await _usuarioRepository.GetByIdAsync(detalle.IdMiembroDeudor);
                var miembroPagador = await _usuarioRepository.GetByIdAsync(gasto.IdMiembroPagador);
                var grupo = await _grupoRepository.GetByIdAsync(gasto.IdGrupo);

                if (miembro == null || miembroPagador == null || grupo == null)
                    return;

                // Determinar la fecha del recordatorio según la configuración
                var hoy = DateTime.UtcNow;
                DateTime fechaRecordatorio = config.FrecuenciaRecordatorios.ToLower() switch
                {
                    "diario" => hoy.AddDays(1),
                    "semanal" => hoy.AddDays(7),
                    "mensual" => hoy.AddMonths(1),
                    _ => hoy.AddDays(7) // Default
                };

                // Crear recordatorio
                var recordatorio = new Recordatorio
                {
                    IdRecordatorio = Guid.NewGuid(),
                    IdUsuario = detalle.IdMiembroDeudor,
                    IdGrupo = gasto.IdGrupo,
                    IdReferencia = idDetalleGasto,
                    Titulo = "Deuda pendiente",
                    Mensaje = $"Tienes una deuda pendiente de {detalle.Monto:C} con {miembroPagador.Nombre} por '{gasto.Descripcion}' en el grupo {grupo.NombreGrupo}",
                    Tipo = "DeudaPendiente",
                    FechaCreacion = hoy,
                    FechaRecordatorio = fechaRecordatorio,
                    Completado = false,
                    Repetir = true,
                    FrecuenciaRepeticion = config.FrecuenciaRecordatorios,
                    Estado = "Pendiente"
                };

                await _recordatorioRepository.CreateAsync(recordatorio);
                await _recordatorioRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error
            }
        }

        public async Task CrearRecordatorioPagoAsync(Guid idPago)
        {
            try
            {
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null || pago.Estado != "Pendiente")
                    return;

                // Verificar configuración de notificaciones del usuario
                var config = await _configuracionRepository.GetByUsuarioAsync(pago.IdPagador);
                if (config == null || !config.RecordatoriosPagos)
                    return;

                var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);

                if (pagador == null || receptor == null)
                    return;

                // Determinar la fecha del recordatorio según la configuración
                var hoy = DateTime.UtcNow;
                DateTime fechaRecordatorio = config.FrecuenciaRecordatorios.ToLower() switch
                {
                    "diario" => hoy.AddDays(1),
                    "semanal" => hoy.AddDays(7),
                    "mensual" => hoy.AddMonths(1),
                    _ => hoy.AddDays(7) // Default
                };

                // Crear recordatorio
                var recordatorio = new Recordatorio
                {
                    IdRecordatorio = Guid.NewGuid(),
                    IdUsuario = pago.IdPagador,
                    IdGrupo = pago.IdGrupo,
                    IdReferencia = idPago,
                    Titulo = "Pago pendiente de confirmación",
                    Mensaje = $"Tu pago de {pago.Monto:C} a {receptor.Nombre} por '{pago.Concepto}' está pendiente de confirmación",
                    Tipo = "PagoPendiente",
                    FechaCreacion = hoy,
                    FechaRecordatorio = fechaRecordatorio,
                    Completado = false,
                    Repetir = true,
                    FrecuenciaRepeticion = config.FrecuenciaRecordatorios,
                    Estado = "Pendiente"
                };

                await _recordatorioRepository.CreateAsync(recordatorio);
                await _recordatorioRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error
            }
        }

        public async Task ProcesarRecordatoriosVencidosAsync()
        {
            try
            {
                // Obtener todos los recordatorios vencidos no completados
                var recordatoriosVencidos = await _recordatorioRepository.GetVencidosNoCompletadosAsync();

                foreach (var recordatorio in recordatoriosVencidos)
                {
                    // Crear notificación para el recordatorio
                    var notificacion = new Notificacion
                    {
                        IdNotificacion = Guid.NewGuid(),
                        IdUsuario = recordatorio.IdUsuario,
                        IdGrupo = recordatorio.IdGrupo,
                        Tipo = $"Recordatorio{recordatorio.Tipo}",
                        Mensaje = recordatorio.Mensaje,
                        Estado = "Pendiente",
                        FechaCreacion = DateTime.UtcNow,
                        CanalEnvio = "Email" // O determinar dinámicamente
                    };

                    await _notificacionRepository.CreateAsync(notificacion);

                    // Marcar como completado solo si no es recurrente
                    if (!recordatorio.Repetir)
                    {
                        recordatorio.Completado = true;
                        recordatorio.Estado = "Enviado";
                    }
                    else
                    {
                        // Para recordatorios recurrentes, crear uno nuevo con la próxima fecha
                        await CrearRecordatorioRecurrenteAsync(recordatorio);

                        // Y marcar el actual como completado
                        recordatorio.Completado = true;
                        recordatorio.Estado = "Enviado";
                    }

                    await _recordatorioRepository.UpdateAsync(recordatorio);
                }

                await _recordatorioRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error
            }
        }
    }
}