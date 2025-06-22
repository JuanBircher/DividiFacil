using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IDetalleGastoRepository : IRepositoryBase<DetalleGasto>
    {
        Task<IEnumerable<DetalleGasto>> GetByGastoAsync(Guid idGasto);
        Task<IEnumerable<DetalleGasto>> GetByMiembroDeudorAsync(Guid idMiembroDeudor);
        Task<DetalleGasto> GetByIdDetalleAsync(Guid idDetalle);
        Task<bool> MarcarComoPagadoAsync(Guid idDetalle);
    }
}