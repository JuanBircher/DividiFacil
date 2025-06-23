using Azure;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Pago;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class PagoService : IPagoService
    {
        private readonly IPagoRepository _pagoRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IDetalleGastoRepository _detalleGastoRepository;
        private readonly INotificacionService _notificacionService;
        private readonly IRecordatorioService _recordatorioService;

        public PagoService(
            IPagoRepository pagoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IUsuarioRepository usuarioRepository,
            IGrupoRepository grupoRepository,
            IDetalleGastoRepository detalleGastoRepository, 
            INotificacionService notificacionService,
            IRecordatorioService recordatorioService)
        {
            _pagoRepository = pagoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _usuarioRepository = usuarioRepository;
            _grupoRepository = grupoRepository;
            _detalleGastoRepository = detalleGastoRepository;
            _notificacionService = notificacionService;
            _recordatorioService = recordatorioService;
        }

        public async Task<ResponseDto<PagoDto>> CrearPagoAsync(PagoCreacionDto pagoCreacionDto, string idUsuarioCreador)
        {
            var response = new ResponseDto<PagoDto>();

            try
            {
                // Validar que el usuario emisor existe
                if (!Guid.TryParse(idUsuarioCreador, out var idPagador))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var pagador = await _usuarioRepository.GetByIdAsync(idPagador);
                if (pagador == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Usuario pagador no encontrado";
                    return response;
                }

                // Validar que el usuario receptor existe
                var receptor = await _usuarioRepository.GetByIdAsync(pagoCreacionDto.IdReceptor);
                if (receptor == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Usuario receptor no encontrado";
                    return response;
                }

                // Determinar el grupo
                Guid idGrupo = pagoCreacionDto.IdGrupo ?? Guid.Empty;

                if (idGrupo == Guid.Empty)
                {
                    response.Exito = false;
                    response.Mensaje = "Se requiere especificar un grupo para el pago";
                    return response;
                }

                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar que ambos usuarios pertenecen al grupo
                var miembroPagador = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idPagador, idGrupo);
                var miembroReceptor = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(pagoCreacionDto.IdReceptor, idGrupo);

                if (miembroPagador == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No eres miembro del grupo especificado";
                    return response;
                }

                if (miembroReceptor == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El receptor no es miembro del grupo especificado";
                    return response;
                }

                // Crear nuevo pago
                var nuevoPago = new Pago
                {
                    IdPago = Guid.NewGuid(),
                    IdPagador = idPagador,
                    IdReceptor = pagoCreacionDto.IdReceptor,
                    IdGrupo = idGrupo,
                    Monto = pagoCreacionDto.Monto,
                    Concepto = pagoCreacionDto.Concepto ?? string.Empty,
                    Estado = "Pendiente",
                    FechaCreacion = DateTime.UtcNow,
                    ComprobantePath = pagoCreacionDto.ComprobantePath
                };

                // Guardar en la base de datos
                await _pagoRepository.CreateAsync(nuevoPago);
                await _pagoRepository.SaveAsync();

                await _notificacionService.CrearNotificacionPagoAsync(nuevoPago.IdPago, "Creado");
                await _recordatorioService.CrearRecordatorioPagoAsync(nuevoPago.IdPago);


                // Preparar respuesta
                var nuevoPagoDto = new PagoDto
                {
                    IdPago = nuevoPago.IdPago,
                    IdPagador = nuevoPago.IdPagador,
                    NombrePagador = pagador.Nombre ?? "Usuario desconocido",
                    IdReceptor = nuevoPago.IdReceptor,
                    NombreReceptor = receptor.Nombre ?? "Usuario desconocido",
                    Monto = nuevoPago.Monto,
                    Concepto = nuevoPago.Concepto,
                    FechaCreacion = nuevoPago.FechaCreacion,
                    Estado = nuevoPago.Estado,
                    IdGrupo = nuevoPago.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo ?? "Grupo sin nombre",
                    ComprobantePath = nuevoPago.ComprobantePath
                };
                
                response.Data = nuevoPagoDto;
                response.Mensaje = "Pago registrado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al crear pago: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> ConfirmarPagoAsync(Guid idPago, string idUsuarioReceptor)
        {
            var response = new ResponseDto();

            try
            {
                // Validar que el usuario receptor existe
                if (!Guid.TryParse(idUsuarioReceptor, out var idReceptor))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener el pago
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Pago no encontrado";
                    return response;
                }

                // Verificar que el usuario es el receptor del pago
                if (pago.IdReceptor != idReceptor)
                {
                    response.Exito = false;
                    response.Mensaje = "Solo el receptor puede confirmar el pago";
                    return response;
                }

                // Verificar que el pago está pendiente
                if (pago.Estado != "Pendiente")
                {
                    response.Exito = false;
                    response.Mensaje = $"No se puede confirmar un pago en estado {pago.Estado}";
                    return response;
                }

                // Actualizar el estado del pago
                pago.Estado = "Completado";
                pago.FechaConfirmacion = DateTime.UtcNow;

                // Actualizar en la base de datos
                await _pagoRepository.UpdateAsync(pago);
                await _pagoRepository.SaveAsync();
                await _notificacionService.CrearNotificacionPagoAsync(idPago, "Confirmado");

                response.Mensaje = "Pago confirmado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al confirmar pago: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> RechazarPagoAsync(Guid idPago, string idUsuarioReceptor, string? motivo = null)
        {
            var response = new ResponseDto();

            try
            {
                // Validar que el usuario receptor existe
                if (!Guid.TryParse(idUsuarioReceptor, out var idReceptor))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener el pago
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Pago no encontrado";
                    return response;
                }

                // Verificar que el usuario es el receptor del pago
                if (pago.IdReceptor != idReceptor)
                {
                    response.Exito = false;
                    response.Mensaje = "Solo el receptor puede rechazar el pago";
                    return response;
                }

                // Verificar que el pago está pendiente
                if (pago.Estado != "Pendiente")
                {
                    response.Exito = false;
                    response.Mensaje = $"No se puede rechazar un pago en estado {pago.Estado}";
                    return response;
                }

                // Actualizar el estado del pago
                pago.Estado = "Rechazado";
                pago.MotivoRechazo = motivo;

                // Actualizar en la base de datos
                await _pagoRepository.UpdateAsync(pago);
                await _pagoRepository.SaveAsync();
                await _notificacionService.CrearNotificacionPagoAsync(idPago, "Rechazado");

                response.Mensaje = "Pago rechazado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al rechazar pago: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<PagoDto>> GetByIdAsync(Guid idPago, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<PagoDto>();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener el pago
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Pago no encontrado";
                    return response;
                }

                // Verificar que el usuario está relacionado con el pago
                bool esParteDelPago = pago.IdPagador == idUsuario || pago.IdReceptor == idUsuario;

                // O que es administrador del grupo
                bool esAdmin = false;

                if (!esParteDelPago)
                {
                    var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuario, pago.IdGrupo);
                    esAdmin = miembro?.Rol == "Admin";

                    if (!esAdmin)
                    {
                        response.Exito = false;
                        response.Mensaje = "No tienes permiso para ver este pago";
                        return response;
                    }
                }

                // Obtener detalles relacionados
                var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);
                var grupo = await _grupoRepository.GetByIdAsync(pago.IdGrupo);

                // Crear DTO
                var resultadoDto = new PagoDto
                {
                    IdPago = pago.IdPago,
                    IdPagador = pago.IdPagador,
                    NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                    IdReceptor = pago.IdReceptor,
                    NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                    Monto = pago.Monto,
                    Concepto = pago.Concepto,
                    FechaCreacion = pago.FechaCreacion,
                    FechaConfirmacion = pago.FechaConfirmacion,
                    Estado = pago.Estado,
                    IdGrupo = pago.IdGrupo,
                    NombreGrupo = grupo?.NombreGrupo,
                    ComprobantePath = pago.ComprobantePath,
                    MotivoRechazo = pago.MotivoRechazo
                };

                response.Data = resultadoDto;
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener pago: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetByUsuarioAsync(string idUsuario, bool recibidos = false)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener los pagos según el tipo (emitidos o recibidos)
                IEnumerable<Pago> pagos;

                if (recibidos)
                {
                    pagos = await _pagoRepository.GetByReceptorAsync(idUsuarioGuid);
                }
                else
                {
                    pagos = await _pagoRepository.GetByPagadorAsync(idUsuarioGuid);
                }

                // Mapear a DTOs
                var pagosResultado = new List<PagoDto>();

                foreach (var pago in pagos)
                {
                    var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                    var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);
                    var grupo = await _grupoRepository.GetByIdAsync(pago.IdGrupo);

                    pagosResultado.Add(new PagoDto
                    {
                        IdPago = pago.IdPago,
                        IdPagador = pago.IdPagador,
                        NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                        IdReceptor = pago.IdReceptor,
                        NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                        Monto = pago.Monto,
                        Concepto = pago.Concepto,
                        FechaCreacion = pago.FechaCreacion,
                        FechaConfirmacion = pago.FechaConfirmacion,
                        Estado = pago.Estado,
                        IdGrupo = pago.IdGrupo,
                        NombreGrupo = grupo?.NombreGrupo,
                        ComprobantePath = pago.ComprobantePath,
                        MotivoRechazo = pago.MotivoRechazo
                    });
                }

                response.Data = pagosResultado;
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener pagos: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Verificar que el usuario pertenece al grupo
                var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuario, idGrupo);
                if (miembro == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No eres miembro de este grupo";
                    return response;
                }

                // Obtener todos los pagos del grupo
                var pagos = await _pagoRepository.GetByGrupoAsync(idGrupo);

                // Mapear a DTOs
                var pagosResultado = new List<PagoDto>();

                foreach (var pago in pagos)
                {
                    var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                    var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);
                    var grupo = await _grupoRepository.GetByIdAsync(pago.IdGrupo);

                    pagosResultado.Add(new PagoDto
                    {
                        IdPago = pago.IdPago,
                        IdPagador = pago.IdPagador,
                        NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                        IdReceptor = pago.IdReceptor,
                        NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                        Monto = pago.Monto,
                        Concepto = pago.Concepto,
                        FechaCreacion = pago.FechaCreacion,
                        FechaConfirmacion = pago.FechaConfirmacion,
                        Estado = pago.Estado,
                        IdGrupo = pago.IdGrupo,
                        NombreGrupo = grupo?.NombreGrupo,
                        ComprobantePath = pago.ComprobantePath,
                        MotivoRechazo = pago.MotivoRechazo
                    });
                }

                response.Data = pagosResultado;
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener pagos del grupo: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> EliminarPagoAsync(Guid idPago, string idUsuarioPagador)
        {
            var response = new ResponseDto();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuarioPagador, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener el pago
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Pago no encontrado";
                    return response;
                }

                // Verificar que el usuario es el pagador o un administrador
                if (pago.IdPagador != idUsuario)
                {
                    var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuario, pago.IdGrupo);
                    if (miembro?.Rol != "Admin")
                    {
                        response.Exito = false;
                        response.Mensaje = "No tienes permiso para eliminar este pago";
                        return response;
                    }
                }

                // Verificar que el pago está pendiente
                if (pago.Estado != "Pendiente")
                {
                    response.Exito = false;
                    response.Mensaje = $"No se puede eliminar un pago en estado {pago.Estado}";
                    return response;
                }

                // Eliminar el pago
                await _pagoRepository.DeleteAsync(idPago);
                await _pagoRepository.SaveAsync();

                response.Mensaje = "Pago eliminado correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al eliminar pago: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetPagosPendientesAsync(string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener los grupos del usuario
                var miembrosGrupo = await _miembroGrupoRepository.GetGruposByUsuarioAsync(idUsuario);

                var pagosPendientes = new List<Pago>();

                // Recopilar pagos pendientes de todos los grupos
                foreach (var miembro in miembrosGrupo)
                {
                    var pagosGrupo = await _pagoRepository.GetByReceptorAsync(idUsuario, miembro.IdGrupo);
                    pagosPendientes.AddRange(pagosGrupo.Where(p => p.Estado == "Pendiente"));
                }

                // Mapear a DTOs
                var pagosResultado = new List<PagoDto>();

                foreach (var pago in pagosPendientes)
                {
                    var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                    var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);
                    var grupo = await _grupoRepository.GetByIdAsync(pago.IdGrupo);

                    pagosResultado.Add(new PagoDto
                    {
                        IdPago = pago.IdPago,
                        IdPagador = pago.IdPagador,
                        NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                        IdReceptor = pago.IdReceptor,
                        NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                        Monto = pago.Monto,
                        Concepto = pago.Concepto,
                        FechaCreacion = pago.FechaCreacion,
                        FechaConfirmacion = pago.FechaConfirmacion,
                        Estado = pago.Estado,
                        IdGrupo = pago.IdGrupo,
                        NombreGrupo = grupo?.NombreGrupo,
                        ComprobantePath = pago.ComprobantePath,
                        MotivoRechazo = pago.MotivoRechazo
                    });
                }

                response.Data = pagosResultado;
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener pagos pendientes: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetPagosCompletadosAsync(string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

            try
            {
                // Validar que el usuario existe
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Obtener pagos realizados y recibidos
                var pagosRealizados = await _pagoRepository.GetByPagadorAsync(idUsuario);
                var pagosRecibidos = await _pagoRepository.GetByReceptorAsync(idUsuario);

                // Filtrar pagos completados usando un HashSet para eliminar duplicados
                var pagosIds = new HashSet<Guid>();
                var pagosCompletados = new List<Pago>();

                foreach (var pago in pagosRealizados.Concat(pagosRecibidos))
                {
                    if (pago.Estado == "Completado" && pagosIds.Add(pago.IdPago))
                    {
                        pagosCompletados.Add(pago);
                    }
                }

                // Mapear a DTOs
                var pagosResultado = new List<PagoDto>();

                foreach (var pago in pagosCompletados)
                {
                    var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                    var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);
                    var grupo = await _grupoRepository.GetByIdAsync(pago.IdGrupo);

                    pagosResultado.Add(new PagoDto
                    {
                        IdPago = pago.IdPago,
                        IdPagador = pago.IdPagador,
                        NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                        IdReceptor = pago.IdReceptor,
                        NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                        Monto = pago.Monto,
                        Concepto = pago.Concepto,
                        FechaCreacion = pago.FechaCreacion,
                        FechaConfirmacion = pago.FechaConfirmacion,
                        Estado = pago.Estado,
                        IdGrupo = pago.IdGrupo,
                        NombreGrupo = grupo?.NombreGrupo,
                        ComprobantePath = pago.ComprobantePath,
                        MotivoRechazo = pago.MotivoRechazo
                    });
                }

                response.Data = pagosResultado;
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener pagos completados: {ex.Message}";
                return response;
            }
        }
    }
}