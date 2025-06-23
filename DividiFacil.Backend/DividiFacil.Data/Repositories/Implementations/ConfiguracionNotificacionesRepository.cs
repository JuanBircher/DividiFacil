using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class ConfiguracionNotificacionesRepository : RepositoryBase<ConfiguracionNotificaciones>, IConfiguracionNotificacionesRepository
    {
        public ConfiguracionNotificacionesRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ConfiguracionNotificaciones?> GetByUsuarioAsync(Guid idUsuario)
        {
            return await _context.ConfiguracionesNotificaciones
                .FirstOrDefaultAsync(c => c.IdUsuario == idUsuario);
        }
    }
}