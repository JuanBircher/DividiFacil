using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.CajaComun;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface ICajaComunService
    {
        Task<ResponseDto<CajaComunDto>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<MovimientoCajaDto>>> GetMovimientosAsync(Guid idCaja, string idUsuarioSolicitante);
        Task<ResponseDto<MovimientoCajaDto>> RegistrarMovimientoAsync(MovimientoCajaCreacionDto movimientoDto, string idUsuarioCreador);
        Task<ResponseDto> EliminarMovimientoAsync(Guid idMovimiento, string idUsuarioSolicitante);
        Task<ResponseDto<CajaComunDto>> CrearCajaComunAsync(Guid idGrupo, string idUsuarioAdmin);
    }
}