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
                .Include(c => c.Grupo)
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

        // ✅ CORREGIDO: Alias de GetMovimientosByCajaAsync
        public async Task<IEnumerable<MovimientoCaja>> GetMovimientosAsync(Guid idCaja)
        {
            return await GetMovimientosByCajaAsync(idCaja);
        }

        // ✅ CORREGIDO: Sin incluir CajaComun que no existe en la navegación
        public async Task<MovimientoCaja?> GetMovimientoByIdAsync(Guid idMovimiento)
        {
            return await _context.MovimientosCaja
                .Include(m => m.Usuario)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.IdMovimiento == idMovimiento);
        }

        // ✅ IMPLEMENTACIÓN PARA RegistrarMovimientoAsync
        public async Task RegistrarMovimientoAsync(MovimientoCaja movimiento)
        {
            await _context.MovimientosCaja.AddAsync(movimiento);
        }

        // ✅ CORREGIDO: Usar el contexto correctamente
        public async Task EliminarMovimientoAsync(Guid idMovimiento)
        {
            var movimiento = await _context.MovimientosCaja
                .FirstOrDefaultAsync(m => m.IdMovimiento == idMovimiento);
            
            if (movimiento != null)
            {
                _context.MovimientosCaja.Remove(movimiento);
            }
        }
    }
}