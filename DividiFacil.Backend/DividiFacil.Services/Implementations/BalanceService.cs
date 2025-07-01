using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Balance;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class BalanceService : IBalanceService
    {
        private readonly IGrupoRepository _grupoRepository;
        private readonly IMiembroGrupoRepository _miembroGrupoRepository;
        private readonly IGastoRepository _gastoRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IDetalleGastoRepository _detalleGastoRepository;
        private readonly IPagoRepository _pagoRepository;

        public BalanceService(
            IGrupoRepository grupoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IGastoRepository gastoRepository,
            IUsuarioRepository usuarioRepository,
            IDetalleGastoRepository detalleGastoRepository,
            IPagoRepository pagoRepository)
        {
            _grupoRepository = grupoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _gastoRepository = gastoRepository;
            _usuarioRepository = usuarioRepository;
            _detalleGastoRepository = detalleGastoRepository;
            _pagoRepository = pagoRepository;
        }

        public async Task<ResponseDto<List<MovimientoDto>>> ObtenerHistorialMovimientosAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<List<MovimientoDto>>();

            try
            {
                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, idGrupo);
                if (miembro == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No eres miembro de este grupo";
                    return response;
                }

                var movimientos = new List<MovimientoDto>();

                // Obtener todos los gastos del grupo
                var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
                foreach (var gasto in gastos)
                {
                    // ✅ CORRECTO: Modelo Gasto tiene IdMiembroPagador
                    var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
                    var usuarioPagador = miembroPagador != null ? 
                        await _usuarioRepository.GetByIdAsync(miembroPagador.IdUsuario) : null;

                    if (usuarioPagador != null)
                    {
                        movimientos.Add(new MovimientoDto
                        {
                            IdMovimiento = gasto.IdGasto,
                            TipoMovimiento = "Gasto",
                            Concepto = gasto.Descripcion,
                            FechaCreacion = gasto.FechaCreacion,
                            Monto = gasto.Monto,
                            Estado = "Completado",
                            IdUsuarioRelacionado = usuarioPagador.IdUsuario,
                            NombreUsuarioRelacionado = usuarioPagador.Nombre ?? "Usuario desconocido",
                            ImagenPerfilRelacionado = usuarioPagador.UrlImagen,
                            EsPropio = usuarioPagador.IdUsuario == idUsuarioGuid,
                            IdGrupo = idGrupo,
                            NombreGrupo = grupo.NombreGrupo ?? "Grupo sin nombre"
                        });
                    }
                }

                // Obtener todos los pagos del grupo
                var pagos = await _pagoRepository.GetByGrupoAsync(idGrupo);
                foreach (var pago in pagos)
                {
                    var usuarioReceptor = await _usuarioRepository.GetByIdAsync(pago.IdReceptor);

                    movimientos.Add(new MovimientoDto
                    {
                        IdMovimiento = pago.IdPago,
                        TipoMovimiento = "Pago",
                        Concepto = pago.Concepto,
                        FechaCreacion = pago.FechaCreacion,
                        Monto = pago.Monto,
                        Estado = pago.Estado,
                        IdUsuarioRelacionado = pago.IdReceptor,
                        NombreUsuarioRelacionado = usuarioReceptor?.Nombre ?? "Usuario desconocido",
                        ImagenPerfilRelacionado = usuarioReceptor?.UrlImagen,
                        EsPropio = pago.IdPagador == idUsuarioGuid || pago.IdReceptor == idUsuarioGuid,
                        IdGrupo = idGrupo,
                        NombreGrupo = grupo.NombreGrupo ?? "Grupo sin nombre"
                    });
                }

                // Ordenar movimientos por fecha (más reciente primero)
                response.Data = movimientos.OrderByDescending(m => m.FechaCreacion).ToList();
                response.Exito = true;
                response.Mensaje = "Historial obtenido exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener historial: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<BalanceGrupoDto>> CalcularBalanceGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<BalanceGrupoDto>();

            try
            {
                // Verificar que el grupo existe
                var grupo = await _grupoRepository.GetByIdAsync(idGrupo);
                if (grupo == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Grupo no encontrado";
                    return response;
                }

                // Verificar que el usuario es miembro del grupo
                if (!Guid.TryParse(idUsuarioSolicitante, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var miembro = await _miembroGrupoRepository.GetByUsuarioYGrupoAsync(idUsuarioGuid, idGrupo);
                if (miembro == null)
                {
                    response.Exito = false;
                    response.Mensaje = "No eres miembro de este grupo";
                    return response;
                }

                // Obtener todos los miembros del grupo
                var miembros = await _miembroGrupoRepository.GetMiembrosByGrupoAsync(idGrupo);

                // Obtener todos los gastos del grupo
                var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
                var totalGastos = gastos.Sum(g => g.Monto);

                // Calcular lo que cada usuario ha pagado y lo que debería haber pagado
                var balancesMiembros = new Dictionary<Guid, BalanceUsuarioDto>();

                // Inicializar balances para todos los miembros
                foreach (var m in miembros)
                {
                    var usuario = await _usuarioRepository.GetByIdAsync(m.IdUsuario);
                    balancesMiembros[m.IdUsuario] = new BalanceUsuarioDto
                    {
                        IdMiembro = m.IdMiembro,
                        IdUsuario = m.IdUsuario.ToString(),
                        NombreUsuario = usuario?.Nombre ?? "Usuario desconocido",
                        ImagenPerfil = usuario?.UrlImagen ?? "",
                        TotalPagado = 0,
                        DeberiaHaberPagado = 0,
                        Balance = 0,
                        DeudasDetalladas = new List<DeudaDetalladaDto>()
                    };
                }

                // Calcular lo que cada usuario ha pagado
                foreach (var gasto in gastos)
                {
                    // ✅ CORRECTO: Modelo Gasto tiene IdMiembroPagador
                    var miembroPagador = await _miembroGrupoRepository.GetByIdAsync(gasto.IdMiembroPagador);
                    if (miembroPagador != null && balancesMiembros.ContainsKey(miembroPagador.IdUsuario))
                    {
                        balancesMiembros[miembroPagador.IdUsuario].TotalPagado += gasto.Monto;
                    }

                    // Obtener detalles de quién debe qué
                    var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);

                    foreach (var detalle in detalles)
                    {
                        // ✅ CORRECTO: Modelo DetalleGasto tiene IdMiembroDeudor y Monto
                        var miembroDeudor = await _miembroGrupoRepository.GetByIdAsync(detalle.IdMiembroDeudor);
                        if (miembroDeudor != null && balancesMiembros.ContainsKey(miembroDeudor.IdUsuario))
                        {
                            balancesMiembros[miembroDeudor.IdUsuario].DeberiaHaberPagado += detalle.Monto;
                        }
                    }
                }

                // Calcular balance final para cada miembro
                foreach (var balance in balancesMiembros.Values)
                {
                    balance.Balance = balance.TotalPagado - balance.DeberiaHaberPagado;
                }

                // Crear estructura de deudas simplificadas
                var deudasSimplificadas = await SimplificarDeudasGrupoAsync(balancesMiembros.Values.ToList());

                // Crear respuesta final
                response.Data = new BalanceGrupoDto
                {
                    IdGrupo = grupo.IdGrupo,
                    NombreGrupo = grupo.NombreGrupo ?? "Grupo sin nombre",
                    TotalGastos = totalGastos,
                    BalancesUsuarios = balancesMiembros.Values.ToList(),
                    DeudasSimplificadas = deudasSimplificadas ?? new List<DeudaSimplificadaDto>()
                };

                response.Exito = true;
                response.Mensaje = "Balance calculado exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al calcular balance: {ex.Message}";
                return response;
            }
        }

        public async Task<ResponseDto<List<DeudaSimplificadaDto>>> SimplificarDeudasAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var responseBalance = await CalcularBalanceGrupoAsync(idGrupo, idUsuarioSolicitante);
            var response = new ResponseDto<List<DeudaSimplificadaDto>>();

            if (!responseBalance.Exito || responseBalance.Data == null)
            {
                response.Exito = false;
                response.Mensaje = responseBalance.Mensaje;
                return response;
            }

            response.Data = responseBalance.Data.DeudasSimplificadas ?? new List<DeudaSimplificadaDto>();
            response.Exito = true;
            response.Mensaje = "Deudas simplificadas obtenidas exitosamente";
            return response;
        }

        private async Task<List<DeudaSimplificadaDto>> SimplificarDeudasGrupoAsync(List<BalanceUsuarioDto> balances)
        {
            // Crear listas separadas de acreedores y deudores
            var acreedores = balances.Where(b => b.Balance > 0).OrderByDescending(b => b.Balance).ToList();
            var deudores = balances.Where(b => b.Balance < 0).OrderBy(b => b.Balance).ToList();

            var deudasSimplificadas = new List<DeudaSimplificadaDto>();

            // Algoritmo para simplificar deudas
            int i = 0, j = 0;
            while (i < deudores.Count && j < acreedores.Count)
            {
                var deudor = deudores[i];
                var acreedor = acreedores[j];

                decimal montoDeuda = Math.Min(Math.Abs(deudor.Balance), acreedor.Balance);

                if (montoDeuda > 0)
                {
                    var usuarioDeudor = await _usuarioRepository.GetByIdAsync(Guid.Parse(deudor.IdUsuario));
                    var usuarioAcreedor = await _usuarioRepository.GetByIdAsync(Guid.Parse(acreedor.IdUsuario));

                    deudasSimplificadas.Add(new DeudaSimplificadaDto
                    {
                        IdUsuarioDeudor = Guid.Parse(deudor.IdUsuario),
                        NombreUsuarioDeudor = usuarioDeudor?.Nombre ?? "Usuario desconocido",
                        ImagenPerfilDeudor = usuarioDeudor?.UrlImagen ?? "",
                        IdUsuarioAcreedor = Guid.Parse(acreedor.IdUsuario),
                        NombreUsuarioAcreedor = usuarioAcreedor?.Nombre ?? "Usuario desconocido",
                        ImagenPerfilAcreedor = usuarioAcreedor?.UrlImagen ?? "",
                        Monto = montoDeuda
                    });

                    // Actualizar balances
                    deudor.Balance += montoDeuda;
                    acreedor.Balance -= montoDeuda;
                }

                // Si el deudor ya pagó todo, pasar al siguiente
                if (Math.Abs(deudor.Balance) < 0.01m)
                    i++;

                // Si el acreedor ya recibió todo, pasar al siguiente
                if (acreedor.Balance < 0.01m)
                    j++;
            }

            return deudasSimplificadas;
        }

        public async Task<ResponseDto<List<BalanceUsuarioDto>>> ObtenerBalanceUsuarioAsync(string idUsuario)
        {
            var response = new ResponseDto<List<BalanceUsuarioDto>>();

            try
            {
                if (!Guid.TryParse(idUsuario, out var idUsuarioGuid))
                {
                    response.Exito = false;
                    response.Mensaje = "ID de usuario inválido";
                    return response;
                }

                var usuario = await _usuarioRepository.GetByIdAsync(idUsuarioGuid);
                if (usuario == null)
                {
                    response.Exito = false;
                    response.Mensaje = "Usuario no encontrado";
                    return response;
                }

                // Obtener todos los grupos a los que pertenece el usuario
                var miembrosGrupo = await _miembroGrupoRepository.GetGruposByUsuarioAsync(idUsuarioGuid);
                var balances = new List<BalanceUsuarioDto>();

                foreach (var miembro in miembrosGrupo)
                {
                    var balanceGrupo = await CalcularBalanceGrupoAsync(miembro.IdGrupo, idUsuario);
                    if (balanceGrupo.Exito && balanceGrupo.Data != null)
                    {
                        var balanceUsuario = balanceGrupo.Data.BalancesUsuarios
                            .FirstOrDefault(b => b.IdUsuario == idUsuario);

                        if (balanceUsuario != null)
                        {
                            // Agregar nombre del grupo al balance
                            var grupo = await _grupoRepository.GetByIdAsync(miembro.IdGrupo);

                            // Crear una copia del balance para evitar modificar el original
                            var nuevoBalance = new BalanceUsuarioDto
                            {
                                IdMiembro = balanceUsuario.IdMiembro,
                                IdUsuario = balanceUsuario.IdUsuario,
                                NombreUsuario = grupo?.NombreGrupo ?? "Grupo desconocido",
                                ImagenPerfil = balanceUsuario.ImagenPerfil,
                                TotalPagado = balanceUsuario.TotalPagado,
                                DeberiaHaberPagado = balanceUsuario.DeberiaHaberPagado,
                                Balance = balanceUsuario.Balance,
                                DeudasDetalladas = balanceUsuario.DeudasDetalladas ?? new List<DeudaDetalladaDto>()
                            };

                            balances.Add(nuevoBalance);
                        }
                    }
                }

                response.Data = balances;
                response.Exito = true;
                response.Mensaje = "Balance de usuario obtenido exitosamente";
                return response;
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al obtener balance de usuario: {ex.Message}";
                return response;
            }
        }
    }
}