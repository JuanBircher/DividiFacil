using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Gasto;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class GastoService : IGastoService
    {
        private readonly IGastoRepository _gastoRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;

        public GastoService(
            IGastoRepository gastoRepository,
            IGrupoRepository grupoRepository,
            IUsuarioRepository usuarioRepository)
        {
            _gastoRepository = gastoRepository;
            _grupoRepository = grupoRepository;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<ResponseDto<GastoDto>> CrearGastoAsync(GastoCreacionDto gastoDto, string idUsuarioCreador)
        {
            var response = new ResponseDto<GastoDto>();

            if (!Guid.TryParse(idUsuarioCreador, out var idCreador))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Verificar que el grupo existe
            var grupo = await _grupoRepository.GetByIdAsync(gastoDto.IdGrupo);
            if (grupo == null)
            {
                response.Exito = false;
                response.Mensaje = "Grupo no encontrado";
                return response;
            }

            // Verificar que el usuario es miembro del grupo
            bool esMiembro = await _grupoRepository.EsMiembroAsync(idCreador, gastoDto.IdGrupo);
            if (!esMiembro)
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para añadir gastos a este grupo";
                return response;
            }

            // Crear el gasto
            var gasto = new Gasto
            {
                IdGasto = Guid.NewGuid(),
                IdGrupo = gastoDto.IdGrupo,
                IdPagador = idCreador,
                Monto = gastoDto.Monto,
                Concepto = gastoDto.Concepto,
                Fecha = gastoDto.Fecha ?? DateTime.UtcNow,
                TipoGasto = gastoDto.TipoGasto,
                FechaVencimiento = gastoDto.FechaVencimiento
            };

            await _gastoRepository.CreateAsync(gasto);

            // Crear los detalles del gasto
            foreach (var detalle in gastoDto.Detalles)
            {
                var detalleGasto = new DetalleGasto
                {
                    IdDetalle = Guid.NewGuid(),
                    IdGasto = gasto.IdGasto,
                    IdUsuario = detalle.IdUsuario,
                    MontoDebe = detalle.MontoDebe,
                    Estado = "Pendiente"
                };

                // En una implementación real, se guardarían los detalles
            }

            await _gastoRepository.SaveAsync();

            // Devolver el gasto creado
            response.Data = new GastoDto
            {
                IdGasto = gasto.IdGasto,
                IdGrupo = gasto.IdGrupo,
                NombreGrupo = grupo.NombreGrupo,
                IdPagador = gasto.IdPagador,
                NombrePagador = "Usuario", // En implementación real obtenerlo del usuario
                Monto = gasto.Monto,
                Concepto = gasto.Concepto,
                Fecha = gasto.Fecha,
                TipoGasto = gasto.TipoGasto,
                FechaVencimiento = gasto.FechaVencimiento,
                ComprobantePath = gasto.ComprobantePath,
                // En implementación real agregar los detalles
            };

            return response;
        }

        // Implementaciones mínimas para los demás métodos
        public Task<ResponseDto<GastoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto<GastoDto>
            {
                Exito = true,
                Data = new GastoDto()
            });
        }

        public Task<ResponseDto<IEnumerable<GastoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<GastoDto>>
            {
                Exito = true,
                Data = new List<GastoDto>()
            });
        }

        public Task<ResponseDto<IEnumerable<GastoDto>>> GetRecientesAsync(string idUsuario, int cantidad)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<GastoDto>>
            {
                Exito = true,
                Data = new List<GastoDto>()
            });
        }

        public Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<SaldoUsuarioDto>>
            {
                Exito = true,
                Data = new List<SaldoUsuarioDto>()
            });
        }

        public Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosUsuarioAsync(string idUsuario)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<SaldoUsuarioDto>>
            {
                Exito = true,
                Data = new List<SaldoUsuarioDto>()
            });
        }

        public Task<ResponseDto> MarcarComoPagadoAsync(Guid idGasto, Guid idDetalle, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }

        public Task<ResponseDto> EliminarGastoAsync(Guid idGasto, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }
    }
}