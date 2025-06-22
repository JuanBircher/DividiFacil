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

        public async Task<IEnumerable<Pago>> GetByPagadorAsync(Guid idPagador)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Include(p => p.Grupo)
                .Where(p => p.IdPagador == idPagador)
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByReceptorAsync(Guid idReceptor)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Include(p => p.Grupo)
                .Where(p => p.IdReceptor == idReceptor)
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Pagos
                .Include(p => p.Pagador)
                .Include(p => p.Receptor)
                .Include(p => p.Grupo)
                .Where(p => p.IdGrupo == idGrupo)
                .OrderByDescending(p => p.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}