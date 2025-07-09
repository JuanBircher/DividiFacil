// ------------------------------------------------------------
// RecordatorioServiceTests.cs
// Tests unitarios para RecordatorioService
// Cubre obtención y gestión de recordatorios, validaciones y edge cases.
// ------------------------------------------------------------
// AAA: Arrange, Act, Assert
//
// Estructura:
// - GetRecordatoriosByUsuarioAsync: Casos de usuario inválido
// - GetRecordatoriosPendientesByUsuarioAsync: Casos de usuario inválido
// - GetRecordatoriosByGrupoAsync: Casos de grupo/usuario inválido
// ------------------------------------------------------------
// Cada test debe tener comentario breve explicando el objetivo.
// ------------------------------------------------------------

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

        // ------------------------------------------------------------
        // GetRecordatoriosByUsuarioAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task GetRecordatoriosByUsuarioAsync_IdInvalido_RetornaError()
        {
            // Arrange
            var usuarioIdInvalido = "no-guid";

            // Act
            var result = await _service.GetRecordatoriosByUsuarioAsync(usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        // ------------------------------------------------------------
        // GetRecordatoriosPendientesByUsuarioAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task GetRecordatoriosPendientesByUsuarioAsync_IdInvalido_RetornaError()
        {
            // Arrange
            var usuarioIdInvalido = "no-guid";

            // Act
            var result = await _service.GetRecordatoriosPendientesByUsuarioAsync(usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        // ------------------------------------------------------------
        // GetRecordatoriosByGrupoAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task GetRecordatoriosByGrupoAsync_IdInvalido_RetornaError()
        {
            // Arrange
            var grupoId = Guid.NewGuid();
            var usuarioIdInvalido = "no-guid";

            // Act
            var result = await _service.GetRecordatoriosByGrupoAsync(grupoId, usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        // ------------------------------------------------------------
        // EliminarRecordatorioAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task EliminarRecordatorioAsync_IdInvalido_RetornaError()
        {
            // Arrange
            var recordatorioId = Guid.NewGuid();
            var usuarioIdInvalido = "no-guid";

            // Act
            var result = await _service.EliminarRecordatorioAsync(recordatorioId, usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_NoExiste_RetornaError()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Recordatorio)null);
            var recordatorioId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid().ToString();

            // Act
            var result = await _service.EliminarRecordatorioAsync(recordatorioId, usuarioId);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_NoEsDueño_RetornaError()
        {
            // Arrange
            var recordatorio = new Recordatorio { IdUsuario = Guid.NewGuid() };
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(recordatorio);
            var usuarioIdInvalido = Guid.NewGuid().ToString();

            // Act
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task EliminarRecordatorioAsync_OK_Elimina()
        {
            // Arrange
            var idUsuario = Guid.NewGuid();
            var recordatorio = new Recordatorio { IdUsuario = idUsuario };
            _mockRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(recordatorio);

            // Act
            var result = await _service.EliminarRecordatorioAsync(Guid.NewGuid(), idUsuario.ToString());

            // Assert
            Assert.True(result.Exito);
            _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<Guid>()), Times.Once);
            _mockRepo.Verify(r => r.SaveAsync(), Times.Once);
        }

        // ------------------------------------------------------------
        // MarcarComoCompletadoAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task MarcarComoCompletadoAsync_IdInvalido_RetornaError()
        {
            // Arrange
            var recordatorioId = Guid.NewGuid();
            var usuarioIdInvalido = "no-guid";

            // Act
            var result = await _service.MarcarComoCompletadoAsync(recordatorioId, usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_NoExiste_RetornaError()
        {
            // Arrange
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Recordatorio)null);
            var recordatorioId = Guid.NewGuid();
            var usuarioId = Guid.NewGuid().ToString();

            // Act
            var result = await _service.MarcarComoCompletadoAsync(recordatorioId, usuarioId);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_NoEsDueño_RetornaError()
        {
            // Arrange
            var recordatorio = new Recordatorio { IdUsuario = Guid.NewGuid() };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(recordatorio);
            var usuarioIdInvalido = Guid.NewGuid().ToString();

            // Act
            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), usuarioIdInvalido);

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task MarcarComoCompletadoAsync_MarcaYGuarda()
        {
            // Arrange
            var idUsuario = Guid.NewGuid();
            var recordatorio = new Recordatorio { IdUsuario = idUsuario, Repetir = false };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(recordatorio);
            _mockRepo.Setup(x => x.MarcarComoCompletadoAsync(It.IsAny<Guid>())).ReturnsAsync(true);

            // Act
            var result = await _service.MarcarComoCompletadoAsync(Guid.NewGuid(), idUsuario.ToString());

            // Assert
            Assert.True(result.Exito);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        // ------------------------------------------------------------
        // CrearRecordatorioDeudaAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task CrearRecordatorioDeudaAsync_DetalleNoExiste_NoCrea()
        {
            // Arrange
            _mockDetalleRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((DetalleGasto)null);

            // Act
            await _service.CrearRecordatorioDeudaAsync(Guid.NewGuid());

            // Assert
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Never);
        }

        // ------------------------------------------------------------
        // CrearRecordatorioPagoAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task CrearRecordatorioPagoAsync_PagoNoExiste_NoCrea()
        {
            // Arrange
            _mockPagoRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Pago)null);

            // Act
            await _service.CrearRecordatorioPagoAsync(Guid.NewGuid());

            // Assert
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Never);
        }

        // ------------------------------------------------------------
        // ProcesarRecordatoriosVencidosAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task ProcesarRecordatoriosVencidosAsync_RecordatorioNoRepetir_LoMarcaCompletado()
        {
            // Arrange
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

            // Act
            await _service.ProcesarRecordatoriosVencidosAsync();

            // Assert
            Assert.True(recordatorio.Completado);
            Assert.Equal("Enviado", recordatorio.Estado);
            _mockRepo.Verify(x => x.UpdateAsync(recordatorio), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task ProcesarRecordatoriosVencidosAsync_RecordatorioRepetir_CreaNuevoYMarcaCompletado()
        {
            // Arrange
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

            // Act
            await _service.ProcesarRecordatoriosVencidosAsync();

            // Assert
            Assert.True(recordatorio.Completado);
            Assert.Equal("Enviado", recordatorio.Estado);
            _mockRepo.Verify(x => x.UpdateAsync(recordatorio), Times.Once);
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }

        // ------------------------------------------------------------
        // CrearRecordatorioAsync
        // ------------------------------------------------------------

        [Fact]
        public async Task CrearRecordatorioAsync_GrupoNoExiste_RetornaError()
        {
            // Arrange
            var dto = new CrearRecordatorioDto { IdGrupo = Guid.NewGuid() };
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync((Grupo)null);

            // Act
            var result = await _service.CrearRecordatorioAsync(dto, Guid.NewGuid().ToString());

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task ActualizarRecordatorioAsync_GrupoNoExiste_RetornaError()
        {
            // Arrange
            var dto = new CrearRecordatorioDto { IdGrupo = Guid.NewGuid() };
            _mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(new Recordatorio { IdUsuario = Guid.NewGuid() });
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync((Grupo)null);

            // Act
            var result = await _service.ActualizarRecordatorioAsync(Guid.NewGuid(), dto, Guid.NewGuid().ToString());

            // Assert
            Assert.False(result.Exito);
        }

        [Fact]
        public async Task CrearRecordatorioAsync_GrupoExiste_CreaRecordatorio()
        {
            // Arrange
            var dto = new CrearRecordatorioDto
            {
                IdGrupo = Guid.NewGuid(),
                Titulo = "Mi recordatorio",
                Mensaje = "Mensaje de prueba",
                Tipo = "General"
            };
            _mockGrupoRepo.Setup(x => x.GetByIdAsync(dto.IdGrupo)).ReturnsAsync(new Grupo { IdGrupo = dto.IdGrupo });

            // Act
            var result = await _service.CrearRecordatorioAsync(dto, Guid.NewGuid().ToString());

            // Assert
            Assert.True(result.Exito);
            _mockRepo.Verify(x => x.CreateAsync(It.IsAny<Recordatorio>()), Times.Once);
            _mockRepo.Verify(x => x.SaveAsync(), Times.Once);
        }
    }
}