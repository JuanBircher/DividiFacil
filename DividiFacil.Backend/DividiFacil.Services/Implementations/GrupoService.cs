using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Grupo;
using DividiFacil.Domain.DTOs.Usuario;
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
        private IGastoRepository _gastoRepository;
        private IDetalleGastoRepository _detalleGastoRepository;
        private IMemoryCache _cache;


        public GrupoService(
            IGrupoRepository grupoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IUsuarioRepository usuarioRepository,
            INotificacionService notificacionService,
            IGastoRepository gastoRepository,
            IDetalleGastoRepository detalleGastoRepository,
            IMemoryCache cache)
        {
            _grupoRepository = grupoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _usuarioRepository = usuarioRepository;
            _notificacionService = notificacionService;
            _gastoRepository = gastoRepository;
            _detalleGastoRepository = detalleGastoRepository;
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

            await _miembroGrupoRepository.CreateAsync(miembro);

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

            // ✅ CORREGIDO: Manejo correcto del caché con nullable
            if (!_cache.TryGetValue(cacheKey, out GrupoDto? grupoDto) || grupoDto == null)
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
                    CantidadMiembros = 0,
                    TotalGastos = 0
                };

                // Guardar en caché
                _cache.Set(cacheKey, grupoDto, TimeSpan.FromMinutes(15));
            }

            // ✅ CORREGIDO: Verificar que grupoDto no es null antes de asignar
            if (grupoDto == null)
            {
                response.Exito = false;
                response.Mensaje = "Error al procesar datos del grupo";
                return response;
            }

            // Ya tenemos el grupoDto válido
            response.Exito = true;
            response.Data = grupoDto;
            response.Mensaje = "Grupo obtenido exitosamente";

            return response;
        }

        // Implementaciones mínimas para los demás métodos
        public async Task<ResponseDto<GrupoConMiembrosDto>> GetConMiembrosAsync(Guid id, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<GrupoConMiembrosDto>();

            try
            {
                // Validar ID de usuario
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                var miembroSolicitante = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, id);
                if (miembroSolicitante == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene acceso a este grupo";
                    return response;
                }

                // Obtener el grupo
                var grupo = await _grupoRepository.GetByIdAsync(id);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // ✅ CORREGIDO: Usar el método correcto del repositorio
                var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(id);

                // Mapear miembros a DTO
                var miembrosDto = new List<MiembroGrupoSimpleDto>();
                foreach (var miembro in miembros)
                {
                    var usuario = await _usuarioRepository.GetByIdAsync(miembro.IdUsuario);
                    miembrosDto.Add(new MiembroGrupoSimpleDto
                    {
                        IdMiembro = miembro.IdMiembro,
                        IdUsuario = miembro.IdUsuario,
                        NombreUsuario = usuario?.Nombre ?? string.Empty,
                        EmailUsuario = usuario?.Email ?? string.Empty,
                        Rol = miembro.Rol,
                        FechaUnion = miembro.FechaUnion
                    });
                }

                // Obtener creador del grupo
                var creador = await _usuarioRepository.GetByIdAsync(grupo.IdUsuarioCreador);

                // Mapear grupo a DTO usando PROPIEDADES REALES
                var grupoDto = new GrupoConMiembrosDto
                {
                    IdGrupo = grupo.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo,
                    Descripcion = grupo.Descripcion,
                    ModoOperacion = grupo.ModoOperacion,
                    IdUsuarioCreador = grupo.IdUsuarioCreador,
                    NombreCreador = creador?.Nombre ?? string.Empty,
                    FechaCreacion = grupo.FechaCreacion,
                    CodigoAcceso = grupo.CodigoAcceso,
                    TotalGastos = 0, // Calcular si es necesario
                    Miembros = miembrosDto
                };

                response.Exito = true;
                response.Data = grupoDto;
                response.Mensaje = "Grupo obtenido exitosamente";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener grupo con miembros: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<GrupoDto>>> GetByUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<IEnumerable<GrupoDto>>();

            if (!Guid.TryParse(idUsuario, out var userGuid))
            {
                response.Exito = false;
                response.Mensaje = "Usuario inválido";
                return response;
            }

            var grupos = await _grupoRepository.GetByUsuarioAsync(userGuid);
            var gruposList = grupos.ToList();
            var gruposDto = new List<GrupoDto>();

            foreach (var grupo in gruposList)
            {
                // Obtener cantidad de miembros
                var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(grupo.IdGrupo);
                // Obtener gastos
                var gastos = await _gastoRepository.GetByGrupoAsync(grupo.IdGrupo);

                gruposDto.Add(new GrupoDto
                {
                    IdGrupo = grupo.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo,
                    Descripcion = grupo.Descripcion,
                    ModoOperacion = grupo.ModoOperacion,
                    IdUsuarioCreador = grupo.IdUsuarioCreador,
                    NombreCreador = "",
                    FechaCreacion = grupo.FechaCreacion,
                    CodigoAcceso = grupo.CodigoAcceso,
                    CantidadMiembros = miembros?.Count() ?? 0,
                    TotalGastos = gastos?.Sum(gs => gs.Monto) ?? 0
                });
            }

            response.Exito = true;
            response.Data = gruposDto;
            response.Mensaje = "Grupos obtenidos exitosamente";

            return response;
        }

        public async Task<ResponseDto<GrupoDto>> GetByCodigoAccesoAsync(string codigo)
        {
            var response = new ResponseDto<GrupoDto>();

            try
            {
                if (string.IsNullOrWhiteSpace(codigo))
                {
                    response.Exito = false;
                    response.Mensaje = "Código de acceso requerido";
                    return response;
                }

                var grupo = await _grupoRepository.GetByCodigoAccesoAsync(codigo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Código de acceso inválido o expirado";
                    return response;
                }

                // Obtener creador
                var creador = await _usuarioRepository.GetByIdAsync(grupo.IdUsuarioCreador);

                var grupoDto = new GrupoDto
                {
                    IdGrupo = grupo.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo,
                    Descripcion = grupo.Descripcion,
                    ModoOperacion = grupo.ModoOperacion,
                    IdUsuarioCreador = grupo.IdUsuarioCreador,
                    NombreCreador = creador?.Nombre ?? string.Empty,
                    FechaCreacion = grupo.FechaCreacion,
                    CodigoAcceso = grupo.CodigoAcceso,
                    TotalGastos = 0
                };

                response.Exito = true;
                response.Data = grupoDto;
                response.Mensaje = "Grupo encontrado";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al buscar grupo: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> AgregarMiembroAsync(Guid idGrupo, InvitacionDto invitacionDto, string idUsuarioAdmin)
        {
            var response = new ResponseDto();

            try
            {
                // Validar que el usuario admin existe y es admin del grupo
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                var miembroAdmin = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioAdminGuid, idGrupo);
                if (miembroAdmin == null || miembroAdmin.Rol != "Admin")
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene permisos para agregar miembros a este grupo";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                var usuarioInvitado = await _usuarioRepository.GetByEmailAsync(invitacionDto.EmailInvitado);
                if (usuarioInvitado == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El usuario con el email especificado no existe";
                    return response;
                }

                // Verificar que el usuario no sea ya miembro del grupo
                var miembroExistente = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(usuarioInvitado.IdUsuario, idGrupo);
                if (miembroExistente != null)
                {
                    response.Exito = false;
                    response.Mensaje = "El usuario ya es miembro de este grupo";
                    return response;
                }

                // ✅ CORREGIDO: Usar las propiedades REALES de tu entidad
                var nuevoMiembro = new MiembroGrupo
                {
                    IdMiembro = Guid.NewGuid(),
                    IdGrupo = idGrupo,
                    IdUsuario = usuarioInvitado.IdUsuario,
                    Rol = "Miembro",
                    FechaUnion = DateTime.UtcNow
                };

                await _miembroGrupoRepository.CreateAsync(nuevoMiembro);
                await _miembroGrupoRepository.SaveAsync();

                response.Exito = true;
                response.Mensaje = "Miembro agregado exitosamente al grupo";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al agregar miembro: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> EliminarMiembroAsync(Guid idGrupo, Guid idMiembro, string idUsuarioAdmin)
        {
            var response = new ResponseDto();

            try
            {
                // Validar ID de usuario administrador
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // Verificar que el usuario admin es realmente admin del grupo
                var miembroAdmin = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioAdminGuid, idGrupo);
                if (miembroAdmin == null || miembroAdmin.Rol != "Admin")
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene permisos para eliminar miembros de este grupo";
                    return response;
                }

                // Verificar que el miembro a eliminar existe
                var miembroAEliminar = await _miembroGrupoRepository.GetByIdAsync(idMiembro);
                if (miembroAEliminar == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El miembro no existe";
                    return response;
                }

                // Verificar que el miembro pertenece al grupo correcto
                if (miembroAEliminar.IdGrupo != idGrupo)
                {
                    response.Exito = false;
                    response.Mensaje = "El miembro no pertenece a este grupo";
                    return response;
                }

                // No permitir que el creador del grupo se auto-elimine
                if (miembroAEliminar.IdUsuario == grupo.IdUsuarioCreador)
                {
                    response.Exito = false;
                    response.Mensaje = "El creador del grupo no puede ser eliminado. Transfiera la propiedad del grupo primero";
                    return response;
                }

                // Verificar si el miembro tiene gastos pendientes (política de negocio)
                var tieneGastosPendientes = await MiembroTieneGastosPendientesAsync(miembroAEliminar.IdUsuario, idGrupo);
                if (tieneGastosPendientes)
                {
                    response.Exito = false;
                    response.Mensaje = "No se puede eliminar el miembro porque tiene gastos pendientes en el grupo";
                    return response;
                }

                // Obtener información del usuario para notificación
                var usuarioEliminado = await _usuarioRepository.GetByIdAsync(miembroAEliminar.IdUsuario);

                // Eliminar el miembro
                await _miembroGrupoRepository.DeleteAsync(idMiembro);
                await _miembroGrupoRepository.SaveAsync();

                // Limpiar caché relacionado
                string cacheKey = $"Grupo_{idGrupo}";
                _cache.Remove(cacheKey);

                // Notificar al usuario eliminado (opcional)
                try
                {
                    if (usuarioEliminado != null)
                    {
                        // ✅ CORREGIDO: Usar el método REAL del servicio
                        await _notificacionService.CrearNotificacionGrupoAsync(
                            idGrupo,
                            usuarioEliminado.IdUsuario,
                            $"Has sido eliminado del grupo '{grupo.NombreGrupo}'.",
                            "MiembroEliminado"
                        );
                    }
                }
                catch
                {
                    // Si falla el envío de notificaciones, no afectar el resultado principal
                }

                response.Exito = true;
                response.Mensaje = $"Miembro eliminado exitosamente del grupo";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al eliminar miembro: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> CambiarRolMiembroAsync(Guid idGrupo, Guid idMiembro, string nuevoRol, string idUsuarioAdmin)
        {
            var response = new ResponseDto();

            try
            {
                // Validar ID de usuario administrador
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                // Validar nuevo rol
                if (string.IsNullOrWhiteSpace(nuevoRol) || (nuevoRol != "Admin" && nuevoRol != "Miembro"))
                {
                    response.Exito = false;
                    response.Mensaje = "El rol debe ser 'Admin' o 'Miembro'";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // Verificar que el usuario admin es realmente admin del grupo
                var miembroAdmin = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioAdminGuid, idGrupo);
                if (miembroAdmin == null || miembroAdmin.Rol != "Admin")
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene permisos para cambiar roles en este grupo";
                    return response;
                }

                // Verificar que el miembro existe
                var miembro = await _miembroGrupoRepository.GetByIdAsync(idMiembro);
                if (miembro == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El miembro no existe";
                    return response;
                }

                // Verificar que el miembro pertenece al grupo correcto
                if (miembro.IdGrupo != idGrupo)
                {
                    response.Exito = false;
                    response.Mensaje = "El miembro no pertenece a este grupo";
                    return response;
                }

                // No permitir cambiar el rol del creador del grupo
                if (miembro.IdUsuario == grupo.IdUsuarioCreador)
                {
                    response.Exito = false;
                    response.Mensaje = "No se puede cambiar el rol del creador del grupo";
                    return response;
                }

                // Verificar si ya tiene el rol solicitado
                if (miembro.Rol == nuevoRol)
                {
                    response.Exito = false;
                    response.Mensaje = $"El miembro ya tiene el rol '{nuevoRol}'";
                    return response;
                }

                // Actualizar el rol
                miembro.Rol = nuevoRol;

                await _miembroGrupoRepository.UpdateAsync(miembro);
                await _miembroGrupoRepository.SaveAsync();

                // Limpiar caché relacionado
                string cacheKey = $"Grupo_{idGrupo}";
                _cache.Remove(cacheKey);

                // Obtener información del usuario para notificación
                var usuario = await _usuarioRepository.GetByIdAsync(miembro.IdUsuario);

                // Notificar al usuario sobre el cambio de rol (opcional)
                try
                {
                    if (usuario != null)
                    {
                        // ✅ CORREGIDO: Usar el método REAL del servicio
                        await _notificacionService.CrearNotificacionGrupoAsync(
                            idGrupo,
                            usuario.IdUsuario,
                            $"Tu rol en el grupo '{grupo.NombreGrupo}' ha cambiado a '{nuevoRol}'.",
                            "CambioRol"
                        );
                    }
                }
                catch
                {
                    // Si falla el envío de notificaciones, no afectar el resultado principal
                }

                response.Exito = true;
                response.Mensaje = $"Rol cambiado exitosamente a '{nuevoRol}'";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al cambiar rol: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<string>> GenerarCodigoAccesoAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            var response = new ResponseDto<string>();

            try
            {
                // Validar que el usuario admin existe y es admin del grupo
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                var miembroAdmin = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioAdminGuid, idGrupo);
                if (miembroAdmin == null || miembroAdmin.Rol != "Admin")
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene permisos para generar código de acceso";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // Generar código único
                var codigoAcceso = GenerarCodigoUnico();

                // Actualizar el grupo con el nuevo código
                grupo.CodigoAcceso = codigoAcceso;

                await _grupoRepository.UpdateAsync(grupo);
                await _grupoRepository.SaveAsync();

                response.Exito = true;
                response.Data = codigoAcceso;
                response.Mensaje = "Código de acceso generado exitosamente";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al generar código de acceso: {ex.Message}";
                return response;
            }
        }

        private string GenerarCodigoUnico()
        {
            const string caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var codigo = new char[8];

            for (int i = 0; i < codigo.Length; i++)
            {
                codigo[i] = caracteres[random.Next(caracteres.Length)];
            }

            return new string(codigo);
        }


        public async Task<ResponseDto> ActualizarGrupoAsync(Guid idGrupo, GrupoCreacionDto grupoDto, string idUsuarioAdmin)
        {
            var response = new ResponseDto();

            try
            {
                // Validar ID de usuario administrador
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // Verificar que el usuario es admin del grupo
                var miembroAdmin = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioAdminGuid, idGrupo);
                if (miembroAdmin == null || miembroAdmin.Rol != "Admin")
                {
                    response.Exito = false;
                    response.Mensaje = "No tiene permisos para actualizar este grupo";
                    return response;
                }

                // Validar datos del DTO
                if (string.IsNullOrWhiteSpace(grupoDto.NombreGrupo))
                {
                    response.Exito = false;
                    response.Mensaje = "El nombre del grupo es requerido";
                    return response;
                }

                // Actualizar propiedades del grupo
                grupo.NombreGrupo = grupoDto.NombreGrupo.Trim();
                grupo.Descripcion = grupoDto.Descripcion?.Trim();
                grupo.ModoOperacion = grupoDto.ModoOperacion;

                // Guardar cambios
                await _grupoRepository.UpdateAsync(grupo);
                await _grupoRepository.SaveAsync();

                // Limpiar caché del grupo actualizado
                string cacheKey = $"Grupo_{idGrupo}";
                _cache.Remove(cacheKey);

                response.Exito = true;
                response.Mensaje = "Grupo actualizado exitosamente";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al actualizar grupo: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> EliminarGrupoAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            var response = new ResponseDto();

            try
            {
                // Validar ID de usuario administrador
                if (!Guid.TryParse(idUsuarioAdmin, out var idUsuarioAdminGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario administrador inválido";
                    return response;
                }

                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "El grupo no existe";
                    return response;
                }

                // Verificar que el usuario es el creador del grupo (solo el creador puede eliminar)
                if (grupo.IdUsuarioCreador != idUsuarioAdminGuid)
                {
                    response.Exito = false;
                    response.Mensaje = "Solo el creador del grupo puede eliminarlo";
                    return response;
                }

                // Verificar si el grupo tiene gastos activos (opcional - política de negocio)
                // Si hay gastos pendientes, no permitir eliminación
                var tieneGastosPendientes = await TieneGastosPendientesAsync(idGrupo);
                if (tieneGastosPendientes)
                {
                    response.Exito = false;
                    response.Mensaje = "No se puede eliminar el grupo porque tiene gastos pendientes";
                    return response;
                }

                // Obtener todos los miembros del grupo para eliminarlos primero
                var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(idGrupo);

                // Eliminar todos los miembros del grupo primero
                foreach (var miembro in miembros)
                {
                    await _miembroGrupoRepository.DeleteAsync(miembro.IdMiembro);
                }

                // Eliminar el grupo
                await _grupoRepository.DeleteAsync(idGrupo);
                await _grupoRepository.SaveAsync();

                // Limpiar caché
                string cacheKey = $"Grupo_{idGrupo}";
                _cache.Remove(cacheKey);

                // Notificar a los miembros (opcional)
                try
                {
                    foreach (var miembro in miembros.Where(m => m.IdUsuario != idUsuarioAdminGuid))
                    {
                        // ✅ CORREGIDO: Usar el método REAL del servicio
                        await _notificacionService.CrearNotificacionGrupoAsync(
                            idGrupo,
                            miembro.IdUsuario,
                            $"El grupo '{grupo.NombreGrupo}' ha sido eliminado por el administrador.",
                            "GrupoEliminado"
                        );
                    }
                }
                catch
                {
                    // Si falla el envío de notificaciones, no afectar el resultado principal
                }

                response.Exito = true;
                response.Mensaje = "Grupo eliminado exitosamente";

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al eliminar grupo: {ex.Message}";
                return response;
            }
        }

        // ✅ CORREGIDO: Remover async de métodos que no usan await
        private async Task<bool> TieneGastosPendientesAsync(Guid idGrupo)
        {
            var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
            
            // ✅ CAMBIO: Como Gasto no tiene "Estado", verificamos detalles pendientes
            if (!gastos.Any()) return false;
            
            // Verificar si hay detalles de gastos pendientes en el grupo
            foreach (var gasto in gastos)
            {
                var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);
                if (detalles.Any(d => !d.Pagado))
                {
                    return true; // Hay gastos pendientes
                }
            }
            
            return false; // No hay gastos pendientes
        }

        private async Task<bool> MiembroTieneGastosPendientesAsync(Guid idUsuario, Guid idGrupo)
        {
            // Obtener el miembro por usuario y grupo
            var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuario, idGrupo);
            if (miembro == null) return false;

            // ✅ CORREGIDO: NO usar GetByMiembroAsync que no existe
            // En su lugar, obtener gastos del grupo y filtrar por miembro deudor
            var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
            
            foreach (var gasto in gastos)
            {
                var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);
                
                // Verificar si este miembro tiene detalles pendientes
                if (detalles.Any(d => d.IdMiembroDeudor == miembro.IdMiembro && !d.Pagado))
                {
                    return true; // Tiene gastos pendientes
                }
            }
            
            return false; // No tiene gastos pendientes
        }
    }
}