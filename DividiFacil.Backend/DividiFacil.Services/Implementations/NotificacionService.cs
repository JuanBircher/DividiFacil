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
    public class NotificacionService : INotificacionService
    {
        private readonly INotificacionRepository _notificacionRepository;
        private readonly IConfiguracionNotificacionesRepository _configuracionRepository;
        private readonly IPagoRepository _pagoRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;

        public NotificacionService(
            INotificacionRepository notificacionRepository,
            IConfiguracionNotificacionesRepository configuracionRepository,
            IPagoRepository pagoRepository,
            IGastoRepository gastoRepository,
            IGrupoRepository grupoRepository,
            IUsuarioRepository usuarioRepository,
            IMiembroGrupoRepository miembroGrupoRepository)
        {
            _notificacionRepository = notificacionRepository;
            _configuracionRepository = configuracionRepository;
            _pagoRepository = pagoRepository;
            _gastoRepository = gastoRepository;
            _grupoRepository = grupoRepository;
            _usuarioRepository = usuarioRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
        }

        public async Task<ResponseDto<List<NotificacionDto>>> GetNotificacionesPendientesByUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<List<NotificacionDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var notificaciones = await _notificacionRepository.GetPendientesByUsuarioAsync(idUsuarioGuid);

                response.Data = notificaciones.Select(n => new NotificacionDto
                {
                    IdNotificacion = n.IdNotificacion,
                    IdUsuario = n.IdUsuario,
                    IdGrupo = n.IdGrupo,
                    Tipo = n.Tipo,
                    Mensaje = n.Mensaje,
                    Estado = n.Estado,
                    FechaCreacion = n.FechaCreacion,
                    FechaEnvio = n.FechaEnvio,
                    CanalEnvio = n.CanalEnvio,
                    NombreUsuario = n.Usuario?.Nombre ?? string.Empty,
                    NombreGrupo = n.Grupo?.NombreGrupo ?? string.Empty
                }).ToList();

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener notificaciones: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<List<NotificacionDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuario)
        {
            var response = new ResponseDto<List<NotificacionDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var _))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Aquí podría verificar si el usuario pertenece al grupo

                var notificaciones = await _notificacionRepository.GetByGrupoAsync(idGrupo);

                response.Data = notificaciones.Select(n => new NotificacionDto
                {
                    IdNotificacion = n.IdNotificacion,
                    IdUsuario = n.IdUsuario,
                    IdGrupo = n.IdGrupo,
                    Tipo = n.Tipo,
                    Mensaje = n.Mensaje,
                    Estado = n.Estado,
                    FechaCreacion = n.FechaCreacion,
                    FechaEnvio = n.FechaEnvio,
                    CanalEnvio = n.CanalEnvio,
                    NombreUsuario = n.Usuario?.Nombre ?? string.Empty,
                    NombreGrupo = n.Grupo?.NombreGrupo ?? string.Empty
                }).ToList();

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener notificaciones del grupo: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> MarcarComoEnviadaAsync(Guid idNotificacion, string idUsuario)
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

                var notificacion = await _notificacionRepository.GetByIdAsync(idNotificacion);

                if (notificacion == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Notificación no encontrada";
                    return response;
                }

                if (notificacion.IdUsuario != idUsuarioGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para modificar esta notificación";
                    return response;
                }

                notificacion.Estado = "Enviado";
                notificacion.FechaEnvio = DateTime.UtcNow;

                await _notificacionRepository.UpdateAsync(notificacion);
                await _notificacionRepository.SaveAsync();

                response.Mensaje = "Notificación marcada como enviada";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al marcar la notificación como enviada: {ex.Message}";
                return response;
            }
        }

        public async Task CrearNotificacionPagoAsync(Guid idPago, string tipo)
        {
            try
            {
                var pago = await _pagoRepository.GetByIdAsync(idPago);
                if (pago == null)
                    return;

                var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);

                if (pagador == null || receptor == null)
                    return;

                Guid idUsuarioDestinatario;
                string mensaje;

                // Determinar destinatario y mensaje según el tipo
                switch (tipo)
                {
                    case "Creado":
                        idUsuarioDestinatario = pago.IdReceptor;
                        // Verificar si el usuario tiene habilitadas las notificaciones
                        var configReceptor = await _configuracionRepository.GetByUsuarioAsync(idUsuarioDestinatario);
                        if (configReceptor == null || !configReceptor.NotificarNuevosPagos)
                            return;
                        mensaje = $"{pagador.Nombre} te ha enviado un pago de {pago.Monto:C}";
                        break;
                    case "Confirmado":
                        idUsuarioDestinatario = pago.IdPagador;
                        // Verificar si el usuario tiene habilitadas las notificaciones
                        var configPagador = await _configuracionRepository.GetByUsuarioAsync(idUsuarioDestinatario);
                        if (configPagador == null || !configPagador.NotificarCambiosEstadoPagos)
                            return;
                        mensaje = $"{receptor.Nombre} ha confirmado tu pago de {pago.Monto:C}";
                        break;
                    case "Rechazado":
                        idUsuarioDestinatario = pago.IdPagador;
                        // Verificar si el usuario tiene habilitadas las notificaciones
                        var configPagadorRechazado = await _configuracionRepository.GetByUsuarioAsync(idUsuarioDestinatario);
                        if (configPagadorRechazado == null || !configPagadorRechazado.NotificarCambiosEstadoPagos)
                            return;
                        mensaje = $"{receptor.Nombre} ha rechazado tu pago de {pago.Monto:C}";
                        break;
                    default:
                        return; // Tipo no soportado
                }

                // Crear notificación
                var notificacion = new Notificacion
                {
                    IdNotificacion = Guid.NewGuid(),
                    IdUsuario = idUsuarioDestinatario,
                    IdGrupo = pago.IdGrupo,
                    Tipo = $"Pago{tipo}",
                    Mensaje = mensaje,
                    Estado = "Pendiente",
                    FechaCreacion = DateTime.UtcNow,
                    CanalEnvio = !string.IsNullOrEmpty(receptor.TokenNotificacion) ? "Push" : "Email"
                };

                await _notificacionRepository.CreateAsync(notificacion);
                await _notificacionRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error pero no interrumpir el flujo principal
            }
        }

        public async Task CrearNotificacionGastoAsync(Guid idGasto)
        {
            try
            {
                var gasto = await _gastoRepository.GetByIdAsync(idGasto);
                if (gasto == null)
                    return;

                var pagador = await _usuarioRepository.GetByIdAsync(gasto.IdMiembroPagador); // Usar IdMiembroPagador en lugar de IdPagador
                if (pagador == null)
                    return;

                var grupo = await _grupoRepository.GetByIdAsync(gasto.IdGrupo);
                if (grupo == null)
                    return;

                // Obtener todos los miembros del grupo
                var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(gasto.IdGrupo);

                foreach (var miembro in miembros)
                {
                    // No notificar al creador del gasto
                    if (miembro.IdUsuario == gasto.IdMiembroPagador) // Usar IdMiembroPagador en lugar de IdPagador
                        continue;

                    // Verificar si el usuario tiene habilitadas las notificaciones
                    var config = await _configuracionRepository.GetByUsuarioAsync(miembro.IdUsuario);
                    if (config == null || !config.NotificarNuevosGastos)
                        continue;

                    // Crear notificación
                    var notificacion = new Notificacion
                    {
                        IdNotificacion = Guid.NewGuid(),
                        IdUsuario = miembro.IdUsuario,
                        IdGrupo = gasto.IdGrupo,
                        Tipo = "NuevoGasto",
                        Mensaje = $"{pagador.Nombre} ha registrado un gasto de {gasto.Monto:C} por '{gasto.Descripcion}' en {grupo.NombreGrupo}",
                        Estado = "Pendiente",
                        FechaCreacion = DateTime.UtcNow,
                        CanalEnvio = !string.IsNullOrEmpty(miembro.Usuario?.TokenNotificacion) ? "Push" : "Email"
                    };

                    await _notificacionRepository.CreateAsync(notificacion);
                }

                await _notificacionRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error pero no interrumpir el flujo principal
            }
        }

        public async Task CrearNotificacionGrupoAsync(Guid idGrupo, Guid idUsuarioDestino, string mensaje, string tipo)
        {
            try
            {
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                    return;

                var usuario = await _usuarioRepository.GetByIdAsync(idUsuarioDestino);
                if (usuario == null)
                    return;

                // Verificar configuración según el tipo
                var config = await _configuracionRepository.GetByUsuarioAsync(idUsuarioDestino);
                if (config == null ||
                    (tipo == "Invitacion" && !config.NotificarInvitacionesGrupo))
                    return;

                // Crear notificación
                var notificacion = new Notificacion
                {
                    IdNotificacion = Guid.NewGuid(),
                    IdUsuario = idUsuarioDestino,
                    IdGrupo = idGrupo,
                    Tipo = $"Grupo{tipo}",
                    Mensaje = mensaje,
                    Estado = "Pendiente",
                    FechaCreacion = DateTime.UtcNow,
                    CanalEnvio = !string.IsNullOrEmpty(usuario.TokenNotificacion) ? "Push" : "Email"
                };

                await _notificacionRepository.CreateAsync(notificacion);
                await _notificacionRepository.SaveAsync();
            }
            catch (Exception)
            {
                // Loggear error pero no interrumpir el flujo principal
            }
        }

        public async Task<ResponseDto<ConfiguracionNotificacionesDto>> GetConfiguracionByUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<ConfiguracionNotificacionesDto>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var config = await _configuracionRepository.GetByUsuarioAsync(idUsuarioGuid);

                // Si no existe, crear una con valores por defecto
                if (config == null)
                {
                    config = new ConfiguracionNotificaciones
                    {
                        IdConfiguracion = Guid.NewGuid(),
                        IdUsuario = idUsuarioGuid,
                        NotificarNuevosPagos = true,
                        NotificarNuevosGastos = true,
                        NotificarInvitacionesGrupo = true,
                        NotificarCambiosEstadoPagos = true,
                        RecordatoriosDeudas = true,
                        RecordatoriosPagos = true,
                        FrecuenciaRecordatorios = "Semanal"
                    };

                    await _configuracionRepository.CreateAsync(config);
                    await _configuracionRepository.SaveAsync();
                }

                response.Data = new ConfiguracionNotificacionesDto
                {
                    IdConfiguracion = config.IdConfiguracion,
                    IdUsuario = config.IdUsuario,
                    NotificarNuevosPagos = config.NotificarNuevosPagos,
                    NotificarNuevosGastos = config.NotificarNuevosGastos,
                    NotificarInvitacionesGrupo = config.NotificarInvitacionesGrupo,
                    NotificarCambiosEstadoPagos = config.NotificarCambiosEstadoPagos,
                    RecordatoriosDeudas = config.RecordatoriosDeudas,
                    RecordatoriosPagos = config.RecordatoriosPagos,
                    FrecuenciaRecordatorios = config.FrecuenciaRecordatorios
                };

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener configuración de notificaciones: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> ActualizarConfiguracionAsync(ConfiguracionNotificacionesDto configuracionDto, string idUsuario)
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

                // Verificar que la configuración pertenezca al usuario
                if (configuracionDto.IdUsuario != idUsuarioGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para modificar esta configuración";
                    return response;
                }

                var config = await _configuracionRepository.GetByIdAsync(configuracionDto.IdConfiguracion);

                if (config == null)
                {
                    // Crear nueva configuración
                    config = new ConfiguracionNotificaciones
                    {
                        IdConfiguracion = Guid.NewGuid(),
                        IdUsuario = idUsuarioGuid
                    };

                    await _configuracionRepository.CreateAsync(config);
                }

                // Actualizar propiedades
                config.NotificarNuevosPagos = configuracionDto.NotificarNuevosPagos;
                config.NotificarNuevosGastos = configuracionDto.NotificarNuevosGastos;
                config.NotificarInvitacionesGrupo = configuracionDto.NotificarInvitacionesGrupo;
                config.NotificarCambiosEstadoPagos = configuracionDto.NotificarCambiosEstadoPagos;
                config.RecordatoriosDeudas = configuracionDto.RecordatoriosDeudas;
                config.RecordatoriosPagos = configuracionDto.RecordatoriosPagos;
                config.FrecuenciaRecordatorios = configuracionDto.FrecuenciaRecordatorios;

                await _configuracionRepository.UpdateAsync(config);
                await _configuracionRepository.SaveAsync();

                response.Mensaje = "Configuración de notificaciones actualizada correctamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al actualizar configuración de notificaciones: {ex.Message}";
                return response;
            }
        }

        public async Task EnviarNotificacionesPendientesAsync()
        {
            try
            {
                // Obtener todas las notificaciones pendientes
                var notificacionesPendientes = await _notificacionRepository.GetAllPendientesAsync();

                if (notificacionesPendientes == null || !notificacionesPendientes.Any())
                    return;

                foreach (var notificacion in notificacionesPendientes)
                {
                    try
                    {
                        var usuario = await _usuarioRepository.GetByIdAsync(notificacion.IdUsuario);
                        if (usuario == null)
                            continue;

                        // Verificar si el usuario tiene configuración de notificaciones
                        var configNotificaciones = await _configuracionRepository.GetByUsuarioAsync(notificacion.IdUsuario);

                        // Si el usuario tiene configurado no recibir este tipo de notificación, continuamos
                        if (!DebeRecibirNotificacion(notificacion.Tipo, configNotificaciones))
                            continue;

                        // Enviar notificación según el canal configurado
                        bool enviado = false;

                        if (notificacion.CanalEnvio == "Push" && !string.IsNullOrEmpty(usuario.TokenNotificacion))
                        {
                            enviado = await EnviarNotificacionPushAsync(notificacion, usuario.TokenNotificacion);
                        }
                        else
                        {
                            // Si no se puede por push, intentar por email
                            enviado = await EnviarNotificacionEmailAsync(notificacion, usuario.Email);
                        }

                        if (enviado)
                        {
                            notificacion.Estado = "Enviado";
                            notificacion.FechaEnvio = DateTime.UtcNow;
                            await _notificacionRepository.UpdateAsync(notificacion);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Loguear el error pero continuar con las demás notificaciones
                        // TODO: Implementar logging adecuado
                        Console.WriteLine($"Error al enviar notificación {notificacion.IdNotificacion}: {ex.Message}");
                    }
                }

                await _notificacionRepository.SaveAsync();
            }
            catch (Exception ex)
            {
                // Loguear el error general
                Console.WriteLine($"Error al procesar notificaciones pendientes: {ex.Message}");
            }
        }

        private bool DebeRecibirNotificacion(string tipo, ConfiguracionNotificaciones? config)
        {
            // Si no hay configuración, utilizar valores predeterminados (todas activadas)
            if (config == null)
                return true;

            // Determinar si se debe enviar la notificación según el tipo
            return tipo switch
            {
                "PagoCreado" => config.NotificarNuevosPagos,
                "PagoConfirmado" => config.NotificarCambiosEstadoPagos,
                "PagoRechazado" => config.NotificarCambiosEstadoPagos,
                "NuevoGasto" => config.NotificarNuevosGastos,
                "GrupoInvitacion" => config.NotificarInvitacionesGrupo,
                _ => true // Tipos no específicos se notifican por defecto
            };
        }

        private async Task<bool> EnviarNotificacionPushAsync(Notificacion notificacion, string tokenDispositivo)
        {
            // Implementación básica - reemplazar por un servicio real de notificaciones push
            try
            {
                // Aquí iría la lógica para enviar la notificación push
                // Por ejemplo, usando Firebase Cloud Messaging
                // await _fcmService.SendNotificationAsync(tokenDispositivo, notificacion.Mensaje);

                await Task.Delay(100); // Simulación de envío
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar notificación push: {ex.Message}");
                return false;
            }
        }

        private async Task<bool> EnviarNotificacionEmailAsync(Notificacion notificacion, string email)
        {
            // Implementación básica - reemplazar por un servicio real de email
            try
            {
                // Aquí iría la lógica para enviar el email
                // Por ejemplo, usando SendGrid o SMTP
                // await _emailService.SendEmailAsync(email, "Nueva notificación", notificacion.Mensaje);

                await Task.Delay(100); // Simulación de envío
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar notificación por email: {ex.Message}");
                return false;
            }
        }
    }
}