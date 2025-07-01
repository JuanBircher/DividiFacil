using DividiFacil.API.Jobs;
using DividiFacil.Data.Repositories.Implementations;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Services.Implementations;
using DividiFacil.Services.Interfaces;
using FluentValidation;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;

namespace DividiFacil.API.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection RegisterRepositories(this IServiceCollection services)
        {
            // Eliminar registros duplicados y consolidar todos los repositorios aquí
            services.AddScoped<IUsuarioRepository, UsuarioRepository>();
            services.AddScoped<IGrupoRepository, GrupoRepository>();
            services.AddScoped<IMiembroGrupoRepository, MiembroGrupoRepository>();
            services.AddScoped<IGastoRepository, GastoRepository>();
            services.AddScoped<IDetalleGastoRepository, DetalleGastoRepository>();
            services.AddScoped<IPagoRepository, PagoRepository>();
            services.AddScoped<ICajaComunRepository, CajaComunRepository>();
            services.AddScoped<INotificacionRepository, NotificacionRepository>();
            services.AddScoped<IConfiguracionNotificacionesRepository, ConfiguracionNotificacionesRepository>();
            services.AddScoped<IRecordatorioRepository, RecordatorioRepository>();

            return services;
        }

        public static IServiceCollection RegisterServices(this IServiceCollection services)
        {
            // Eliminar registros duplicados y consolidar todos los servicios aquí
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUsuarioService, UsuarioService>();
            services.AddScoped<IGrupoService, GrupoService>(); // ✅ Ya debería incluir todas las dependencias
            services.AddScoped<IGastoService, GastoService>();
            services.AddScoped<IBalanceService, BalanceService>();
            services.AddScoped<IPagoService, PagoService>();
            services.AddScoped<ICajaComunService, CajaComunService>();
            services.AddScoped<INotificacionService, NotificacionService>();
            services.AddScoped<IRecordatorioService, RecordatorioService>();

            // Registrar jobs
            services.AddHostedService<ProcesadorRecordatoriosJob>();

            return services;
        }

        public static IServiceCollection ConfigureSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "DividiFacil API",
                    Version = "v1",
                    Description = "API para gestión de gastos compartidos"
                });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header usando el esquema Bearer.",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            return services;
        }

        public static IServiceCollection ConfigureJsonOptions(this IServiceCollection services)
        {
            // Configurar JsonSerializerOptions para manejar referencias circulares
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                });

            return services;
        }

        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<UsuarioLoginDtoValidator>();
            return services;
        }
    }
}