using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Decorators
{
    public class CachedUsuarioRepository : IUsuarioRepository
    {
        private readonly IUsuarioRepository _inner;
        private readonly IMemoryCache _cache;

        public CachedUsuarioRepository(IUsuarioRepository inner, IMemoryCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        public async Task<Usuario?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"Usuario_Id_{id}";
            if (_cache.TryGetValue(cacheKey, out Usuario? usuario))
                return usuario;

            usuario = await _inner.GetByIdAsync(id);
            if (usuario != null)
                _cache.Set(cacheKey, usuario, TimeSpan.FromMinutes(10));
            return usuario;
        }

        public async Task<Usuario?> GetByEmailAsync(string email)
        {
            string normalizedEmail = email.ToLowerInvariant();
            string cacheKey = $"Usuario_Email_{normalizedEmail}";
            if (_cache.TryGetValue(cacheKey, out Usuario? usuario))
                return usuario;

            usuario = await _inner.GetByEmailAsync(email);
            if (usuario != null)
                _cache.Set(cacheKey, usuario, TimeSpan.FromMinutes(10));
            return usuario;
        }

        public async Task<IEnumerable<Usuario>> GetAllAsync()
            => await _inner.GetAllAsync();

        public async Task CreateAsync(Usuario entity)
            => await _inner.CreateAsync(entity);

        public async Task UpdateAsync(Usuario entity)
        {
            await _inner.UpdateAsync(entity);
            // Invalidar el caché relevante
            _cache.Remove($"Usuario_Id_{entity.IdUsuario}");
            _cache.Remove($"Usuario_Email_{entity.Email.ToLowerInvariant()}");
        }

        public async Task DeleteAsync(Guid id)
        {
            await _inner.DeleteAsync(id);
            _cache.Remove($"Usuario_Id_{id}");
            // No podemos invalidar por email si no lo tenemos aquí
        }

        public async Task SaveAsync()
            => await _inner.SaveAsync();

        public async Task<IEnumerable<Usuario>> GetByGrupoAsync(Guid idGrupo)
            => await _inner.GetByGrupoAsync(idGrupo);

        public async Task<bool> ExisteUsuarioAsync(string email)
            => await _inner.ExisteUsuarioAsync(email);
    }
}