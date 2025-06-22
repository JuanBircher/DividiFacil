using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Grupo;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IGrupoService
    {
        Task<ResponseDto<GrupoDto>> CrearGrupoAsync(GrupoCreacionDto grupoDto, string idUsuarioCreador);
        Task<ResponseDto<GrupoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante);
        Task<ResponseDto<GrupoConMiembrosDto>> GetConMiembrosAsync(Guid id, string idUsuarioSolicitante);
        Task<ResponseDto<IEnumerable<GrupoDto>>> GetByUsuarioAsync(string idUsuario);
        Task<ResponseDto<GrupoDto>> GetByCodigoAccesoAsync(string codigo);
        Task<ResponseDto> AgregarMiembroAsync(Guid idGrupo, InvitacionDto invitacionDto, string idUsuarioAdmin);
        Task<ResponseDto> EliminarMiembroAsync(Guid idGrupo, Guid idMiembro, string idUsuarioAdmin);
        Task<ResponseDto> CambiarRolMiembroAsync(Guid idGrupo, Guid idMiembro, string nuevoRol, string idUsuarioAdmin);
        Task<ResponseDto<string>> GenerarCodigoAccesoAsync(Guid idGrupo, string idUsuarioAdmin);
        Task<ResponseDto> ActualizarGrupoAsync(Guid idGrupo, GrupoCreacionDto grupoDto, string idUsuarioAdmin);
        Task<ResponseDto> EliminarGrupoAsync(Guid idGrupo, string idUsuarioAdmin);
    }
}