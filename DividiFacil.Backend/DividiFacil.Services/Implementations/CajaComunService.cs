using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.CajaComun;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class CajaComunService : ICajaComunService
    {
        private readonly ICajaComunRepository _cajaComunRepository;
        private readonly IGrupoRepository _grupoRepository;
        private readonly IUsuarioRepository _usuarioRepository; 

        public CajaComunService(
            ICajaComunRepository cajaComunRepository,
            IGrupoRepository grupoRepository,
            IUsuarioRepository usuarioRepository) 
        {
            _cajaComunRepository = cajaComunRepository;
            _grupoRepository = grupoRepository;
            _usuarioRepository = usuarioRepository;
        }

        public async Task<ResponseDto<CajaComunDto>> GetByGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<CajaComunDto>();

            try
            {
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

                // ✅ CALCULAR TOTALES REALES
                var movimientos = await _cajaComunRepository.GetMovimientosAsync(caja.IdCaja);
                var totalIngresos = movimientos.Where(m => m.TipoMovimiento == "Ingreso").Sum(m => m.Monto);
                var totalEgresos = movimientos.Where(m => m.TipoMovimiento == "Egreso").Sum(m => m.Monto);

                response.Data = new CajaComunDto
                {
                    IdCaja = caja.IdCaja,
                    IdGrupo = caja.IdGrupo,
                    NombreGrupo = caja.Grupo?.NombreGrupo ?? "Grupo",
                    Saldo = caja.Saldo,
                    FechaCreacion = caja.FechaCreacion,
                    TotalIngresos = totalIngresos,
                    TotalEgresos = totalEgresos
                };

                response.Exito = true;
                response.Mensaje = "Caja común obtenida exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener caja común: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<CajaComunDto>> CrearCajaComunAsync(Guid idGrupo, string idUsuarioAdmin)
        {
            var response = new ResponseDto<CajaComunDto>();

            try
            {
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

                response.Exito = true;
                response.Mensaje = "Caja común creada exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al crear caja común: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<IEnumerable<MovimientoCajaDto>>> GetMovimientosAsync(Guid idCaja, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<IEnumerable<MovimientoCajaDto>>();

            try
            {
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var caja = await _cajaComunRepository.GetByIdAsync(idCaja);
                if (caja == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Caja común no encontrada";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                bool esMiembro = await _grupoRepository.EsMiembroAsync(idUsuario, caja.IdGrupo);
                if (!esMiembro)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para ver los movimientos de esta caja común";
                    return response;
                }

                var movimientos = await _cajaComunRepository.GetMovimientosAsync(idCaja);
                
                var movimientosDto = movimientos.Select(m => new MovimientoCajaDto
                {
                    IdMovimiento = m.IdMovimiento,
                    IdCaja = m.IdCaja,
                    IdUsuario = m.IdUsuario,
                    NombreUsuario = m.Usuario?.Nombre ?? "Usuario desconocido",
                    Monto = m.Monto,
                    TipoMovimiento = m.TipoMovimiento,
                    Concepto = m.Concepto,
                    Fecha = m.Fecha,
                    ComprobantePath = m.ComprobantePath
                }).ToList();

                response.Data = movimientosDto;
                response.Exito = true;
                response.Mensaje = "Movimientos obtenidos exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener movimientos: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<MovimientoCajaDto>> RegistrarMovimientoAsync(MovimientoCajaCreacionDto movimientoDto, string idUsuarioCreador)
        {
            var response = new ResponseDto<MovimientoCajaDto>();

            try
            {
                if (!Guid.TryParse(idUsuarioCreador, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var caja = await _cajaComunRepository.GetByIdAsync(movimientoDto.IdCaja);
                if (caja == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Caja común no encontrada";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                bool esMiembro = await _grupoRepository.EsMiembroAsync(idUsuario, caja.IdGrupo);
                if (!esMiembro)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para registrar movimientos en esta caja común";
                    return response;
                }

                // Validar datos
                if (movimientoDto.Monto <= 0)
                {
                    response.Exito = false;
                    response.Mensaje = "El monto debe ser mayor a cero";
                    return response;
                }

                if (string.IsNullOrWhiteSpace(movimientoDto.Concepto))
                {
                    response.Exito = false;
                    response.Mensaje = "El concepto es requerido";
                    return response;
                }

                // Validar el tipo de movimiento
                if (movimientoDto.TipoMovimiento != "Ingreso" && movimientoDto.TipoMovimiento != "Egreso")
                {
                    response.Exito = false;
                    response.Mensaje = "El tipo de movimiento debe ser 'Ingreso' o 'Egreso'";
                    return response;
                }

                // Validar saldo para egresos
                if (movimientoDto.TipoMovimiento == "Egreso" && caja.Saldo < movimientoDto.Monto)
                {
                    response.Exito = false;
                    response.Mensaje = "Saldo insuficiente en la caja común";
                    return response;
                }

                var movimiento = new MovimientoCaja
                {
                    IdMovimiento = Guid.NewGuid(),
                    IdCaja = movimientoDto.IdCaja,
                    IdUsuario = idUsuario,
                    Monto = movimientoDto.Monto,
                    TipoMovimiento = movimientoDto.TipoMovimiento,
                    Concepto = movimientoDto.Concepto.Trim(),
                    Fecha = DateTime.UtcNow
                };

                await _cajaComunRepository.RegistrarMovimientoAsync(movimiento);

                // Actualizar saldo de la caja
                if (movimientoDto.TipoMovimiento == "Ingreso")
                {
                    caja.Saldo += movimientoDto.Monto;
                }
                else
                {
                    caja.Saldo -= movimientoDto.Monto;
                }

                await _cajaComunRepository.UpdateAsync(caja);
                await _cajaComunRepository.SaveAsync();

                var usuario = await _usuarioRepository.GetByIdAsync(idUsuario);

                response.Data = new MovimientoCajaDto
                {
                    IdMovimiento = movimiento.IdMovimiento,
                    IdCaja = movimiento.IdCaja,
                    IdUsuario = movimiento.IdUsuario,
                    NombreUsuario = usuario?.Nombre ?? "Usuario desconocido",
                    Monto = movimiento.Monto,
                    TipoMovimiento = movimiento.TipoMovimiento,
                    Concepto = movimiento.Concepto,
                    Fecha = movimiento.Fecha
                };

                response.Exito = true;
                response.Mensaje = "Movimiento registrado exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al registrar movimiento: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto> EliminarMovimientoAsync(Guid idMovimiento, string idUsuarioSolicitante)
        {
            var response = new ResponseDto();

            try
            {
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuario))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var movimiento = await _cajaComunRepository.GetMovimientoByIdAsync(idMovimiento);
                if (movimiento == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Movimiento no encontrado";
                    return response;
                }

                var caja = await _cajaComunRepository.GetByIdAsync(movimiento.IdCaja);
                if (caja == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Caja común no encontrada";
                    return response;
                }

                // Verificar permisos (solo el creador o admin puede eliminar)
                bool esCreador = movimiento.IdUsuario == idUsuario;
                bool esAdmin = await _grupoRepository.EsAdminAsync(idUsuario, caja.IdGrupo);

                if (!esCreador && !esAdmin)
                {
                    response.Exito = false;
                    response.Mensaje = "No tienes permiso para eliminar este movimiento";
                    return response;
                }

                // Revertir el saldo de la caja
                if (movimiento.TipoMovimiento == "Ingreso")
                {
                    caja.Saldo -= movimiento.Monto;
                }
                else
                {
                    caja.Saldo += movimiento.Monto;
                }

                await _cajaComunRepository.EliminarMovimientoAsync(idMovimiento);
                await _cajaComunRepository.UpdateAsync(caja);
                await _cajaComunRepository.SaveAsync();

                response.Exito = true;
                response.Mensaje = "Movimiento eliminado exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al eliminar movimiento: {ex.Message}";
                return response;
            }
        }
    }
}