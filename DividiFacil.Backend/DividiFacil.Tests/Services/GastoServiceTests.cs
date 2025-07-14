// ------------------------------------------------------------
// GastoServiceTests.cs
// Tests unitarios para GastoService
// Cubre creación de gastos, mocks de repositorios y servicios relacionados.
// ------------------------------------------------------------
// AAA: Arrange, Act, Assert
//
// Estructura:
// - CrearGastoAsync: Casos de datos válidos, mocks de grupo, miembro, usuario, notificaciones y recordatorios.
// ------------------------------------------------------------

// En DividiFacil.Tests/Services/GastoServiceTests.cs
using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Gasto;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Implementations;
using DividiFacil.Services.Interfaces;
using Moq;
using Xunit;

public class GastoServiceTests
{
    private readonly Mock<IGastoRepository> _mockGastoRepo;
    private readonly Mock<IDetalleGastoRepository> _mockDetalleRepo;
    private readonly Mock<IMiembroGrupoRepository> _mockMiembroRepo;
    private readonly Mock<IGrupoRepository> _mockGrupoRepo;
    private readonly Mock<IUsuarioRepository> _mockUsuarioRepo;
    private readonly Mock<INotificacionService> _mockNotificacionService;
    private readonly Mock<IRecordatorioService> _mockRecordatorioService;
    private readonly GastoService _service;

    public GastoServiceTests()
    {
        _mockGastoRepo = new Mock<IGastoRepository>();
        _mockDetalleRepo = new Mock<IDetalleGastoRepository>();
        _mockMiembroRepo = new Mock<IMiembroGrupoRepository>();
        _mockGrupoRepo = new Mock<IGrupoRepository>();
        _mockUsuarioRepo = new Mock<IUsuarioRepository>();
        _mockNotificacionService = new Mock<INotificacionService>();
        _mockRecordatorioService = new Mock<IRecordatorioService>();

        _service = new GastoService(
            _mockGastoRepo.Object,
            _mockDetalleRepo.Object,
            _mockUsuarioRepo.Object,
            _mockGrupoRepo.Object,
            _mockMiembroRepo.Object,
            _mockNotificacionService.Object,
            _mockRecordatorioService.Object);
    }

    [Fact]
    public async Task CrearGastoAsync_GrupoNoExiste_DebeFallar()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var gastoDto = new GastoCreacionDto { IdGrupo = idGrupo, Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto> { new() { IdMiembroDeudor = Guid.NewGuid(), Monto = 100 } } };
        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo)).ReturnsAsync((Grupo)null);
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);
        // Assert
        Assert.False(result.Exito);
        Assert.Equal("Grupo no encontrado", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_UsuarioNoEsMiembro_DebeFallar()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var gastoDto = new GastoCreacionDto { IdGrupo = idGrupo, Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto> { new() { IdMiembroDeudor = Guid.NewGuid(), Monto = 100 } } };
        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo)).ReturnsAsync(new Grupo { IdGrupo = idGrupo });
        _mockMiembroRepo.Setup(repo => repo.GetByUsuarioYGrupoAsync(It.IsAny<Guid>(), idGrupo)).ReturnsAsync((MiembroGrupo)null);
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);
        // Assert
        Assert.False(result.Exito);
        Assert.Equal("No eres miembro de este grupo", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_DetallesVacios_DebeFallar()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var gastoDto = new GastoCreacionDto { IdGrupo = idGrupo, Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto>() };
        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo)).ReturnsAsync(new Grupo { IdGrupo = idGrupo });
        _mockMiembroRepo.Setup(repo => repo.GetByUsuarioYGrupoAsync(It.IsAny<Guid>(), idGrupo)).ReturnsAsync(new MiembroGrupo { IdMiembro = Guid.NewGuid(), IdGrupo = idGrupo });
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);
        // Assert
        Assert.False(result.Exito);
        Assert.Equal("Debe especificar al menos un detalle para el gasto", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_SumaDetallesNoCoincide_DebeFallar()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var idMiembro = Guid.NewGuid();
        var gastoDto = new GastoCreacionDto { IdGrupo = idGrupo, Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto> { new() { IdMiembroDeudor = idMiembro, Monto = 50 } } };
        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo)).ReturnsAsync(new Grupo { IdGrupo = idGrupo });
        _mockMiembroRepo.Setup(repo => repo.GetByUsuarioYGrupoAsync(It.IsAny<Guid>(), idGrupo)).ReturnsAsync(new MiembroGrupo { IdMiembro = idMiembro, IdGrupo = idGrupo });
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);
        // Assert
        Assert.False(result.Exito);
        Assert.Contains("La suma de los detalles", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_MiembroDeudorNoPerteneceAlGrupo_DebeFallar()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var idMiembro = Guid.NewGuid();
        var gastoDto = new GastoCreacionDto { IdGrupo = idGrupo, Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto> { new() { IdMiembroDeudor = idMiembro, Monto = 100 } } };
        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo)).ReturnsAsync(new Grupo { IdGrupo = idGrupo });
        _mockMiembroRepo.Setup(repo => repo.GetByUsuarioYGrupoAsync(It.IsAny<Guid>(), idGrupo)).ReturnsAsync(new MiembroGrupo { IdMiembro = idMiembro, IdGrupo = idGrupo });
        _mockMiembroRepo.Setup(repo => repo.GetByIdAsync(idMiembro)).ReturnsAsync(new MiembroGrupo { IdMiembro = idMiembro, IdGrupo = Guid.NewGuid() }); // grupo incorrecto
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);
        // Assert
        Assert.False(result.Exito);
        Assert.Contains("no pertenece al grupo", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_IdUsuarioInvalido_DebeFallar()
    {
        // Arrange
        var gastoDto = new GastoCreacionDto { IdGrupo = Guid.NewGuid(), Monto = 100, Descripcion = "Test", Categoria = "Comida", Detalles = new List<DetalleGastoCreacionDto> { new() { IdMiembroDeudor = Guid.NewGuid(), Monto = 100 } } };
        // Act
        var result = await _service.CrearGastoAsync(gastoDto, "no-guid");
        // Assert
        Assert.False(result.Exito);
        Assert.Equal("ID de usuario inválido", result.Mensaje);
    }

    [Fact]
    public async Task CrearGastoAsync_ConDatosValidos_DebeCrearGasto()
    {
        // Arrange
        var idUsuario = Guid.NewGuid().ToString();
        var idGrupo = Guid.NewGuid();
        var idMiembro = Guid.NewGuid();

        var gastoDto = new GastoCreacionDto
        {
            IdGrupo = idGrupo,
            Monto = 100,
            Descripcion = "Test",
            Categoria = "Comida",
            Detalles = new List<DetalleGastoCreacionDto>
            {
                new() { IdMiembroDeudor = idMiembro, Monto = 100 }
            }
        };

        _mockGrupoRepo.Setup(repo => repo.GetByIdAsync(idGrupo))
            .ReturnsAsync(new Grupo { IdGrupo = idGrupo });

        _mockMiembroRepo.Setup(repo => repo.GetByUsuarioYGrupoAsync(It.IsAny<Guid>(), idGrupo))
            .ReturnsAsync(new MiembroGrupo { IdMiembro = idMiembro, IdGrupo = idGrupo });

        _mockMiembroRepo.Setup(repo => repo.GetByIdAsync(idMiembro))
            .ReturnsAsync(new MiembroGrupo { IdMiembro = idMiembro, IdGrupo = idGrupo });

        // Act
        var result = await _service.CrearGastoAsync(gastoDto, idUsuario);

        // Assert
        Assert.True(result.Exito);
        Assert.NotNull(result.Data);
        _mockGastoRepo.Verify(repo => repo.CreateAsync(It.IsAny<Gasto>()), Times.Once);
        _mockDetalleRepo.Verify(repo => repo.CreateAsync(It.IsAny<DetalleGasto>()), Times.Once);
    }
}
