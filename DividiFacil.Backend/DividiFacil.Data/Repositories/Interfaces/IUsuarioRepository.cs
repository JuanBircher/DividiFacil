using DividiFacil.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IUsuarioRepository : IRepositoryBase<Usuario>
    {
        Task<Usuario?> GetByEmailAsync(string email);
        Task<IEnumerable<Usuario>> GetByGrupoAsync(Guid idGrupo);
        Task<bool> ExisteUsuarioAsync(string email);
    }
}