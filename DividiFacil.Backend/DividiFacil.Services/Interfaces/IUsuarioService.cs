using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Usuario;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IUsuarioService
    {
        Task<ResponseDto<UsuarioDto>> GetByIdAsync(Guid id);
        Task<ResponseDto<IEnumerable<UsuarioDto>>> GetByGrupoAsync(Guid idGrupo);
        Task<ResponseDto<UsuarioDto>> ActualizarUsuarioAsync(Guid id, UsuarioActualizacionDto actualizacionDto);
        Task<bool> ExisteUsuarioAsync(string email);
    }
}