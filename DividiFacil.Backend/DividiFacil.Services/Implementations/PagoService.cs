using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Pago;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class PagoService : IPagoService
    {
        private readonly IPagoRepository _pagoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IGrupoRepository _grupoRepository;

        public PagoService(
            IPagoRepository pagoRepository,
            IUsuarioRepository usuarioRepository,
            IGrupoRepository grupoRepository)
        {
            _pagoRepository = pagoRepository;
            _usuarioRepository = usuarioRepository;
            _grupoRepository = grupoRepository;
        }

        public async Task<ResponseDto<PagoDto>> CrearPagoAsync(PagoCreacionDto pagoDto, string idUsuarioPagador)
        {
            var response = new ResponseDto<PagoDto>();

            if (!Guid.TryParse(idUsuarioPagador, out var idPagador))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario pagador inválido";
                return response;
            }

            // Verificar usuario pagador
            var pagador = await _usuarioRepository.GetByIdAsync(idPagador);
            if (pagador == null)
            {
                response.Exito = false;
                response.Mensaje = "Usuario pagador no encontrado";
                return response;
            }

            // Verificar usuario receptor
            var receptor = await _usuarioRepository.GetByIdAsync(pagoDto.IdReceptor);
            if (receptor == null)
            {
                response.Exito = false;
                response.Mensaje = "Usuario receptor no encontrado";
                return response;
            }

            // Si se especificó un grupo, verificar que ambos usuarios pertenezcan
            if (pagoDto.IdGrupo.HasValue)
            {
                bool pagadorEsMiembro = await _grupoRepository.EsMiembroAsync(idPagador, pagoDto.IdGrupo.Value);
                bool receptorEsMiembro = await _grupoRepository.EsMiembroAsync(pagoDto.IdReceptor, pagoDto.IdGrupo.Value);

                if (!pagadorEsMiembro || !receptorEsMiembro)
                {
                    response.Exito = false;
                    response.Mensaje = "Ambos usuarios deben ser miembros del grupo";
                    return response;
                }

                // Obtener grupo para información adicional
                var grupo = await _grupoRepository.GetByIdAsync(pagoDto.IdGrupo.Value);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }
            }

            // Crear el pago
            var pago = new Pago
            {
                IdPago = Guid.NewGuid(),
                IdPagador = idPagador,
                IdReceptor = pagoDto.IdReceptor,
                Monto = pagoDto.Monto,
                Concepto = pagoDto.Concepto,
                FechaCreacion = DateTime.UtcNow,
                Estado = "Pendiente",
                IdGrupo = pagoDto.IdGrupo,
                ComprobantePath = pagoDto.ComprobantePath
            };

            await _pagoRepository.CreateAsync(pago);
            await _pagoRepository.SaveAsync();

            // Crear respuesta
            response.Data = new PagoDto
            {
                IdPago = pago.IdPago,
                IdPagador = pago.IdPagador,
                NombrePagador = pagador.Nombre,
                IdReceptor = pago.IdReceptor,
                NombreReceptor = receptor.Nombre,
                Monto = pago.Monto,
                Concepto = pago.Concepto,
                FechaCreacion = pago.FechaCreacion,
                Estado = pago.Estado,
                IdGrupo = pago.IdGrupo,
                NombreGrupo = pago.IdGrupo.HasValue ? (await _grupoRepository.GetByIdAsync(pago.IdGrupo.Value))?.NombreGrupo : null,
                ComprobantePath = pago.ComprobantePath
            };

            return response;
        }

        public async Task<ResponseDto<PagoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<PagoDto>();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idSolicitante))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var pago = await _pagoRepository.GetByIdAsync(id);
            if (pago == null)
            {
                response.Exito = false;
                response.Mensaje = "Pago no encontrado";
                return response;
            }

            // Verificar que el solicitante sea el pagador o el receptor
            if (pago.IdPagador != idSolicitante && pago.IdReceptor != idSolicitante)
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para ver este pago";
                return response;
            }

            var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
            var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);

            response.Data = new PagoDto
            {
                IdPago = pago.IdPago,
                IdPagador = pago.IdPagador,
                NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                IdReceptor = pago.IdReceptor,
                NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                Monto = pago.Monto,
                Concepto = pago.Concepto,
                FechaCreacion = pago.FechaCreacion,
                FechaConfirmacion = pago.FechaConfirmacion,
                Estado = pago.Estado,
                IdGrupo = pago.IdGrupo,
                NombreGrupo = pago.IdGrupo.HasValue ? (await _grupoRepository.GetByIdAsync(pago.IdGrupo.Value))?.NombreGrupo : null,
                ComprobantePath = pago.ComprobantePath,
                MotivoRechazo = pago.MotivoRechazo
            };

            return response;
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetByUsuarioAsync(string idUsuario, bool recibidos = false)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

            if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            IEnumerable<Pago> pagos;
            if (recibidos)
            {
                pagos = await _pagoRepository.GetByReceptorAsync(idUsuarioGuid);
            }
            else
            {
                pagos = await _pagoRepository.GetByPagadorAsync(idUsuarioGuid);
            }

            var pagosDto = new List<PagoDto>();

            foreach (var pago in pagos)
            {
                var pagador = await _usuarioRepository.GetByIdAsync(pago.IdPagador);
                var receptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);

                pagosDto.Add(new PagoDto
                {
                    IdPago = pago.IdPago,
                    IdPagador = pago.IdPagador,
                    NombrePagador = pagador?.Nombre ?? "Usuario desconocido",
                    IdReceptor = pago.IdReceptor,
                    NombreReceptor = receptor?.Nombre ?? "Usuario desconocido",
                    Monto = pago.Monto,
                    Concepto = pago.Concepto,
                    FechaCreacion = pago.FechaCreacion,
                    FechaConfirmacion = pago.FechaConfirmacion,
                    Estado = pago.Estado,
                    IdGrupo = pago.IdGrupo,
                    NombreGrupo = pago.Grupo?.NombreGrupo,
                    ComprobantePath = pago.ComprobantePath,
                    MotivoRechazo = pago.MotivoRechazo
                });
            }

            response.Data = pagosDto;
            return response;
        }

        public async Task<ResponseDto<IEnumerable<PagoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<PagoDto>>();

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
                response.Mensaje = "No tienes permiso para ver los pagos de este grupo";
                return response;
            }

            var pagos = await _pagoRepository.GetByGrupoAsync(idGrupo);
            var pagosDto = new List<PagoDto>();

            foreach (var pago in pagos)
            {
                pagosDto.Add(new PagoDto
                {
                    IdPago = pago.IdPago,
                    IdPagador = pago.IdPagador,
                    NombrePagador = pago.Pagador?.Nombre ?? "Usuario desconocido",
                    IdReceptor = pago.IdReceptor,
                    NombreReceptor = pago.Receptor?.Nombre ?? "Usuario desconocido",
                    Monto = pago.Monto,
                    Concepto = pago.Concepto,
                    FechaCreacion = pago.FechaCreacion,
                    FechaConfirmacion = pago.FechaConfirmacion,
                    Estado = pago.Estado,
                    IdGrupo = pago.IdGrupo,
                    NombreGrupo = pago.Grupo?.NombreGrupo,
                    ComprobantePath = pago.ComprobantePath,
                    MotivoRechazo = pago.MotivoRechazo
                });
            }

            response.Data = pagosDto;
            return response;
        }

        public async Task<ResponseDto> ConfirmarPagoAsync(Guid idPago, string idUsuarioReceptor)
        {
            var response = new ResponseDto();

            if (!Guid.TryParse(idUsuarioReceptor, out var idReceptor))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var pago = await _pagoRepository.GetByIdAsync(idPago);
            if (pago == null)
            {
                response.Exito = false;
                response.Mensaje = "Pago no encontrado";
                return response;
            }

            // Verificar que quien confirma es el receptor
            if (pago.IdReceptor != idReceptor)
            {
                response.Exito = false;
                response.Mensaje = "Solo el receptor puede confirmar el pago";
                return response;
            }

            // Verificar que el pago esté pendiente
            if (pago.Estado != "Pendiente")
            {
                response.Exito = false;
                response.Mensaje = $"No se puede confirmar un pago en estado {pago.Estado}";
                return response;
            }

            // Actualizar el estado del pago
            pago.Estado = "Confirmado";
            pago.FechaConfirmacion = DateTime.UtcNow;

            await _pagoRepository.SaveAsync();

            response.Mensaje = "Pago confirmado correctamente";
            return response;
        }

        public async Task<ResponseDto> RechazarPagoAsync(Guid idPago, string idUsuarioReceptor, string? motivo = null)
        {
            var response = new ResponseDto();

            if (!Guid.TryParse(idUsuarioReceptor, out var idReceptor))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var pago = await _pagoRepository.GetByIdAsync(idPago);
            if (pago == null)
            {
                response.Exito = false;
                response.Mensaje = "Pago no encontrado";
                return response;
            }

            // Verificar que quien rechaza es el receptor
            if (pago.IdReceptor != idReceptor)
            {
                response.Exito = false;
                response.Mensaje = "Solo el receptor puede rechazar el pago";
                return response;
            }

            // Verificar que el pago esté pendiente
            if (pago.Estado != "Pendiente")
            {
                response.Exito = false;
                response.Mensaje = $"No se puede rechazar un pago en estado {pago.Estado}";
                return response;
            }

            // Actualizar el estado del pago
            pago.Estado = "Rechazado";
            pago.MotivoRechazo = motivo;

            await _pagoRepository.SaveAsync();

            response.Mensaje = "Pago rechazado correctamente";
            return response;
        }

        public async Task<ResponseDto> EliminarPagoAsync(Guid idPago, string idUsuarioPagador)
        {
            var response = new ResponseDto();

            if (!Guid.TryParse(idUsuarioPagador, out var idPagador))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var pago = await _pagoRepository.GetByIdAsync(idPago);
            if (pago == null)
            {
                response.Exito = false;
                response.Mensaje = "Pago no encontrado";
                return response;
            }

            // Verificar que quien elimina es el pagador
            if (pago.IdPagador != idPagador)
            {
                response.Exito = false;
                response.Mensaje = "Solo quien realizó el pago puede eliminarlo";
                return response;
            }

            // Solo se puede eliminar un pago pendiente
            if (pago.Estado != "Pendiente")
            {
                response.Exito = false;
                response.Mensaje = $"No se puede eliminar un pago en estado {pago.Estado}";
                return response;
            }

            await _pagoRepository.DeleteAsync(pago);
            await _pagoRepository.SaveAsync();

            response.Mensaje = "Pago eliminado correctamente";
            return response;
        }
    }
}