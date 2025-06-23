using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Data.Repositories.Implementations
{
    public class RecordatorioRepository : RepositoryBase<Recordatorio>, IRecordatorioRepository
    {
        public RecordatorioRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Recordatorio>> GetByUsuarioAsync(Guid idUsuario)
        {
            return await _context.Recordatorios
                .Where(r => r.IdUsuario == idUsuario)
                .OrderByDescending(r => r.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Recordatorio>> GetPendientesByUsuarioAsync(Guid idUsuario)
        {
            var hoy = DateTime.UtcNow.Date;
            return await _context.Recordatorios
                .Where(r => r.IdUsuario == idUsuario &&
                           !r.Completado &&
                           r.Estado == "Pendiente" &&
                           r.FechaRecordatorio.Date <= hoy.AddDays(7))
                .OrderBy(r => r.FechaRecordatorio)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Recordatorio>> GetByGrupoAsync(Guid idGrupo)
        {
            return await _context.Recordatorios
                .Where(r => r.IdGrupo == idGrupo)
                .OrderByDescending(r => r.FechaCreacion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Recordatorio>> GetVencidosNoCompletadosAsync()
        {
            var hoy = DateTime.UtcNow;
            return await _context.Recordatorios
                .Where(r => !r.Completado &&
                            r.Estado == "Pendiente" &&
                            r.FechaRecordatorio <= hoy)
                .ToListAsync();
        }

        public async Task<bool> MarcarComoCompletadoAsync(Guid idRecordatorio)
        {
            var recordatorio = await _context.Recordatorios.FindAsync(idRecordatorio);
            if (recordatorio == null)
                return false;

            recordatorio.Completado = true;
            recordatorio.Estado = "Enviado";
            return true;
        }
    }
}