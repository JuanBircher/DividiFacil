using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IGastoRepository : IRepositoryBase<Gasto>
    {
        new Task<Gasto?> GetByIdAsync(Guid id); 
        Task<IEnumerable<Gasto>> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<Gasto>> GetByMiembroPagadorAsync(Guid idMiembroPagador);
        Task DeleteAsync(Gasto gasto);
        Task<(IEnumerable<Gasto> Items, int TotalCount)> GetPaginatedByGrupoAsync(
        Guid idGrupo,
        int pageNumber,
        int pageSize,
        string? sortOrder = null,
        string? searchTerm = null);
    }
}