using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Interfaces
{
    public interface IRepositoryBase<T> where T : class
    {
        IQueryable<T> GetAll();
        IQueryable<T> GetByCondition(Expression<Func<T, bool>> expression);
        Task<T?> GetByIdAsync(Guid id);
        Task CreateAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task SaveAsync();
    }
}