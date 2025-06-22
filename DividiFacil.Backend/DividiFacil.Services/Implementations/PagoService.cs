using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Pago;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class PagoService : IPagoService
    {
        private readonly IPagoRepository _pagoRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IGrupoRepository _grupoRepository;

        public PagoService(
            IPagoRepository pagoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IUsuarioRepository usuarioRepository,
            IGrupoRepository grupoRepository)
        {
            _pagoRepository = pagoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _usuarioRepository = usuarioRepository;
            _grupoRepository = grupoRepository;
        }

        public Task<ResponseDto<PagoDto>> CrearPagoAsync(PagoCreacionDto pagoDto, string idUsuarioCreador)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto> ConfirmarPagoAsync(Guid idPago, string idUsuarioReceptor)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto<IEnumerable<PagoDto>>> GetPagosPendientesAsync(string idUsuarioSolicitante)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto<IEnumerable<PagoDto>>> GetPagosCompletadosAsync(string idUsuarioSolicitante)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto<PagoDto>> GetByIdAsync(Guid idPago, string idUsuarioSolicitante)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto<IEnumerable<PagoDto>>> GetByUsuarioAsync(string idUsuario, bool recibidos = false)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto<IEnumerable<PagoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto> RechazarPagoAsync(Guid idPago, string idUsuarioReceptor, string? motivo = null)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }

        public Task<ResponseDto> EliminarPagoAsync(Guid idPago, string idUsuarioPagador)
        {
            throw new NotImplementedException("Método no implementado todavía");
        }
    }
}