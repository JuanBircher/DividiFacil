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
