using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class CajaComunRepository : RepositoryBase<CajaComun>, ICajaComunRepository
    {
        public CajaComunRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<CajaComun?> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.CajaComun
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.IdGrupo == idGrupo);
        }

        public async Task<IEnumerable<MovimientoCaja>> GetMovimientosByCajaAsync(Guid idCaja)
        {
            return await _context.MovimientosCaja
                .Include(m => m.Usuario)
                .Where(m => m.IdCaja == idCaja)
                .OrderByDescending(m => m.Fecha)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}