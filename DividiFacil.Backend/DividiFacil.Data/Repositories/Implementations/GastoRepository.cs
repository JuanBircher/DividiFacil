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

        public async Task<(IEnumerable<Gasto> Items, int TotalCount)> GetPaginatedByGrupoAsync(
    Guid idGrupo,
    int pageNumber,
    int pageSize,
    string? sortOrder = null,
    string? searchTerm = null)
        {
            // Construir la consulta base - usar IQueryable para poder aplicar filtros antes de ejecutar
            var query = _context.Gastos
                .Include(g => g.MiembroPagador)
                .ThenInclude(m => m.Usuario)
                .Where(g => g.IdGrupo == idGrupo)
                .AsQueryable();

            // Aplicar filtro por término de búsqueda
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(g =>
                    g.Descripcion.ToLower().Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                    (g.Categoria != null && g.Categoria.ToLower().Contains(searchTerm, StringComparison.OrdinalIgnoreCase)));
            }

            // Obtener el conteo total antes de aplicar paginación
            int totalCount = await query.CountAsync();

            // Aplicar ordenamiento
            query = sortOrder?.ToLower() switch
            {
                "fecha_asc" => query.OrderBy(g => g.FechaCreacion),
                "fecha_desc" => query.OrderByDescending(g => g.FechaCreacion),
                "monto_asc" => query.OrderBy(g => g.Monto),
                "monto_desc" => query.OrderByDescending(g => g.Monto),
                "descripcion" => query.OrderBy(g => g.Descripcion),
                _ => query.OrderByDescending(g => g.FechaCreacion) // Orden predeterminado
            };

            // Aplicar paginación y ejecutar la consulta
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Retornar la tupla con los items y el conteo total
            return (items, totalCount);
        }
    }
}