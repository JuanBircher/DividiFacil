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

        public BalanceService(
            IGrupoRepository grupoRepository,
            IMiembroGrupoRepository miembroGrupoRepository,
            IGastoRepository gastoRepository,
            IUsuarioRepository usuarioRepository,
            IDetalleGastoRepository detalleGastoRepository)
        {
            _grupoRepository = grupoRepository;
            _miembroGrupoRepository = miembroGrupoRepository;
            _gastoRepository = gastoRepository;
            _usuarioRepository = usuarioRepository;
            _detalleGastoRepository = detalleGastoRepository;
        }

        public async Task<ResponseDto<BalanceGrupoDto>> CalcularBalanceGrupoAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var response = new ResponseDto<BalanceGrupoDto>();

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
            var miembrosDict = miembros.ToDictionary(m => m.IdMiembro);

            // Obtener todos los gastos del grupo
            var gastos = await _gastoRepository.GetByGrupoAsync(idGrupo);
            var totalGastos = gastos.Sum(g => g.Monto);

            // Calcular lo que cada usuario ha pagado y lo que debería haber pagado
            var balancesMiembros = new Dictionary<Guid, BalanceUsuarioDto>();

            // Inicializar balances para todos los miembros
            foreach (var m in miembros)
            {
                var usuario = await _usuarioRepository.GetByIdAsync(m.IdUsuario);
                balancesMiembros[m.IdMiembro] = new BalanceUsuarioDto
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
                if (miembrosDict.ContainsKey(gasto.IdMiembroPagador))
                {
                    balancesMiembros[gasto.IdMiembroPagador].TotalPagado += gasto.Monto;
                }

                // Obtener detalles de quién debe qué
                var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);

                foreach (var detalle in detalles)
                {
                    if (miembrosDict.ContainsKey(detalle.IdMiembroDeudor))
                    {
                        balancesMiembros[detalle.IdMiembroDeudor].DeberiaHaberPagado += detalle.Monto;
                    }
                }
            }

            // Calcular balance final para cada miembro
            foreach (var balance in balancesMiembros.Values)
            {
                balance.Balance = balance.TotalPagado - balance.DeberiaHaberPagado;
            }

            // Crear estructura de deudas detalladas
            var deudasDetalladas = new Dictionary<(Guid, Guid), DeudaDetalladaDto>();

            foreach (var gasto in gastos)
            {
                var detalles = await _detalleGastoRepository.GetByGastoAsync(gasto.IdGasto);

                foreach (var detalle in detalles.Where(d => !d.Pagado))
                {
                    if (detalle.IdMiembroDeudor == gasto.IdMiembroPagador)
                        continue; // Si el deudor es el mismo que pagó, no hay deuda

                    var key = (detalle.IdMiembroDeudor, gasto.IdMiembroPagador);

                    if (!deudasDetalladas.ContainsKey(key))
                    {
                        if (miembrosDict.TryGetValue(detalle.IdMiembroDeudor, out var miembroDeudor) &&
                            miembrosDict.TryGetValue(gasto.IdMiembroPagador, out var miembroAcreedor))
                        {
                            var usuarioDeudor = await _usuarioRepository.GetByIdAsync(miembroDeudor.IdUsuario);
                            var usuarioAcreedor = await _usuarioRepository.GetByIdAsync(miembroAcreedor.IdUsuario);

                            var deudaDetallada = new DeudaDetalladaDto
                            {
                                IdUsuarioDeudor = miembroDeudor.IdUsuario,
                                NombreUsuarioDeudor = usuarioDeudor?.Nombre ?? "Usuario desconocido",
                                IdUsuarioAcreedor = miembroAcreedor.IdUsuario,
                                NombreUsuarioAcreedor = usuarioAcreedor?.Nombre ?? "Usuario desconocido",
                                Monto = 0,
                                Origenes = new List<DeudaOrigenDto>()
                            };

                            deudasDetalladas[key] = deudaDetallada;
                        }
                    }

                    if (deudasDetalladas.TryGetValue(key, out var deudaActual))
                    {
                        deudaActual.Monto += detalle.Monto;
                        deudaActual.Origenes.Add(new DeudaOrigenDto
                        {
                            IdGasto = gasto.IdGasto,
                            DescripcionGasto = gasto.Descripcion,
                            FechaGasto = gasto.FechaCreacion,
                            MontoOriginal = detalle.Monto
                        });
                    }
                }
            }

            // Asignar deudas detalladas a los usuarios correspondientes
            foreach (var deudaDetallada in deudasDetalladas.Values)
            {
                foreach (var m in miembros)
                {
                    if (m.IdUsuario == deudaDetallada.IdUsuarioDeudor)
                    {
                        balancesMiembros[m.IdMiembro].DeudasDetalladas.Add(deudaDetallada);
                        break;
                    }
                }
            }

            // Calcular deudas simplificadas
            var deudasSimplificadas = await SimplificarDeudasGrupoAsync(balancesMiembros.Values.ToList());

            // Crear respuesta final
            response.Data = new BalanceGrupoDto
            {
                IdGrupo = grupo.IdGrupo,
                NombreGrupo = grupo.NombreGrupo,
                TotalGastos = totalGastos,
                BalancesUsuarios = balancesMiembros.Values.ToList(),
                DeudasSimplificadas = deudasSimplificadas
            };

            return response;
        }

        public async Task<ResponseDto<List<DeudaSimplificadaDto>>> SimplificarDeudasAsync(Guid idGrupo, string idUsuarioSolicitante)
        {
            var responseBalance = await CalcularBalanceGrupoAsync(idGrupo, idUsuarioSolicitante);
            var response = new ResponseDto<List<DeudaSimplificadaDto>>();

            if (!responseBalance.Exito)
            {
                response.Exito = false;
                response.Mensaje = responseBalance.Mensaje;
                return response;
            }

            response.Data = responseBalance.Data.DeudasSimplificadas;
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
                if (balanceGrupo.Exito)
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
                            DeudasDetalladas = balanceUsuario.DeudasDetalladas
                        };

                        balances.Add(nuevoBalance);
                    }
                }
            }

            response.Data = balances;
            return response;
        }
    }
}