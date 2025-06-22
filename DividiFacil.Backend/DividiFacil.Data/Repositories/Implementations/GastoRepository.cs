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

        public async Task<IEnumerable<Gasto>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Gastos
                .Include(g => g.Pagador)
                .Include(g => g.Detalles)
                .Where(g => g.IdGrupo == idGrupo)
                .OrderByDescending(g => g.Fecha)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Gasto>> GetRecientesByUsuarioAsync(Guid idUsuario, int cantidad)
        {
            // Obtenemos los grupos a los que pertenece el usuario
            var gruposIds = await _context.MiembrosGrupo
                .Where(m => m.IdUsuario == idUsuario)
                .Select(m => m.IdGrupo)
                .ToListAsync();

            // Obtenemos los gastos recientes de esos grupos
            return await _context.Gastos
                .Include(g => g.Pagador)
                .Include(g => g.Grupo)
                .Where(g => gruposIds.Contains(g.IdGrupo))
                .OrderByDescending(g => g.Fecha)
                .Take(cantidad)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<DetalleGasto>> GetDetallesByGastoAsync(Guid idGasto)
        {
            return await _context.DetallesGasto
                .Include(d => d.Usuario)
                .Where(d => d.IdGasto == idGasto)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<decimal> GetTotalGastosGrupoAsync(Guid idGrupo)
        {
            return await _context.Gastos
                .Where(g => g.IdGrupo == idGrupo)
                .SumAsync(g => g.Monto);
        }
    }
}