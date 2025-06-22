using DividiFacil.Data.Repositories.Implementations;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Services.Implementations;
using DividiFacil.Services.Interfaces;

namespace DividiFacil.API.Extensions
{
    public static class ServiceExtensions
    {
        public static void RegisterRepositories(this IServiceCollection services)
        {
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IGrupoRepository, GrupoRepository>();
            services.AddScoped<IGastoRepository, GastoRepository>();
            services.AddScoped<ICajaComunRepository, CajaComunRepository>();
            services.AddScoped<INotificacionRepository, NotificacionRepository>();
        }

        public static void RegisterServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<IGrupoService, GrupoService>();
            services.AddScoped<IGastoService, GastoService>();
            services.AddScoped<ICajaComunService, CajaComunService>();
        }
    }
}