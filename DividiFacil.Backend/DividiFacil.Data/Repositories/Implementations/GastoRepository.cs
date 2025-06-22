using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class GastoRepository : RepositoryBase<Gasto>, IGastoRepository
    {
        public GastoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async new Task<Gasto?> GetByIdAsync(Guid id)
        {
            return await _context.Gastos
                .Include(g => g.Grupo)
                .Include(g => g.MiembroPagador)
                .FirstOrDefaultAsync(g => g.IdGasto == id);
        }

        public async Task<IEnumerable<Gasto>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Gastos
                .Include(g => g.MiembroPagador)
                .Where(g => g.IdGrupo == idGrupo)
                .OrderByDescending(g => g.FechaCreacion)
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetByMiembroPagadorAsync(Guid idMiembroPagador)
        {
            return await _context.Gastos
                .Include(g => g.Grupo)
                .Where(g => g.IdMiembroPagador == idMiembroPagador)
                .OrderByDescending(g => g.FechaCreacion)
                .ToListAsync();
        }

        public async Task DeleteAsync(Gasto gasto)
        {
            _context.Gastos.Remove(gasto);
            await _context.SaveChangesAsync();
        }
    }
}