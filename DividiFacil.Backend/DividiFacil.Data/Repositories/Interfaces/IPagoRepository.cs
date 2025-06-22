using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IPagoRepository : IRepositoryBase<Pago>
    {
        Task<Pago?> GetByIdWithDetailsAsync(Guid id);
        Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador, Guid idGrupo);
        Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor, Guid idGrupo);
        Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador);
        Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor);
        Task<IEnumerable<Pago>> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<Pago>> GetPagosPendientesByPagadorAsync(Guid idPagador, Guid idGrupo);
        Task<IEnumerable<Pago>> GetPagosPendientesByReceptorAsync(Guid idReceptor, Guid idGrupo);
        Task DeleteAsync(Pago pago); // Método específico para eliminar una entidad directamente
    }
}