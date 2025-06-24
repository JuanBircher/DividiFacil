using DividiFacil.Domain.DTOs.Base;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace DividiFacil.API.Middleware
{
    public class PaginationMiddleware
    {
        private readonly RequestDelegate _next;

        public PaginationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Query.ContainsKey("pageSize") &&
                !context.Request.Query.ContainsKey("page"))
            {
                // Si no se proporcionan parámetros de paginación, establecer valores predeterminados
                var queryString = context.Request.QueryString.Value ?? "";
                var separator = queryString.Contains('?') ? '&' : '?';

                context.Request.QueryString = new QueryString(
                    $"{queryString}{separator}page=1&pageSize=10");
            }

            await _next(context);
        }
    }
}
