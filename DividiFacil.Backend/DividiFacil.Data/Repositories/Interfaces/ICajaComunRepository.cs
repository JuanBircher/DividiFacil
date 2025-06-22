using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface ICajaComunRepository : IRepositoryBase<CajaComun>
    {
        Task<CajaComun?> GetByGrupoAsync(Guid idGrupo);
        Task<IEnumerable<MovimientoCaja>> GetMovimientosByCajaAsync(Guid idCaja);
    }
}