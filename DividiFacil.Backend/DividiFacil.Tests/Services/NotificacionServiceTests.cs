using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DividiFacil.Services.Implementations;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Notificacion;
using DividiFacil.Domain.Models;
using DividiFacil.Data.Repositories.Interfaces;

namespace DividiFacil.Tests.Services
{
    public class NotificacionServiceTests
    {
        private readonly Mock<INotificacionRepository> _mockNotiRepo = new();
        private readonly Mock<IConfiguracionNotificacionesRepository> _mockConfigRepo = new();
        private readonly Mock<IPagoRepository> _mockPagoRepo = new();
        private readonly Mock<IGastoRepository> _mockGastoRepo = new();
        private readonly Mock<IGrupoRepository> _mockGrupoRepo = new();
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepo = new();
        private readonly Mock<IMiembroGrupoRepository> _mockMiembroGrupoRepo = new();

        private readonly NotificacionService _service;

        public NotificacionServiceTests()
        {
            _service = new NotificacionService(
                _mockNotiRepo.Object,
                _mockConfigRepo.Object,
                _mockPagoRepo.Object,
                _mockGastoRepo.Object,
                _mockGrupoRepo.Object,
                _mockUsuarioRepo.Object,
                _mockMiembroGrupoRepo.Object
            );
        }

        [Fact]
        public async Task GetNotificacionesPendientesByUsuarioAsync_IdInvalido_RetornaError()
        {
            var result = await _service.GetNotificacionesPendientesByUsuarioAsync("no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task GetNotificacionesPendientesByUsuarioAsync_UsuarioValido_ListaOk()
        {
            var userId = Guid.NewGuid();
            _mockNotiRepo.Setup(x => x.GetPendientesByUsuarioAsync(userId)).ReturnsAsync(new List<Notificacion>
            {
                new Notificacion { IdNotificacion = Guid.NewGuid(), IdUsuario = userId, Estado = "Pendiente", FechaCreacion = DateTime.UtcNow, Mensaje = "Hola" }
            });

            var result = await _service.GetNotificacionesPendientesByUsuarioAsync(userId.ToString());
            Assert.True(result.Exito);
            Assert.NotEmpty(result.Data);
        }

        [Fact]
        public async Task GetByGrupoAsync_IdUsuarioInvalido_RetornaError()
        {
            var result = await _service.GetByGrupoAsync(Guid.NewGuid(), "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task GetByGrupoAsync_GrupoYUsuarioOK_RetornaLista()
        {
            var grupoId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid().ToString();
            _mockNotiRepo.Setup(r => r.GetByGrupoAsync(grupoId)).ReturnsAsync(new List<Notificacion>
            {
                new Notificacion { IdNotificacion = Guid.NewGuid(), IdUsuario = Guid.NewGuid(), IdGrupo = grupoId, Estado = "Pendiente", FechaCreacion = DateTime.UtcNow }
            });

            var result = await _service.GetByGrupoAsync(grupoId, usuarioId);

            Assert.True(result.Exito);
            Assert.NotNull(result.Data);
        }

        [Fact]
        public async Task MarcarComoEnviadaAsync_IdUsuarioInvalido_RetornaError()
        {
            var result = await _service.MarcarComoEnviadaAsync(Guid.NewGuid(), "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoEnviadaAsync_NotiNoExiste_RetornaError()
        {
            _mockNotiRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Notificacion)null);
            var result = await _service.MarcarComoEnviadaAsync(Guid.NewGuid(), Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoEnviadaAsync_PermisoDenegado_RetornaError()
        {
            var noti = new Notificacion { IdUsuario = Guid.NewGuid() };
            _mockNotiRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(noti);
            var otraPersona = Guid.NewGuid();
            var result = await _service.MarcarComoEnviadaAsync(Guid.NewGuid(), otraPersona.ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoEnviadaAsync_Ok_ActualizaYGuarda()
        {
            var userId = Guid.NewGuid();
            var noti = new Notificacion { IdUsuario = userId };
            _mockNotiRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(noti);
            var result = await _service.MarcarComoEnviadaAsync(Guid.NewGuid(), userId.ToString());
            Assert.True(result.Exito);
            Assert.Equal("Enviado", noti.Estado);
            _mockNotiRepo.Verify(r => r.UpdateAsync(noti), Times.Once);
            _mockNotiRepo.Verify(r => r.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task CrearNotificacionPagoAsync_PagoNoExiste_NoCrea()
        {
            _mockPagoRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Pago)null);

            await _service.CrearNotificacionPagoAsync(Guid.NewGuid(), "Creado");

            _mockNotiRepo.Verify(r => r.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task CrearNotificacionPagoAsync_PagadorONull_NoCrea()
        {
            var pagoId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdPagador = Guid.NewGuid(), IdReceptor = Guid.NewGuid() };
            _mockPagoRepo.Setup(r => r.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(pago.IdPagador)).ReturnsAsync((Usuario)null);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(pago.IdReceptor)).ReturnsAsync(new Usuario { IdUsuario = pago.IdReceptor });

            await _service.CrearNotificacionPagoAsync(pagoId, "Creado");

            _mockNotiRepo.Verify(r => r.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task CrearNotificacionPagoAsync_ReceptorSinNotificaciones_NoCrea()
        {
            var pagoId = Guid.NewGuid();
            var pagador = new Usuario { IdUsuario = Guid.NewGuid(), Nombre = "Pagador" };
            var receptor = new Usuario { IdUsuario = Guid.NewGuid(), Nombre = "Receptor" };
            var pago = new Pago { IdPago = pagoId, IdPagador = pagador.IdUsuario, IdReceptor = receptor.IdUsuario, Monto = 123, IdGrupo = Guid.NewGuid() };
            _mockPagoRepo.Setup(r => r.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(pagador.IdUsuario)).ReturnsAsync(pagador);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(receptor.IdUsuario)).ReturnsAsync(receptor);
            _mockConfigRepo.Setup(r => r.GetByUsuarioAsync(receptor.IdUsuario)).ReturnsAsync(new ConfiguracionNotificaciones { NotificarNuevosPagos = false });

            await _service.CrearNotificacionPagoAsync(pagoId, "Creado");

            _mockNotiRepo.Verify(r => r.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task CrearNotificacionPagoAsync_TodoValido_CreaNotificacion()
        {
            var pagoId = Guid.NewGuid();
            var pagador = new Usuario { IdUsuario = Guid.NewGuid(), Nombre = "Pagador" };
            var receptor = new Usuario { IdUsuario = Guid.NewGuid(), Nombre = "Receptor" };
            var pago = new Pago { IdPago = pagoId, IdPagador = pagador.IdUsuario, IdReceptor = receptor.IdUsuario, Monto = 123, IdGrupo = Guid.NewGuid() };
            _mockPagoRepo.Setup(r => r.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(pagador.IdUsuario)).ReturnsAsync(pagador);
            _mockUsuarioRepo.Setup(r => r.GetByIdAsync(receptor.IdUsuario)).ReturnsAsync(receptor);
            _mockConfigRepo.Setup(r => r.GetByUsuarioAsync(receptor.IdUsuario)).ReturnsAsync(new ConfiguracionNotificaciones { NotificarNuevosPagos = true });

            await _service.CrearNotificacionPagoAsync(pagoId, "Creado");

            _mockNotiRepo.Verify(r => r.CreateAsync(It.IsAny<Notificacion>()), Times.Once);
            _mockNotiRepo.Verify(r => r.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task CrearNotificacionGastoAsync_GastoNoExiste_NoCrea()
        {
            _mockGastoRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Gasto)null);
            await _service.CrearNotificacionGastoAsync(Guid.NewGuid());
            _mockNotiRepo.Verify(x => x.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task CrearNotificacionGrupoAsync_GrupoNoExiste_NoCrea()
        {
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Grupo)null);
            await _service.CrearNotificacionGrupoAsync(Guid.NewGuid(), Guid.NewGuid(), "Mensaje", "Invitacion");
            _mockNotiRepo.Verify(x => x.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task CrearNotificacionGrupoAsync_UsuarioNoExiste_NoCrea()
        {
            var grupoId = Guid.NewGuid();
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(grupoId)).ReturnsAsync(new Grupo { IdGrupo = grupoId });
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Usuario)null);
            await _service.CrearNotificacionGrupoAsync(grupoId, Guid.NewGuid(), "Mensaje", "Invitacion");
            _mockNotiRepo.Verify(x => x.CreateAsync(It.IsAny<Notificacion>()), Times.Never);
        }

        [Fact]
        public async Task GetConfiguracionByUsuarioAsync_IdInvalido_RetornaError()
        {
            var result = await _service.GetConfiguracionByUsuarioAsync("no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task GetConfiguracionByUsuarioAsync_SiNoExiste_CreaYRetornaDefault()
        {
            var userId = Guid.NewGuid();
            _mockConfigRepo.Setup(x => x.GetByUsuarioAsync(userId)).ReturnsAsync((ConfiguracionNotificaciones)null);

            var result = await _service.GetConfiguracionByUsuarioAsync(userId.ToString());
            Assert.True(result.Exito);
            Assert.NotNull(result.Data);
            _mockConfigRepo.Verify(x => x.CreateAsync(It.IsAny<ConfiguracionNotificaciones>()), Times.Once);
            _mockConfigRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task ActualizarConfiguracionAsync_IdUsuarioInvalido_RetornaError()
        {
            var configDto = new ConfiguracionNotificacionesDto();
            var result = await _service.ActualizarConfiguracionAsync(configDto, "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task ActualizarConfiguracionAsync_IdUsuarioNoCoincide_RetornaError()
        {
            var configDto = new ConfiguracionNotificacionesDto { IdUsuario = Guid.NewGuid() };
            var otroUser = Guid.NewGuid().ToString();
            var result = await _service.ActualizarConfiguracionAsync(configDto, otroUser);
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task ActualizarConfiguracionAsync_NoExiste_CreaYActualiza()
        {
            var userId = Guid.NewGuid();
            var configDto = new ConfiguracionNotificacionesDto
            {
                IdUsuario = userId,
                IdConfiguracion = Guid.NewGuid(),
                NotificarNuevosPagos = true,
                NotificarNuevosGastos = true,
                NotificarInvitacionesGrupo = true,
                NotificarCambiosEstadoPagos = true,
                RecordatoriosDeudas = true,
                RecordatoriosPagos = true,
                FrecuenciaRecordatorios = "Semanal"
            };
            _mockConfigRepo.Setup(x => x.GetByIdAsync(configDto.IdConfiguracion)).ReturnsAsync((ConfiguracionNotificaciones)null);

            var result = await _service.ActualizarConfiguracionAsync(configDto, userId.ToString());
            Assert.True(result.Exito);
            _mockConfigRepo.Verify(x => x.CreateAsync(It.IsAny<ConfiguracionNotificaciones>()), Times.Once);
            _mockConfigRepo.Verify(x => x.UpdateAsync(It.IsAny<ConfiguracionNotificaciones>()), Times.Once);
            _mockConfigRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task EnviarNotificacionesPendientesAsync_NoPendientes_NoLlamaNada()
        {
            _mockNotiRepo.Setup(x => x.GetAllPendientesAsync()).ReturnsAsync(new List<Notificacion>());
            await _service.EnviarNotificacionesPendientesAsync();
            _mockNotiRepo.Verify(x => x.UpdateAsync(It.IsAny<Notificacion>()), Times.Never);
            _mockNotiRepo.Verify(x => x.SaveAsync(), Times.Never);
        }

        // Puedes agregar más tests para otros escenarios edge o métodos internos relevantes.
    }
}