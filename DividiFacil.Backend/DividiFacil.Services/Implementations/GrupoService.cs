using DividiFacil.Data.Repositories.Implementations;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Grupo;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace DividiFacil.Services.Implementations
{
    public class GrupoService : IGrupoService
    {
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;
        private readonly INotificacionService _notificacionService;
        private IMemoryCache _cache;


        public GrupoService(
            IGrupoRepository grupoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IUsuarioRepository usuarioRepository,
            INotificacionService notificacionService,
            IMemoryCache cache)
        {
            _grupoRepository = grupoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _usuarioRepository = usuarioRepository;
            _notificacionService = notificacionService;
            _cache = cache;
        }

        public async Task<ResponseDto<GrupoDto>> CrearGrupoAsync(GrupoCreacionDto grupoDto, string idUsuarioCreador)
        {
            var response = new ResponseDto<GrupoDto>();

            if (!Guid.TryParse(idUsuarioCreador, out var idCreador))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var usuario = await _usuarioRepository.GetByIdAsync(idCreador);
            if (usuario == null)
            {
                response.Exito = false;
                response.Mensaje = "Usuario no encontrado";
                return response;
            }

            var grupo = new Grupo
            {
                IdGrupo = Guid.NewGuid(),
                NombreGrupo = grupoDto.NombreGrupo,
                Descripcion = grupoDto.Descripcion,
                ModoOperacion = grupoDto.ModoOperacion,
                IdUsuarioCreador = idCreador,
                FechaCreacion = DateTime.UtcNow
            };

            await _grupoRepository.CreateAsync(grupo);

            // Crear el primer miembro (el creador como administrador)
            var miembro = new MiembroGrupo
            {
                IdMiembro = Guid.NewGuid(),
                IdGrupo = grupo.IdGrupo,
                IdUsuario = idCreador,
                Rol = "Admin",
                FechaUnion = DateTime.UtcNow
            };

            // Guardar los cambios
            await _grupoRepository.SaveAsync();

            response.Data = new GrupoDto
            {
                IdGrupo = grupo.IdGrupo,
                NombreGrupo = grupo.NombreGrupo,
                Descripcion = grupo.Descripcion,
                ModoOperacion = grupo.ModoOperacion,
                IdUsuarioCreador = grupo.IdUsuarioCreador,
                NombreCreador = usuario.Nombre,
                FechaCreacion = grupo.FechaCreacion,
                CodigoAcceso = grupo.CodigoAcceso,
                CantidadMiembros = 1, // El creador
                TotalGastos = 0
            };

            return response;
        }

        public async Task<ResponseDto<GrupoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<GrupoDto>();

            // Verificar el ID de usuario
            if (!Guid.TryParse(idUsuarioSolicitante, out var idSolicitante))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Intentar obtener del caché
            string cacheKey = $"Grupo_{id}";
            if (!_cache.TryGetValue(cacheKey, out GrupoDto grupoDto))
            {
                // No está en caché, recuperar de la base de datos
                var grupo = await _grupoRepository.GetByIdAsync(id);

                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                bool esMiembro = await _grupoRepository.EsMiembroAsync(idSolicitante, id);
                if (!esMiembro)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para ver este grupo";
                    return response;
                }

                var creador = await _usuarioRepository.GetByIdAsync(grupo.IdUsuarioCreador);

                // Crear el DTO
                grupoDto = new GrupoDto
                {
                    IdGrupo = grupo.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo,
                    Descripcion = grupo.Descripcion,
                    ModoOperacion = grupo.ModoOperacion,
                    IdUsuarioCreador = grupo.IdUsuarioCreador,
                    NombreCreador = creador?.Nombre ?? "Usuario desconocido",
                    FechaCreacion = grupo.FechaCreacion,
                    CodigoAcceso = grupo.CodigoAcceso,
                    CantidadMiembros = 0, // Debería calcularse en implementación real
                    TotalGastos = 0 // Debería calcularse en implementación real
                };

                // Guardar en caché
                _cache.Set(cacheKey, grupoDto, TimeSpan.FromMinutes(15));
            }

            // Ya tenemos el grupoDto, ya sea desde caché o recién construido
            response.Data = grupoDto;
            return response;
        }

        // Implementaciones mínimas para los demás métodos
        public Task<ResponseDto<GrupoConMiembrosDto>> GetConMiembrosAsync(Guid id, string idUsuarioSolicitante)
        {
            return Task.FromResult(new ResponseDto<GrupoConMiembrosDto>
            {
                Exito = true,
                Data = new GrupoConMiembrosDto()
            });
        }

        public Task<ResponseDto<IEnumerable<GrupoDto>>> GetByUsuarioAsync(string idUsuario)
        {
            return Task.FromResult(new ResponseDto<IEnumerable<GrupoDto>>
            {
                Exito = true,
                Data = new List<GrupoDto>()
            });
        }

        public Task<ResponseDto<GrupoDto>> GetByCodigoAccesoAsync(string codigo)
        {
            return Task.FromResult(new ResponseDto<GrupoDto>
            {
                Exito = true,
                Data = new GrupoDto()
            });
        }

        public Task<ResponseDto> AgregarMiembroAsync(Guid idGrupo, InvitacionDto invitacionDto, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }

        public Task<ResponseDto> EliminarMiembroAsync(Guid idGrupo, Guid idMiembro, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }

        public Task<ResponseDto> CambiarRolMiembroAsync(Guid idGrupo, Guid idMiembro, string nuevoRol, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }

        public Task<ResponseDto<string>> GenerarCodigoAccesoAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto<string>
            {
                Exito = true,
                Data = "CODIGO123"
            });
        }

        public Task<ResponseDto> ActualizarGrupoAsync(Guid idGrupo, GrupoCreacionDto grupoDto, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }

        public Task<ResponseDto> EliminarGrupoAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            return Task.FromResult(new ResponseDto { Exito = true });
        }
    }
}