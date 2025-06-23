using DividiFacil.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DividiFacil.API.Jobs
{
    public class ProcesadorRecordatoriosJob : BackgroundService
    {
        private readonly ILogger<ProcesadorRecordatoriosJob> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ProcesadorRecordatoriosJob(
            ILogger<ProcesadorRecordatoriosJob> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Servicio de procesamiento de recordatorios iniciado");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcesarRecordatoriosAsync();

                    // Esperar 24 horas antes de la próxima ejecución
                    await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Detención normal del servicio, no loguear error
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error no controlado en el servicio de procesamiento de recordatorios");

                    // Esperar 5 minutos antes de reintentar en caso de error
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }
        }

        private async Task ProcesarRecordatoriosAsync()
        {
            _logger.LogInformation("Procesando recordatorios y notificaciones pendientes...");

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var recordatorioService = scope.ServiceProvider.GetRequiredService<IRecordatorioService>();
                var notificacionService = scope.ServiceProvider.GetRequiredService<INotificacionService>();

                // Procesar recordatorios vencidos
                await recordatorioService.ProcesarRecordatoriosVencidosAsync();

                // Enviar notificaciones pendientes
                await notificacionService.EnviarNotificacionesPendientesAsync();

                _logger.LogInformation("Procesamiento de recordatorios y notificaciones completado");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar recordatorios y notificaciones");
            }
        }
    }
}