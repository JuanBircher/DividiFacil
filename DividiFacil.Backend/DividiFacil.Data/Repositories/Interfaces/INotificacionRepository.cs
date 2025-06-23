using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface INotificacionRepository : IRepositoryBase<Notificacion>
    {
        Task<IEnumerable<Notificacion>> GetPendientesByUsuarioAsync(Guid idUsuario);
        Task<IEnumerable<Notificacion>> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<Notificacion>> GetAllPendientesAsync();
    }
}