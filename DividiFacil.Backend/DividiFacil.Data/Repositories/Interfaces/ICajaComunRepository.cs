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
        Task<IEnumerable<MovimientoCaja>> GetMovimientosAsync(Guid idCaja);
        Task<MovimientoCaja?> GetMovimientoByIdAsync(Guid idMovimiento);
        Task RegistrarMovimientoAsync(MovimientoCaja movimiento);
        Task EliminarMovimientoAsync(Guid idMovimiento);
    }
}