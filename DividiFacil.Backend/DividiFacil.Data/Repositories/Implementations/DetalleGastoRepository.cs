using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class DetalleGastoRepository : RepositoryBase<DetalleGasto>, IDetalleGastoRepository
    {
        public DetalleGastoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<DetalleGasto>> GetByGastoAsync(Guid idGasto)
        {
            return await _context.DetallesGasto
                .Include(dg => dg.MiembroDeudor)
                .Where(dg => dg.IdGasto == idGasto)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<DetalleGasto>> GetByMiembroDeudorAsync(Guid idMiembroDeudor)
        {
            return await _context.DetallesGasto
                .Include(dg => dg.Gasto)
                .Where(dg => dg.IdMiembroDeudor == idMiembroDeudor)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<DetalleGasto> GetByIdDetalleAsync(Guid idDetalle)
        {
            return await _context.DetallesGasto
                .FirstOrDefaultAsync(dg => dg.IdDetalleGasto == idDetalle);
        }

        public async Task<bool> MarcarComoPagadoAsync(Guid idDetalle)
        {
            var detalle = await GetByIdDetalleAsync(idDetalle);
            if (detalle == null)
                return false;

            detalle.Pagado = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}