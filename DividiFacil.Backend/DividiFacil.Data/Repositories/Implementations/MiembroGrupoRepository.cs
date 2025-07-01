using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class MiembroGrupoRepository : RepositoryBase<MiembroGrupo>, IMiembroGrupoRepository
    {
        public MiembroGrupoRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async new Task<MiembroGrupo?> GetByIdAsync(Guid idMiembro)
        {
            return await _context.MiembrosGrupo
                .Include(m => m.Usuario)
                .FirstOrDefaultAsync(m => m.IdMiembro == idMiembro);
        }

        public async Task<MiembroGrupo> GetByUsuarioYGrupoAsync(Guid idUsuario, Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .Include(m => m.Usuario)
                .Include(m => m.Grupo)
                .FirstOrDefaultAsync(m => m.IdUsuario == idUsuario && m.IdGrupo == idGrupo);
        }

        public async Task<IEnumerable<MiembroGrupo>> GetMiembrosByGrupoAsync(Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .Include(m => m.Usuario)
                .Where(m => m.IdGrupo == idGrupo)
                .ToListAsync();
        }

        public async Task<IEnumerable<MiembroGrupo>> GetGruposByUsuarioAsync(Guid idUsuario)
        {
            return await _context.MiembrosGrupo
                .Include(m => m.Grupo)
                .Where(m => m.IdUsuario == idUsuario)
                .ToListAsync();
        }

        public async Task<bool> EsMiembroAsync(Guid idUsuario, Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .AnyAsync(m => m.IdUsuario == idUsuario && m.IdGrupo == idGrupo);
        }

        public async Task<bool> EsAdminAsync(Guid idUsuario, Guid idGrupo)
        {
            var miembro = await _context.MiembrosGrupo
                .FirstOrDefaultAsync(m => m.IdUsuario == idUsuario && m.IdGrupo == idGrupo);

            return miembro != null && miembro.Rol == "Admin";
        }

        public Task<bool> TieneGastosPendientesAsync(Guid idGrupo, Guid idUsuario)
        {
            // TODO: Implementar lógica real
            return Task.FromResult(false);
        }
    }
}