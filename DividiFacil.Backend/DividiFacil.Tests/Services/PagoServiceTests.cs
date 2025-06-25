using Xunit;
using Moq;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using DividiFacil.Services.Implementations;
using DividiFacil.Domain.DTOs.Pago;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.Models;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Services.Interfaces;

namespace DividiFacil.Tests.Services
{
    public class PagoServiceTests
    {
        private readonly Mock<IPagoRepository> _mockPagoRepo = new();
        private readonly Mock<IMiembroGrupoRepository> _mockMiembroGrupoRepo = new();
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepo = new();
        private readonly Mock<IGrupoRepository> _mockGrupoRepo = new();
        private readonly Mock<IDetalleGastoRepository> _mockDetalleGastoRepo = new();
        private readonly Mock<INotificacionService> _mockNotificacionService = new();
        private readonly Mock<IRecordatorioService> _mockRecordatorioService = new();

        private readonly PagoService _service;

        public PagoServiceTests()
        {
            _service = new PagoService(
                _mockPagoRepo.Object,
                _mockMiembroGrupoRepo.Object,
                _mockUsuarioRepo.Object,
                _mockGrupoRepo.Object,
                _mockDetalleGastoRepo.Object,
                _mockNotificacionService.Object,
                _mockRecordatorioService.Object
            );
        }

        [Fact]
        public async Task CrearPagoAsync_UsuarioPagadorInvalido_RetornaError()
        {
            var pagoDto = new PagoCreacionDto
            {
                IdReceptor = Guid.NewGuid(),
                IdGrupo = Guid.NewGuid(),
                Monto = 100,
                Concepto = "Test"
            };
            var result = await _service.CrearPagoAsync(pagoDto, "no-es-guid");
            Assert.False(result.Exito);
            Assert.Contains("inválido", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task CrearPagoAsync_UsuarioPagadorNoExiste_RetornaError()
        {
            var pagadorGuid = Guid.NewGuid();
            var pagoDto = new PagoCreacionDto { IdReceptor = Guid.NewGuid(), IdGrupo = Guid.NewGuid(), Monto = 100, Concepto = "Test" };
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Usuario)null);
            var result = await _service.CrearPagoAsync(pagoDto, pagadorGuid.ToString());
            Assert.False(result.Exito);
            Assert.Contains("pagador no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task CrearPagoAsync_UsuarioReceptorNoExiste_RetornaError()
        {
            var pagadorGuid = Guid.NewGuid();
            var receptorGuid = Guid.NewGuid();
            var grupoGuid = Guid.NewGuid();
            var pagoDto = new PagoCreacionDto { IdReceptor = receptorGuid, IdGrupo = grupoGuid, Monto = 100, Concepto = "Test" };
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(pagadorGuid)).ReturnsAsync(new Usuario { IdUsuario = pagadorGuid });
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(receptorGuid)).ReturnsAsync((Usuario)null);
            var result = await _service.CrearPagoAsync(pagoDto, pagadorGuid.ToString());
            Assert.False(result.Exito);
            Assert.Contains("receptor no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task CrearPagoAsync_GrupoNoExiste_RetornaError()
        {
            var pagadorGuid = Guid.NewGuid();
            var receptorGuid = Guid.NewGuid();
            var grupoGuid = Guid.NewGuid();
            var pagoDto = new PagoCreacionDto { IdReceptor = receptorGuid, IdGrupo = grupoGuid, Monto = 100, Concepto = "Test" };
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(pagadorGuid)).ReturnsAsync(new Usuario { IdUsuario = pagadorGuid });
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(receptorGuid)).ReturnsAsync(new Usuario { IdUsuario = receptorGuid });
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(grupoGuid)).ReturnsAsync((Grupo)null);
            var result = await _service.CrearPagoAsync(pagoDto, pagadorGuid.ToString());
            Assert.False(result.Exito);
            Assert.Contains("grupo no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task CrearPagoAsync_NoEsMiembroDelGrupo_RetornaError()
        {
            var pagadorGuid = Guid.NewGuid();
            var receptorGuid = Guid.NewGuid();
            var grupoGuid = Guid.NewGuid();
            var pagoDto = new PagoCreacionDto { IdReceptor = receptorGuid, IdGrupo = grupoGuid, Monto = 100, Concepto = "Test" };

            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(pagadorGuid)).ReturnsAsync(new Usuario { IdUsuario = pagadorGuid });
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(receptorGuid)).ReturnsAsync(new Usuario { IdUsuario = receptorGuid });
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(grupoGuid)).ReturnsAsync(new Grupo { IdGrupo = grupoGuid });
            _mockMiembroGrupoRepo.Setup(x => x.GetByUsuarioYGrupoAsync(pagadorGuid, grupoGuid)).ReturnsAsync((MiembroGrupo)null);

            var result = await _service.CrearPagoAsync(pagoDto, pagadorGuid.ToString());
            Assert.False(result.Exito);
            Assert.Contains("no eres miembro", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task CrearPagoAsync_TodoValido_CreaPago()
        {
            var pagadorGuid = Guid.NewGuid();
            var receptorGuid = Guid.NewGuid();
            var grupoGuid = Guid.NewGuid();
            var pagoDto = new PagoCreacionDto { IdReceptor = receptorGuid, IdGrupo = grupoGuid, Monto = 100, Concepto = "Test" };
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(pagadorGuid)).ReturnsAsync(new Usuario { IdUsuario = pagadorGuid });
            _mockUsuarioRepo.Setup(x => x.GetByIdAsync(receptorGuid)).ReturnsAsync(new Usuario { IdUsuario = receptorGuid });
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(grupoGuid)).ReturnsAsync(new Grupo { IdGrupo = grupoGuid, NombreGrupo = "Grupo" });
            _mockMiembroGrupoRepo.Setup(x => x.GetByUsuarioYGrupoAsync(pagadorGuid, grupoGuid)).ReturnsAsync(new MiembroGrupo { IdUsuario = pagadorGuid });
            _mockMiembroGrupoRepo.Setup(x => x.GetByUsuarioYGrupoAsync(receptorGuid, grupoGuid)).ReturnsAsync(new MiembroGrupo { IdUsuario = receptorGuid });

            var result = await _service.CrearPagoAsync(pagoDto, pagadorGuid.ToString());
            Assert.True(result.Exito);
            Assert.NotNull(result.Data);
            Assert.Equal("Test", result.Data.Concepto);
            _mockPagoRepo.Verify(x => x.CreateAsync(It.IsAny<Pago>()), Times.Once);
            _mockNotificacionService.Verify(x => x.CrearNotificacionPagoAsync(It.IsAny<Guid>(), "Creado"), Times.Once);
            _mockRecordatorioService.Verify(x => x.CrearRecordatorioPagoAsync(It.IsAny<Guid>()), Times.Once);
        }

        [Fact]
        public async Task ConfirmarPagoAsync_PagoNoExiste_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync((Pago)null);
            var result = await _service.ConfirmarPagoAsync(pagoId, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
            Assert.Contains("no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task ConfirmarPagoAsync_UsuarioNoEsReceptor_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdReceptor = Guid.NewGuid(), Estado = "Pendiente" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            var result = await _service.ConfirmarPagoAsync(pagoId, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
            Assert.Contains("solo el receptor", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task ConfirmarPagoAsync_PagoNoPendiente_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            var receptorId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdReceptor = receptorId, Estado = "Rechazado" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            var result = await _service.ConfirmarPagoAsync(pagoId, receptorId.ToString());
            Assert.False(result.Exito);
            Assert.Contains("no se puede confirmar", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task ConfirmarPagoAsync_TodoValido_ConfirmaPago()
        {
            var pagoId = Guid.NewGuid();
            var receptorId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdReceptor = receptorId, Estado = "Pendiente" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);

            var result = await _service.ConfirmarPagoAsync(pagoId, receptorId.ToString());

            Assert.True(result.Exito);
            _mockPagoRepo.Verify(x => x.UpdateAsync(It.IsAny<Pago>()), Times.Once);
            _mockNotificacionService.Verify(x => x.CrearNotificacionPagoAsync(pagoId, "Confirmado"), Times.Once);
        }

        [Fact]
        public async Task RechazarPagoAsync_TodoValido_RechazaPago()
        {
            var pagoId = Guid.NewGuid();
            var receptorId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdReceptor = receptorId, Estado = "Pendiente" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);

            var result = await _service.RechazarPagoAsync(pagoId, receptorId.ToString(), "Motivo");

            Assert.True(result.Exito);
            Assert.Equal("Rechazado", pago.Estado);
            Assert.Equal("Motivo", pago.MotivoRechazo);
            _mockPagoRepo.Verify(x => x.UpdateAsync(It.IsAny<Pago>()), Times.Once);
            _mockNotificacionService.Verify(x => x.CrearNotificacionPagoAsync(pagoId, "Rechazado"), Times.Once);
        }

        [Fact]
        public async Task EliminarPagoAsync_PagoNoExiste_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync((Pago)null);
            var result = await _service.EliminarPagoAsync(pagoId, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
            Assert.Contains("no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task EliminarPagoAsync_NoEsPagadorNiAdmin_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdPagador = Guid.NewGuid(), IdGrupo = Guid.NewGuid(), Estado = "Pendiente" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);
            _mockMiembroGrupoRepo.Setup(x => x.GetByUsuarioYGrupoAsync(usuarioId, pago.IdGrupo)).ReturnsAsync(new MiembroGrupo { Rol = "Miembro" });
            var result = await _service.EliminarPagoAsync(pagoId, usuarioId.ToString());
            Assert.False(result.Exito);
            Assert.Contains("permiso", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task GetByIdAsync_PagoNoExiste_RetornaError()
        {
            var pagoId = Guid.NewGuid();
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync((Pago)null);
            var result = await _service.GetByIdAsync(pagoId, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
            Assert.Contains("no encontrado", result.Mensaje, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task EliminarPagoAsync_EsPagador_Elimina()
        {
            var pagoId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid();
            var pago = new Pago { IdPago = pagoId, IdPagador = usuarioId, IdGrupo = Guid.NewGuid(), Estado = "Pendiente" };
            _mockPagoRepo.Setup(x => x.GetByIdAsync(pagoId)).ReturnsAsync(pago);

            var result = await _service.EliminarPagoAsync(pagoId, usuarioId.ToString());
            Assert.True(result.Exito);
            _mockPagoRepo.Verify(x => x.DeleteAsync(pagoId), Times.Once);
        }


    }
}