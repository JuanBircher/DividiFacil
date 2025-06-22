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

        // Este método incluye los detalles de navegación
        public async Task<Pago?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Include(p => p.Grupo)
                .FirstOrDefaultAsync(p => p.IdPago == id);
        }

        // Implementamos el método para eliminar una entidad directamente
        public async Task DeleteAsync(Pago pago)
        {
            _context.Pagos.Remove(pago);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador, Guid idGrupo)
        {
            return await _context.Pagos
                .Where(p => p.IdPagador == idPagador && p.IdGrupo == idGrupo)
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor, Guid idGrupo)
        {
            return await _context.Pagos
                .Where(p => p.IdReceptor == idReceptor && p.IdGrupo == idGrupo)
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador)
        {
            return await _context.Pagos
                .Include(p => p.Receptor)
                .Include(p => p.Grupo)
                .Where(p => p.IdPagador == idPagador)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Grupo)
                .Where(p => p.IdReceptor == idReceptor)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Where(p => p.IdGrupo == idGrupo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetPagosPendientesByPagadorAsync(Guid idPagador, Guid idGrupo)
        {
            return await _context.Pagos
                .Where(p => p.IdPagador == idPagador &&
                        p.IdGrupo == idGrupo &&
                        p.Estado == "Pendiente")
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetPagosPendientesByReceptorAsync(Guid idReceptor, Guid idGrupo)
        {
            return await _context.Pagos
                .Where(p => p.IdReceptor == idReceptor &&
                        p.IdGrupo == idGrupo &&
                        p.Estado == "Pendiente")
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}