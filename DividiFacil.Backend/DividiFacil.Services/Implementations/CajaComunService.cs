using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.CajaComun;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class CajaComunService : ICajaComunService
    {
        private readonly ICajaComunRepository _cajaComunRepository;
        private readonly IGrupoRepository _grupoRepository;

        public CajaComunService(
            ICajaComunRepository cajaComunRepository,
            IGrupoRepository grupoRepository)
        {
            _cajaComunRepository = cajaComunRepository;
            _grupoRepository = grupoRepository;
        }

        public async Task<ResponseDto<CajaComunDto>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<CajaComunDto>();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idSolicitante))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Verificar que el usuario es miembro del grupo
            bool esMiembro = await _grupoRepository.EsMiembroAsync(idSolicitante, idGrupo);
            if (!esMiembro)
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para ver esta caja común";
                return response;
            }

            var caja = await _cajaComunRepository.GetByGrupoAsync(idGrupo);
            if (caja == null)
            {
                response.Exito = false;
                response.Mensaje = "Este grupo no tiene caja común";
                return response;
            }

            response.Data = new CajaComunDto
            {
                IdCaja = caja.IdCaja,
                IdGrupo = caja.IdGrupo,
                NombreGrupo = caja.Grupo?.NombreGrupo ?? "Grupo",
                Saldo = caja.Saldo,
                FechaCreacion = caja.FechaCreacion,
                TotalIngresos = 0, // Debería calcularse en implementación real
                TotalEgresos = 0 // Debería calcularse en implementación real
            };

            return response;
        }

        public async Task<ResponseDto<CajaComunDto>> CrearCajaComunAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            var response = new ResponseDto<CajaComunDto>();

            if (!Guid.TryParse(idUsuarioAdmin, out var idAdmin))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Verificar que el grupo existe
            var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
            if (grupo == null)
            {
                response.Exito = false;
                response.Mensaje = "Grupo no encontrado";
                return response;
            }

            // Verificar que el usuario es administrador
            bool esAdmin = await _grupoRepository.EsAdminAsync(idAdmin, idGrupo);
            if (!esAdmin)
            {
                response.Exito = false;
                response.Mensaje = "Solo los administradores pueden crear cajas comunes";
                return response;
            }

            // Verificar si ya existe una caja común
            var cajaExistente = await _cajaComunRepository.GetByGrupoAsync(idGrupo);
            if (cajaExistente != null)
            {
                response.Exito = false;
                response.Mensaje = "Este grupo ya tiene una caja común";
                return response;
            }

            // Crear caja común
            var caja = new CajaComun
            {
                IdCaja = Guid.NewGuid(),
                IdGrupo = idGrupo,
                Saldo = 0,
                FechaCreacion = DateTime.UtcNow
            };

            await _cajaComunRepository.CreateAsync(caja);
            await _cajaComunRepository.SaveAsync();

            response.Data = new CajaComunDto
            {
                IdCaja = caja.IdCaja,
                IdGrupo = caja.IdGrupo,
                NombreGrupo = grupo.NombreGrupo,
                Saldo = caja.Saldo,
                FechaCreacion = caja.FechaCreacion,
                TotalIngresos = 0,
                TotalEgresos = 0
            };

            return response;
        }

        // Implementaciones mínimas para los demás métodos
        public Task<ResponseDto<IEnumerable<MovimientoCajaDto>>> GetMovimientosAsync(Guid idCaja, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<MovimientoCajaDto>>
            {
                Exito = true,
                Data = new List<MovimientoCajaDto>()
            });
        }

        public Task<ResponseDto<MovimientoCajaDto>> RegistrarMovimientoAsync(MovimientoCajaCreacionDto movimientoDto, string idUsuarioCreador)
        {
            return Task.FromResult(new ResponseDto<MovimientoCajaDto>
            {
                Exito = true,
                Data = new MovimientoCajaDto()
            });
        }

        public Task<ResponseDto> EliminarMovimientoAsync(Guid idMovimiento, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }
    }
}