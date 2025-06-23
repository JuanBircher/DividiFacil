using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IRecordatorioRepository : IRepositoryBase<Recordatorio>
    {
        Task<IEnumerable<Recordatorio>> GetByUsuarioAsync(Guid idUsuario);
        Task<IEnumerable<Recordatorio>> GetPendientesByUsuarioAsync(Guid idUsuario);
        Task<IEnumerable<Recordatorio>> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<Recordatorio>> GetVencidosNoCompletadosAsync();
        Task<bool> MarcarComoCompletadoAsync(Guid idRecordatorio);
    }
}