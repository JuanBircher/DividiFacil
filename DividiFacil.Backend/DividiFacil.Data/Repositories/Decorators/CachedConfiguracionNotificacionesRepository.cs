using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Decorators
{
    public class CachedConfiguracionNotificacionesRepository : IConfiguracionNotificacionesRepository
    {
        private readonly IConfiguracionNotificacionesRepository _inner;
        private readonly IMemoryCache _cache;

        public CachedConfiguracionNotificacionesRepository(IConfiguracionNotificacionesRepository inner, IMemoryCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        public async Task<ConfiguracionNotificaciones?> GetByUsuarioAsync(Guid idUsuario)
        {
            string cacheKey = $"ConfigNotif_Usuario_{idUsuario}";
            if (_cache.TryGetValue(cacheKey, out ConfiguracionNotificaciones? config))
                return config;

            config = await _inner.GetByUsuarioAsync(idUsuario);
            if (config != null)
                _cache.Set(cacheKey, config, TimeSpan.FromMinutes(10));
            return config;
        }

        // Métodos delegados sin caché
        public async Task<IEnumerable<ConfiguracionNotificaciones>> GetAllAsync()
            => await _inner.GetAllAsync();

        public async Task<ConfiguracionNotificaciones?> GetByIdAsync(Guid id)
            => await _inner.GetByIdAsync(id);

        public async Task CreateAsync(ConfiguracionNotificaciones entity)
            => await _inner.CreateAsync(entity);

        public async Task UpdateAsync(ConfiguracionNotificaciones entity)
        {
            await _inner.UpdateAsync(entity);
            _cache.Remove($"ConfigNotif_Usuario_{entity.IdUsuario}");
        }

        public async Task DeleteAsync(Guid id)
        {
            await _inner.DeleteAsync(id);
            _cache.Remove($"ConfigNotif_Usuario_{id}");
        }

        public async Task SaveAsync()
            => await _inner.SaveAsync();
    }
}