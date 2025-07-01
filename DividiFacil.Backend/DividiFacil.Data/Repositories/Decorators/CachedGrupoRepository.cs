using DividiFacil.Data.Repositories.Implementations;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Decorators
{
    public class CachedGrupoRepository : IGrupoRepository
    {
        private readonly IGrupoRepository _inner;
        private readonly IMemoryCache _cache;
        private readonly IGrupoRepository _grupoRepository;

        public CachedGrupoRepository(IGrupoRepository inner, IMemoryCache cache)
        {
            _inner = inner;
            _cache = cache;
        }

        public async Task<Grupo?> GetByIdAsync(Guid id)
        {
            string cacheKey = $"Grupo_Id_{id}";
            if (_cache.TryGetValue(cacheKey, out Grupo? grupo))
                return grupo;

            grupo = await _inner.GetByIdAsync(id);
            if (grupo != null)
                _cache.Set(cacheKey, grupo, TimeSpan.FromMinutes(10));
            return grupo;
        }

        public async Task<Grupo?> GetByCodigoAccesoAsync(string codigoAcceso)
        {
            string cacheKey = $"Grupo_CodigoAcceso_{codigoAcceso}";
            if (_cache.TryGetValue(cacheKey, out Grupo? grupo))
                return grupo;

            grupo = await _inner.GetByCodigoAccesoAsync(codigoAcceso);
            if (grupo != null)
                _cache.Set(cacheKey, grupo, TimeSpan.FromMinutes(10));
            return grupo;
        }

        // Métodos delegados sin caché
        public async Task<IEnumerable<Grupo>> GetAllAsync()
            => await _inner.GetAllAsync();

        public async Task CreateAsync(Grupo entity)
            => await _inner.CreateAsync(entity);

        public async Task UpdateAsync(Grupo entity)
        {
            await _inner.UpdateAsync(entity);
            _cache.Remove($"Grupo_Id_{entity.IdGrupo}");
            // El código de acceso podría cambiar, pero como no se provee aquí,
            // la invalidación de ese caché se realiza solo cuando se usa el método correspondiente.
        }

        public async Task DeleteAsync(Guid id)
        {
            await _inner.DeleteAsync(id);
            _cache.Remove($"Grupo_Id_{id}");
        }

        public Task<bool> TieneGastosPendientesAsync(Guid idGrupo)
        {
            // TODO: Implementar lógica real o caché
            return _grupoRepository.TieneGastosPendientesAsync(idGrupo);
        }

        public async Task SaveAsync()
            => await _inner.SaveAsync();

        public async Task<IEnumerable<Grupo>> GetByUsuarioAsync(Guid idUsuario)
            => await _inner.GetByUsuarioAsync(idUsuario);

        public async Task<bool> EsMiembroAsync(Guid idUsuario, Guid idGrupo)
            => await _inner.EsMiembroAsync(idUsuario, idGrupo);

        public async Task<bool> EsAdminAsync(Guid idUsuario, Guid idGrupo)
            => await _inner.EsAdminAsync(idUsuario, idGrupo);
    }

}