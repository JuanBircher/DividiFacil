using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Gasto;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class GastoService : IGastoService
    {
        private readonly IGastoRepository _gastoRepository;
        private readonly IDetalleGastoRepository _detalleGastoRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly INotificacionService _notificacionService;
        private readonly IRecordatorioService _recordatorioService;

        public GastoService(
            IGastoRepository gastoRepository,
            IDetalleGastoRepository detalleGastoRepository,
            IUsuarioRepository usuarioRepository,
            IGrupoRepository grupoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            INotificacionService notificacionService,
            IRecordatorioService recordatorioService)
        {
            _gastoRepository = gastoRepository;
            _detalleGastoRepository = detalleGastoRepository;
            _usuarioRepository = usuarioRepository;
            _grupoRepository = grupoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _notificacionService = notificacionService;
            _recordatorioService = recordatorioService;
        }

        public async Task<ResponseDto<GastoDto>> CrearGastoAsync(GastoCreacionDto gastoDto, string idUsuarioCreador)
        {
            var response = new ResponseDto<GastoDto>();

            if (!Guid.TryParse(idUsuarioCreador, out var idUsuarioGuid))
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
            var miembroCreador = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, gastoDto.IdGrupo);
            if (miembroCreador == null)
            {
                response.Exito = false;
                response.Mensaje = "No eres miembro de este grupo";
                return response;
            }

            // Validar los detalles del gasto
            if (gastoDto.Detalles == null || gastoDto.Detalles.Count == 0)
            {
                response.Exito = false;
                response.Mensaje = "Debe especificar al menos un detalle para el gasto";
                return response;
            }

            // Verificar que el total de los detalles coincide con el monto del gasto
            decimal totalDetalles = gastoDto.Detalles.Sum(d => d.Monto);
            if (Math.Abs(totalDetalles - gastoDto.Monto) > 0.01m)
            {
                response.Exito = false;
                response.Mensaje = $"La suma de los detalles ({totalDetalles}) no coincide con el monto total ({gastoDto.Monto})";
                return response;
            }

            // Verificar que todos los miembros en los detalles pertenecen al grupo
            foreach (var detalle in gastoDto.Detalles)
            {
                var miembro = await _miembroGrupoRepository.GetByIdAsync(detalle.IdMiembroDeudor);
                if (miembro == null || miembro.IdGrupo != gastoDto.IdGrupo)
                {
                    response.Exito = false;
                    response.Mensaje = $"El miembro con ID {detalle.IdMiembroDeudor} no pertenece al grupo";
                    return response;
                }
            }

            // Crear el gasto
            var gasto = new Gasto
            {
                IdGasto = Guid.NewGuid(),
                IdGrupo = gastoDto.IdGrupo,
                IdMiembroPagador = miembroCreador.IdMiembro,
                Monto = gastoDto.Monto,
                Descripcion = gastoDto.Descripcion,
                Categoria = gastoDto.Categoria,
                FechaCreacion = DateTime.UtcNow,
                FechaGasto = gastoDto.FechaGasto ?? DateTime.UtcNow,
                ComprobantePath = gastoDto.ComprobantePath
            };

            await _gastoRepository.CreateAsync(gasto);
            await _gastoRepository.SaveAsync();

            // Crear los detalles del gasto
            foreach (var detalleDto in gastoDto.Detalles)
            {
                var detalle = new DetalleGasto
                {
                    IdDetalleGasto = Guid.NewGuid(),
                    IdGasto = gasto.IdGasto,
                    IdMiembroDeudor = detalleDto.IdMiembroDeudor,
                    Monto = detalleDto.Monto,
                    Pagado = false // Por defecto, ningún detalle está pagado al crear el gasto
                };

                await _detalleGastoRepository.CreateAsync(detalle);
            }

            await _detalleGastoRepository.SaveAsync();
            await _notificacionService.CrearNotificacionGastoAsync(gasto.IdGasto);


            // Crear respuesta
            var detallesDto = new List<DetalleGastoDto>();
            var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);

            foreach (var detalle in detalles)
            {
                var miembroDeudor = await _miembroGrupoRepository.GetByIdAsync(detalle.IdMiembroDeudor);
                if (miembroDeudor != null)
                {
                    var usuarioDeudor = await _usuarioRepository.GetByIdAsync(miembroDeudor.IdUsuario);

                    detallesDto.Add(new DetalleGastoDto
                    {
                        IdDetalleGasto = detalle.IdDetalleGasto,
                        IdMiembroDeudor = detalle.IdMiembroDeudor,
                        NombreMiembroDeudor = usuarioDeudor?.Nombre ?? "Usuario desconocido",
                        Monto = detalle.Monto,
                        Pagado = detalle.Pagado
                    });
                }
            }

            var usuarioPagador = await _usuarioRepository.GetByIdAsync(miembroCreador.IdUsuario);

            response.Data = new GastoDto
            {
                IdGasto = gasto.IdGasto,
                IdGrupo = gasto.IdGrupo,
                NombreGrupo = grupo.NombreGrupo,
                IdMiembroPagador = gasto.IdMiembroPagador,
                NombreMiembroPagador = usuarioPagador?.Nombre ?? "Usuario desconocido",
                Monto = gasto.Monto,
                Descripcion = gasto.Descripcion,
                Categoria = gasto.Categoria,
                FechaCreacion = gasto.FechaCreacion,
                FechaGasto = gasto.FechaGasto,
                ComprobantePath = gasto.ComprobantePath,
                Detalles = detallesDto
            };

            return response;
        }

        public async Task<ResponseDto<GastoDto>> GetByIdAsync(Guid id, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<GastoDto>();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Obtener el gasto
            var gasto = await _gastoRepository.GetByIdAsync(id);
            if (gasto == null)
            {
                response.Exito = false;
                response.Mensaje = "Gasto no encontrado";
                return response;
            }

            // Verificar que el usuario es miembro del grupo
            var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, gasto.IdGrupo);
            if (miembro == null)
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para ver este gasto";
                return response;
            }

            // Obtener grupo
            var grupo = await _grupoRepository.GetByIdAsync(gasto.IdGrupo);

            // Obtener miembro pagador
            var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
            var usuarioPagador = miembroPagador != null ?
                await _usuarioRepository.GetByIdAsync(miembroPagador.IdUsuario) : null;

            // Obtener detalles
            var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);
            var detallesDto = new List<DetalleGastoDto>();

            foreach (var detalle in detalles)
            {
                var miembroDeudor = await _miembroGrupoRepository.GetByIdAsync(detalle.IdMiembroDeudor);
                if (miembroDeudor != null)
                {
                    var usuarioDeudor = await _usuarioRepository.GetByIdAsync(miembroDeudor.IdUsuario);

                    detallesDto.Add(new DetalleGastoDto
                    {
                        IdDetalleGasto = detalle.IdDetalleGasto,
                        IdMiembroDeudor = detalle.IdMiembroDeudor,
                        NombreMiembroDeudor = usuarioDeudor?.Nombre ?? "Usuario desconocido",
                        Monto = detalle.Monto,
                        Pagado = detalle.Pagado
                    });
                }
            }

            response.Data = new GastoDto
            {
                IdGasto = gasto.IdGasto,
                IdGrupo = gasto.IdGrupo,
                NombreGrupo = grupo?.NombreGrupo ?? "Grupo desconocido",
                IdMiembroPagador = gasto.IdMiembroPagador,
                NombreMiembroPagador = usuarioPagador?.Nombre ?? "Usuario desconocido",
                Monto = gasto.Monto,
                Descripcion = gasto.Descripcion,
                Categoria = gasto.Categoria,
                FechaCreacion = gasto.FechaCreacion,
                FechaGasto = gasto.FechaGasto,
                ComprobantePath = gasto.ComprobantePath,
                Detalles = detallesDto
            };

            return response;
        }

        public async Task<ResponseDto<IEnumerable<GastoDto>>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<GastoDto>>();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
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

            // Verificar que el usuario es miembro del grupo
            var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, idGrupo);
            if (miembro == null)
            {
                response.Exito = false;
                response.Mensaje = "No eres miembro de este grupo";
                return response;
            }

            // Obtener los gastos
            var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
            var gastosDto = new List<GastoDto>();

            foreach (var gasto in gastos)
            {
                var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
                var usuarioPagador = miembroPagador != null ?
                    await _usuarioRepository.GetByIdAsync(miembroPagador.IdUsuario) : null;

                gastosDto.Add(new GastoDto
                {
                    IdGasto = gasto.IdGasto,
                    IdGrupo = gasto.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo,
                    IdMiembroPagador = gasto.IdMiembroPagador,
                    NombreMiembroPagador = usuarioPagador?.Nombre ?? "Usuario desconocido",
                    Monto = gasto.Monto,
                    Descripcion = gasto.Descripcion,
                    Categoria = gasto.Categoria,
                    FechaCreacion = gasto.FechaCreacion,
                    FechaGasto = gasto.FechaGasto,
                    ComprobantePath = gasto.ComprobantePath
                    // No incluimos los detalles para hacer la respuesta más ligera
                });
            }

            response.Data = gastosDto;
            return response;
        }

        public async Task<ResponseDto<IEnumerable<GastoDto>>> GetRecientesAsync(string idUsuario, int cantidad)
        {
            var response = new ResponseDto<IEnumerable<GastoDto>>();

            if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Obtener miembros de grupos del usuario
            var miembros = await _miembroGrupoRepository.GetGruposByUsuarioAsync(idUsuarioGuid);
            var idGrupos = miembros.Select(m => m.IdGrupo).ToList();

            // Obtener gastos recientes
            var gastos = new List<Gasto>();
            foreach (var idGrupo in idGrupos)
            {
                var gastosGrupo = await _gastoRepository.GetByGrupoAsync(idGrupo);
                gastos.AddRange(gastosGrupo);
            }

            // Ordenar por fecha y limitar cantidad
            gastos = gastos.OrderByDescending(g => g.FechaCreacion)
                         .Take(cantidad)
                         .ToList();

            var gastosDto = new List<GastoDto>();
            foreach (var gasto in gastos)
            {
                var grupo = await _grupoRepository.GetByIdAsync(gasto.IdGrupo);
                var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
                var usuarioPagador = miembroPagador != null ?
                    await _usuarioRepository.GetByIdAsync(miembroPagador.IdUsuario) : null;

                gastosDto.Add(new GastoDto
                {
                    IdGasto = gasto.IdGasto,
                    IdGrupo = gasto.IdGrupo,
                    NombreGrupo = grupo?.NombreGrupo ?? "Grupo desconocido",
                    IdMiembroPagador = gasto.IdMiembroPagador,
                    NombreMiembroPagador = usuarioPagador?.Nombre ?? "Usuario desconocido",
                    Monto = gasto.Monto,
                    Descripcion = gasto.Descripcion,
                    Categoria = gasto.Categoria,
                    FechaCreacion = gasto.FechaCreacion,
                    FechaGasto = gasto.FechaGasto,
                    ComprobantePath = gasto.ComprobantePath
                    // No incluimos los detalles para hacer la respuesta más ligera
                });
            }

            response.Data = gastosDto;
            return response;
        }

        public async Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<SaldoUsuarioDto>>();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
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

            // Verificar que el usuario es miembro del grupo
            var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, idGrupo);
            if (miembro == null)
            {
                response.Exito = false;
                response.Mensaje = "No eres miembro de este grupo";
                return response;
            }

            // Obtener todos los miembros del grupo
            var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(idGrupo);
            var saldos = new Dictionary<Guid, SaldoUsuarioDto>();

            // Inicializar saldos
            foreach (var m in miembros)
            {
                var usuario = await _usuarioRepository.GetByIdAsync(m.IdUsuario);
                saldos[m.IdMiembro] = new SaldoUsuarioDto
                {
                    IdUsuario = m.IdUsuario,
                    NombreUsuario = usuario?.Nombre ?? "Usuario desconocido",
                    ImagenPerfil = usuario?.UrlImagen ?? "",
                    TotalPagado = 0,
                    TotalAPagar = 0,
                    Saldo = 0
                };
            }

            // Obtener todos los gastos del grupo
            var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);

            // Calcular saldos
            foreach (var gasto in gastos)
            {
                // Sumar lo que ha pagado cada miembro
                if (saldos.TryGetValue(gasto.IdMiembroPagador, out var saldoPagador))
                {
                    saldoPagador.TotalPagado += gasto.Monto;
                }

                // Obtener detalles del gasto
                var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);

                // Sumar lo que debe pagar cada miembro
                foreach (var detalle in detalles)
                {
                    if (!detalle.Pagado && saldos.TryGetValue(detalle.IdMiembroDeudor, out var saldoDeudor))
                    {
                        saldoDeudor.TotalAPagar += detalle.Monto;
                    }
                }
            }

            // Calcular saldo final
            foreach (var saldo in saldos.Values)
            {
                saldo.Saldo = saldo.TotalPagado - saldo.TotalAPagar;
            }

            response.Data = saldos.Values;
            return response;
        }

        public async Task<ResponseDto<IEnumerable<SaldoUsuarioDto>>> GetSaldosUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<IEnumerable<SaldoUsuarioDto>>();

            if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Obtener todos los grupos a los que pertenece el usuario
            var miembrosGrupo = await _miembroGrupoRepository.GetGruposByUsuarioAsync(idUsuarioGuid);
            var saldosPorGrupo = new List<SaldoUsuarioDto>();

            // Calcular saldo por cada grupo
            foreach (var miembro in miembrosGrupo)
            {
                var grupo = await _grupoRepository.GetByIdAsync(miembro.IdGrupo);
                if (grupo != null)
                {
                    // Obtener todos los gastos del grupo
                    var gastos = await _gastoRepository.GetByGrupoAsync(miembro.IdGrupo);

                    decimal totalPagado = 0;
                    decimal totalAPagar = 0;

                    // Calcular lo que ha pagado
                    foreach (var gasto in gastos.Where(g => g.IdMiembroPagador == miembro.IdMiembro))
                    {
                        totalPagado += gasto.Monto;
                    }

                    // Calcular lo que debe pagar
                    foreach (var gasto in gastos)
                    {
                        var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);
                        foreach (var detalle in detalles.Where(d => d.IdMiembroDeudor == miembro.IdMiembro && !d.Pagado))
                        {
                            totalAPagar += detalle.Monto;
                        }
                    }

                    // Crear objeto de saldo
                    saldosPorGrupo.Add(new SaldoUsuarioDto
                    {
                        IdUsuario = idUsuarioGuid,
                        NombreUsuario = grupo.NombreGrupo, // Usar nombre del grupo para identificarlo
                        TotalAPagar = totalAPagar,
                        TotalPagado = totalPagado,
                        Saldo = totalPagado - totalAPagar
                    });
                }
            }

            response.Data = saldosPorGrupo;
            return response;
        }

        public async Task<ResponseDto> MarcarComoPagadoAsync(Guid idGasto, Guid idDetalle, string idUsuarioSolicitante)
        {
            var response = new ResponseDto();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Verificar que el gasto existe
            var gasto = await _gastoRepository.GetByIdAsync(idGasto);
            if (gasto == null)
            {
                response.Exito = false;
                response.Mensaje = "Gasto no encontrado";
                return response;
            }

            // Verificar que el detalle pertenece al gasto
            var detalle = await _detalleGastoRepository.GetByIdDetalleAsync(idDetalle);
            if (detalle == null || detalle.IdGasto != idGasto)
            {
                response.Exito = false;
                response.Mensaje = "Detalle no encontrado o no pertenece al gasto especificado";
                return response;
            }

            // Verificar que el usuario es el pagador o el deudor
            var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
            var miembroDeudor = await _miembroGrupoRepository.GetByIdAsync(detalle.IdMiembroDeudor);

            if ((miembroPagador == null || miembroPagador.IdUsuario != idUsuarioGuid) &&
                (miembroDeudor == null || miembroDeudor.IdUsuario != idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para marcar este detalle como pagado";
                return response;
            }

            // Marcar como pagado
            var resultado = await _detalleGastoRepository.MarcarComoPagadoAsync(idDetalle);
            if (!resultado)
            {
                response.Exito = false;
                response.Mensaje = "Error al marcar el detalle como pagado";
                return response;
            }

            response.Mensaje = "Detalle marcado como pagado correctamente";
            return response;
        }

        public async Task<ResponseDto> EliminarGastoAsync(Guid idGasto, string idUsuarioSolicitante)
        {
            var response = new ResponseDto();

            if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            // Verificar que el gasto existe
            var gasto = await _gastoRepository.GetByIdAsync(idGasto);
            if (gasto == null)
            {
                response.Exito = false;
                response.Mensaje = "Gasto no encontrado";
                return response;
            }

            // Verificar que el usuario es el que creó el gasto o es admin del grupo
            var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
            var miembroSolicitante = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, gasto.IdGrupo);

            bool esCreador = miembroPagador != null && miembroPagador.IdUsuario == idUsuarioGuid;
            bool esAdmin = miembroSolicitante != null && miembroSolicitante.Rol == "Admin";

            if (!esCreador && !esAdmin)
            {
                response.Exito = false;
                response.Mensaje = "No tienes permiso para eliminar este gasto";
                return response;
            }

            // Eliminar el gasto (los detalles se eliminarán en cascada gracias a la configuración EF)
            await _gastoRepository.DeleteAsync(gasto);

            response.Mensaje = "Gasto eliminado correctamente";
            return response;
        }

        public async Task<PaginatedResponseDto<GastoDto>> GetPaginatedByGrupoAsync(Guid idGrupo, PaginacionDto paginacion, string idUsuarioSolicitante)
        {
            var response = new PaginatedResponseDto<GastoDto>();

            try
            {
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
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

                // Verificar que el usuario es miembro del grupo
                var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, idGrupo);
                if (miembro == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No eres miembro de este grupo";
                    return response;
                }

                // Obtener los gastos paginados (ahora descomponemos la tupla correctamente)
                var (gastosPaginados, totalItems) = await _gastoRepository.GetPaginatedByGrupoAsync(
                    idGrupo,
                    paginacion.Pagina,
                    paginacion.TamanioPagina);

                // Calcular el total de páginas
                int totalPaginas = (int)Math.Ceiling(totalItems / (double)paginacion.TamanioPagina);

                // Convertir a DTOs
                var gastosDto = new List<GastoDto>();
                foreach (var gasto in gastosPaginados)
                {
                    var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
                    var usuarioPagador = miembroPagador != null ?
                        await _usuarioRepository.GetByIdAsync(miembroPagador.IdUsuario) : null;

                    gastosDto.Add(new GastoDto
                    {
                        IdGasto = gasto.IdGasto,
                        IdGrupo = gasto.IdGrupo,
                        NombreGrupo = grupo.NombreGrupo ?? string.Empty,
                        IdMiembroPagador = gasto.IdMiembroPagador,
                        NombreMiembroPagador = usuarioPagador?.Nombre ?? "Usuario desconocido",
                        Monto = gasto.Monto,
                        Descripcion = gasto.Descripcion ?? string.Empty,
                        Categoria = gasto.Categoria ?? string.Empty,
                        FechaCreacion = gasto.FechaCreacion,
                        FechaGasto = gasto.FechaGasto,
                        ComprobantePath = gasto.ComprobantePath ?? string.Empty
                    });
                }

                // Configurar la respuesta paginada
                response.Items = gastosDto;
                response.TotalItems = totalItems;
                response.PaginaActual = paginacion.Pagina;
                response.ItemsPorPagina = paginacion.TamanioPagina;
                response.TotalPaginas = totalPaginas;
                response.Exito = true;

                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener gastos: {ex.Message}";
                response.Items = new List<GastoDto>();
                return response;
            }
        }
    }
}