using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Pago;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IPagoService
    {
        Task<ResponseDto<PagoDto>> CrearPagoAsync(PagoCreacionDto pagoDto, string idUsuarioPagador);
        Task<ResponseDto<PagoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<PagoDto>>> GetByUsuarioAsync(string idUsuario, bool recibidos = false);
        Task<ResponseDto<IEnumerable<PagoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto> ConfirmarPagoAsync(Guid idPago, string idUsuarioReceptor);
        Task<ResponseDto> RechazarPagoAsync(Guid idPago, string idUsuarioReceptor, string? motivo = null);
        Task<ResponseDto> EliminarPagoAsync(Guid idPago, string idUsuarioPagador);
    }
}