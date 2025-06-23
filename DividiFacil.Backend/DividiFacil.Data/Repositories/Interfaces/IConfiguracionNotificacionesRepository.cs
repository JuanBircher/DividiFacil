using DividiFacil.Domain.Models;
using System;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IConfiguracionNotificacionesRepository : IRepositoryBase<ConfiguracionNotificaciones>
    {
        Task<ConfiguracionNotificaciones?> GetByUsuarioAsync(Guid idUsuario);
    }
}