using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class NotificacionRepository : RepositoryBase<Notificacion>, INotificacionRepository
    {
        public NotificacionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Notificacion>> GetPendientesByUsuarioAsync(Guid idUsuario)
        {
            return await _context.Notificaciones
                // Eliminamos el Include que causa error
                .Where(n => n.IdUsuario == idUsuario && n.Estado == "Pendiente")
                .OrderByDescending(n => n.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Notificacion>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Notificaciones
                // Eliminamos el Include que causa error
                .Where(n => n.IdGrupo == idGrupo)
                .OrderByDescending(n => n.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Notificacion>> GetAllPendientesAsync()
        {
            return await _context.Notificaciones
                .Where(n => n.Estado == "Pendiente")
                .Include(n => n.Usuario)
                .Include(n => n.Grupo)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}