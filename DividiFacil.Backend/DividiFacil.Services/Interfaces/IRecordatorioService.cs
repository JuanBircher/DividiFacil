using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Notificacion;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IRecordatorioService
    {
        Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosByUsuarioAsync(string idUsuario);
        Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosPendientesByUsuarioAsync(string idUsuario);
        Task<ResponseDto<List<RecordatorioDto>>> GetRecordatoriosByGrupoAsync(Guid idGrupo, string idUsuario);
        Task<ResponseDto<RecordatorioDto>> CrearRecordatorioAsync(CrearRecordatorioDto recordatorioDto, string idUsuario);
        Task<ResponseDto> ActualizarRecordatorioAsync(Guid idRecordatorio, CrearRecordatorioDto recordatorioDto, string idUsuario);
        Task<ResponseDto> EliminarRecordatorioAsync(Guid idRecordatorio, string idUsuario);
        Task<ResponseDto> MarcarComoCompletadoAsync(Guid idRecordatorio, string idUsuario);

        // Recordatorios automáticos
        Task CrearRecordatorioDeudaAsync(Guid idDetalleGasto);
        Task CrearRecordatorioPagoAsync(Guid idPago);

        // Procesamiento de recordatorios
        Task ProcesarRecordatoriosVencidosAsync();
    }
}