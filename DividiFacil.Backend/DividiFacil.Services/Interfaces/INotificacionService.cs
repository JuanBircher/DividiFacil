using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Notificacion;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface INotificacionService
    {
        // Gestión de notificaciones
        Task<ResponseDto<List<NotificacionDto>>> GetNotificacionesPendientesByUsuarioAsync(string idUsuario);
        Task<ResponseDto<List<NotificacionDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuario);
        Task<ResponseDto> MarcarComoEnviadaAsync(Guid idNotificacion, string idUsuario);

        // Creación de notificaciones
        Task CrearNotificacionPagoAsync(Guid idPago, string tipo);
        Task CrearNotificacionGastoAsync(Guid idGasto);
        Task CrearNotificacionGrupoAsync(Guid idGrupo, Guid idUsuarioDestino, string mensaje, string tipo);

        // Gestión de configuraciones
        Task<ResponseDto<ConfiguracionNotificacionesDto>> GetConfiguracionByUsuarioAsync(string idUsuario);
        Task<ResponseDto> ActualizarConfiguracionAsync(ConfiguracionNotificacionesDto configuracion, string idUsuario);

        // Envío de notificaciones
        Task EnviarNotificacionesPendientesAsync();
    }
}