using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class UsuarioRepository : RepositoryBase<Usuario>, IUsuarioRepository
    {
        public UsuarioRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            return await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Usuario>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.MiembrosGrupo
                .Where(m => m.IdGrupo == idGrupo)
                .Select(m => m.Usuario!)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> ExisteUsuarioAsync(string email)
        {
            return await _context.Usuarios
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }
    }
}