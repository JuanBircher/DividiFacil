using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IGrupoRepository : IRepositoryBase<Grupo>
    {
        Task<IEnumerable<Grupo>> GetByUsuarioAsync(Guid idUsuario);
        Task<Grupo?> GetByCodigoAccesoAsync(string codigoAcceso);
        Task<bool> EsMiembroAsync(Guid idUsuario, Guid idGrupo);
        Task<bool> EsAdminAsync(Guid idUsuario, Guid idGrupo);
        Task<bool> TieneGastosPendientesAsync(Guid idGrupo);
    }
}