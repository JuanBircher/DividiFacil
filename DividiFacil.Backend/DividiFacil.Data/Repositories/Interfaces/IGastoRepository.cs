using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IGastoRepository : IRepositoryBase<Gasto>
    {
        Task<IEnumerable<Gasto>> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<Gasto>> GetRecientesByUsuarioAsync(Guid idUsuario, int cantidad);
        Task<IEnumerable<DetalleGasto>> GetDetallesByGastoAsync(Guid idGasto);
        Task<decimal> GetTotalGastosGrupoAsync(Guid idGrupo);
    }
}