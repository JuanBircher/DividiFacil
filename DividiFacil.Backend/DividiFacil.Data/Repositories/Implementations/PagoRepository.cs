using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class PagoRepository : RepositoryBase<Pago>, IPagoRepository
    {
        public PagoRepository(ApplicationDbContext context) : base(context)
        {
        }

        // Implementación del método faltante
        public async Task DeleteAsync(Pago pago)
        {
            _context.Pagos.Remove(pago);
            await _context.SaveChangesAsync();
        }

        // Aquí irían los demás métodos de la interfaz IPagoRepository
        // Por ejemplo:
        public async Task<Pago> GetByIdAsync(Guid id)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .FirstOrDefaultAsync(p => p.IdPago == id);
        }

        public async Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador)
        {
            return await _context.Pagos
                .Include(p => p.Receptor)
                .Where(p => p.IdPagador == idPagador)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Where(p => p.IdReceptor == idReceptor)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Where(p => p.IdGrupo == idGrupo)
                .ToListAsync();
        }
    }
}