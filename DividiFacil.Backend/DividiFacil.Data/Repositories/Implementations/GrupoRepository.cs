using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class GrupoRepository : RepositoryBase<Grupo>, IGrupoRepository
    {
        public GrupoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Grupo>> GetByUsuarioAsync(Guid idUsuario)
        {
            return await _context.MiembrosGrupo
                .Where(m => m.IdUsuario == idUsuario)
                .Select(m => m.Grupo!)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Grupo?> GetByCodigoAccesoAsync(string codigoAcceso)
        {
            return await _context.Grupos
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.CodigoAcceso == codigoAcceso);
        }

        public async Task<bool> EsMiembroAsync(Guid idUsuario, Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .AnyAsync(m => m.IdUsuario == idUsuario && m.IdGrupo == idGrupo);
        }

        public async Task<bool> EsAdminAsync(Guid idUsuario, Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .AnyAsync(m => m.IdUsuario == idUsuario &&
                               m.IdGrupo == idGrupo &&
                               m.Rol == "Admin");
        }
    }
}