using DividiFacil.Domain.DTOs.Balance;
using DividiFacil.Domain.DTOs.Base;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IBalanceService
    {
        Task<ResponseDto<BalanceGrupoDto>> CalcularBalanceGrupoAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto<List<DeudaSimplificadaDto>>> SimplificarDeudasAsync(Guid idGrupo, string idUsuarioSolicitante);
        Task<ResponseDto<List<BalanceUsuarioDto>>> ObtenerBalanceUsuarioAsync(string idUsuario);
    }
}