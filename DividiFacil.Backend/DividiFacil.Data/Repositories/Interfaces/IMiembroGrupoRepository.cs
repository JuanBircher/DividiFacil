using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IMiembroGrupoRepository : IRepositoryBase<MiembroGrupo>
    {
        new Task<MiembroGrupo?> GetByIdAsync(Guid idMiembro);
        Task<MiembroGrupo> GetByUsuarioYGrupoAsync(Guid idUsuario, Guid idGrupo);
        Task<IEnumerable<MiembroGrupo>> GetMiembrosByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<MiembroGrupo>> GetGruposByUsuarioAsync(Guid idUsuario);
        Task<bool> EsMiembroAsync(Guid idUsuario, Guid idGrupo);
        Task<bool> EsAdminAsync(Guid idUsuario, Guid idGrupo);
        // Agregar estos métodos si no existen:

        Task<bool> TieneGastosPendientesAsync(Guid idUsuario, Guid idGrupo);
        Task UpdateAsync(MiembroGrupo miembro);
        Task DeleteAsync(Guid idMiembro);
    }
}