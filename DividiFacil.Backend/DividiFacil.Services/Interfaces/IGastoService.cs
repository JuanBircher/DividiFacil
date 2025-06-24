using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Gasto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IGastoService
    {
        Task<ResponseDto<GastoDto>> CrearGastoAsync(GastoCreacionDto gastoDto, string idUsuarioCreador);
        Task<ResponseDto<GastoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<GastoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<GastoDto>>> GetRecientesAsync(string idUsuario, int cantidad);
        Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosGrupoAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosUsuarioAsync(string idUsuario);
        Task<ResponseDto> MarcarComoPagadoAsync(Guid idGasto, Guid idDetalle, string idUsuarioSolicitante);
        Task<ResponseDto> EliminarGastoAsync(Guid idGasto, string idUsuarioSolicitante);
        Task<PaginatedResponseDto<GastoDto>> GetPaginatedByGrupoAsync(
           Guid idGrupo,
           PaginacionDto paginacion,
           string idUsuarioSolicitante);
    }
}
