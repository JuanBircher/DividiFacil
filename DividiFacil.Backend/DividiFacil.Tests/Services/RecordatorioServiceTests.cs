using Xunit;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DividiFacil.Services.Implementations;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.Models;
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Notificacion;

namespace DividiFacil.Tests.Services
{
    public class RecordatorioServiceTests
    {
        private readonly Mock<IRecordatorioRepository> _mockRepo = new();
        private readonly Mock<IDetalleGastoRepository> _mockDetalleRepo = new();
        private readonly Mock<IPagoRepository> _mockPagoRepo = new();
        private readonly Mock<IGastoRepository> _mockGastoRepo = new();
        private readonly Mock<IGrupoRepository> _mockGrupoRepo = new();
        private readonly Mock<IUsuarioRepository> _mockUsuarioRepo = new();
        private readonly Mock<IConfiguracionNotificacionesRepository> _mockConfigRepo = new();
        private readonly Mock<INotificacionRepository> _mockNotiRepo = new();

        private readonly RecordatorioService _service;

        public RecordatorioServiceTests()
        {
            _service = new RecordatorioService(
                _mockRepo.Object,
                _mockDetalleRepo.Object,
                _mockPagoRepo.Object,
                _mockGastoRepo.Object,
                _mockGrupoRepo.Object,
                _mockUsuarioRepo.Object,
                _mockConfigRepo.Object,
                _mockNotiRepo.Object
            );
        }

        [Fact]
        public async Task GetRecordatoriosByUsuarioAsync_IdInvalido_RetornaError()
        {
            var result = await _service.GetRecordatoriosByUsuarioAsync("no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task GetRecordatoriosPendientesByUsuarioAsync_IdInvalido_RetornaError()
        {
            var result = await _service.GetRecordatoriosPendientesByUsuarioAsync("no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task GetRecordatoriosByGrupoAsync_IdInvalido_RetornaError()
        {
            var result = await _service.GetRecordatoriosByGrupoAsync(Guid.NewGuid(), "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_IdInvalido_RetornaError()
        {
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_NoExiste_RetornaError()
        {
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Recordatorio)null);
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_NoEsDueño_RetornaError()
        {
            var rec = new Recordatorio { IdUsuario = Guid.NewGuid() };
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(rec);
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_OK_Elimina()
        {
            var idUsuario = Guid.NewGuid();
            var rec = new Recordatorio { IdUsuario = idUsuario };
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(rec);
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), idUsuario.ToString());
            Assert.True(result.Exito);
            _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Once);
            _mockRepo.Verify(r => r.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_IdInvalido_RetornaError()
        {
            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), "no-guid");
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_NoExiste_RetornaError()
        {
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Recordatorio)null);
            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_NoEsDueño_RetornaError()
        {
            var rec = new Recordatorio { IdUsuario = Guid.NewGuid() };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(rec);
            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_MarcaYGuarda()
        {
            var idUsuario = Guid.NewGuid();
            var rec = new Recordatorio { IdUsuario = idUsuario, Repetir = false };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(rec);
            _mockRepo.Setup(x => x.MarcarComoCompletadoAsync(It.IsAny<Guid>())).ReturnsAsync(true);

            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), idUsuario.ToString());

            Assert.True(result.Exito);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task CrearRecordatorioDeudaAsync_DetalleNoExiste_NoCrea()
        {
            _mockDetalleRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((DetalleGasto)null);

            await _service.CrearRecordatorioDeudaAsync(Guid.NewGuid());

            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Never);
        }

        [Fact]
        public async Task CrearRecordatorioPagoAsync_PagoNoExiste_NoCrea()
        {
            _mockPagoRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Pago)null);

            await _service.CrearRecordatorioPagoAsync(Guid.NewGuid());

            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Never);
        }

        [Fact]
        public async Task ProcesarRecordatoriosVencidosAsync_RecordatorioNoRepetir_LoMarcaCompletado()
        {
            var recordatorio = new Recordatorio
            {
                IdRecordatorio = Guid.NewGuid(),
                IdUsuario = Guid.NewGuid(),
                IdGrupo = Guid.NewGuid(),
                Tipo = "PagoPendiente",
                Mensaje = "Mensaje",
                Completado = false,
                Repetir = false,
                Estado = "Pendiente"
            };
            _mockRepo.Setup(x => x.GetVencidosNoCompletadosAsync()).ReturnsAsync(new List<Recordatorio> { recordatorio });

            await _service.ProcesarRecordatoriosVencidosAsync();

            Assert.True(recordatorio.Completado);
            Assert.Equal("Enviado", recordatorio.Estado);
            _mockRepo.Verify(x => x.UpdateAsync(recordatorio), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task ProcesarRecordatoriosVencidosAsync_RecordatorioRepetir_CreaNuevoYMarcaCompletado()
        {
            var recordatorio = new Recordatorio
            {
                IdRecordatorio = Guid.NewGuid(),
                IdUsuario = Guid.NewGuid(),
                IdGrupo = Guid.NewGuid(),
                Tipo = "PagoPendiente",
                Mensaje = "Mensaje",
                Completado = false,
                Repetir = true,
                Estado = "Pendiente",
                FrecuenciaRepeticion = "semanal"
            };
            _mockRepo.Setup(x => x.GetVencidosNoCompletadosAsync()).ReturnsAsync(new List<Recordatorio> { recordatorio });

            await _service.ProcesarRecordatoriosVencidosAsync();

            Assert.True(recordatorio.Completado);
            Assert.Equal("Enviado", recordatorio.Estado);
            _mockRepo.Verify(x => x.UpdateAsync(recordatorio), Times.Once);
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task CrearRecordatorioAsync_GrupoNoExiste_RetornaError()
        {
            var dto = new CrearRecordatorioDto { IdGrupo = Guid.NewGuid() };
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync((Grupo)null);
            var result = await _service.CrearRecordatorioAsync(dto, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task ActualizarRecordatorioAsync_GrupoNoExiste_RetornaError()
        {
            var dto = new CrearRecordatorioDto { IdGrupo = Guid.NewGuid() };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(new Recordatorio { IdUsuario = Guid.NewGuid() });
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync((Grupo)null);
            var result = await _service.ActualizarRecordatorioAsync(Guid.NewGuid(), dto, Guid.NewGuid().ToString());
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task CrearRecordatorioAsync_GrupoExiste_CreaRecordatorio()
        {
            var dto = new CrearRecordatorioDto
            {
                IdGrupo = Guid.NewGuid(),
                Titulo = "Mi recordatorio",
                Mensaje = "Mensaje de prueba",
                Tipo = "General"
            };
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync(new Grupo { IdGrupo = dto.IdGrupo });
            var result = await _service.CrearRecordatorioAsync(dto, Guid.NewGuid().ToString());
            Assert.True(result.Exito);
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }
    }
}