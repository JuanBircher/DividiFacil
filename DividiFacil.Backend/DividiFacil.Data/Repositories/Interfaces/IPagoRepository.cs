using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IPagoRepository : IRepositoryBase<Pago>
    {
        Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador);
        Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor);
        Task<IEnumerable<Pago>> GetByGrupoAsync(Guid idGrupo);
    }
}