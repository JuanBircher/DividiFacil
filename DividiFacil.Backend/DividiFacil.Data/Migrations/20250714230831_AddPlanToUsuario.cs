using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DividiFacil.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanToUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ProveedorAuth = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IdExterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    UrlImagen = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TokenNotificacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Plan = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Free")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                });

            migrationBuilder.CreateTable(
                name: "ConfiguracionesNotificaciones",
                columns: table => new
                {
                    IdConfiguracion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NotificarNuevosPagos = table.Column<bool>(type: "bit", nullable: false),
                    NotificarNuevosGastos = table.Column<bool>(type: "bit", nullable: false),
                    NotificarInvitacionesGrupo = table.Column<bool>(type: "bit", nullable: false),
                    NotificarCambiosEstadoPagos = table.Column<bool>(type: "bit", nullable: false),
                    RecordatoriosDeudas = table.Column<bool>(type: "bit", nullable: false),
                    RecordatoriosPagos = table.Column<bool>(type: "bit", nullable: false),
                    FrecuenciaRecordatorios = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracionesNotificaciones", x => x.IdConfiguracion);
                    table.ForeignKey(
                        name: "FK_ConfiguracionesNotificaciones_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Grupos",
                columns: table => new
                {
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NombreGrupo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IdUsuarioCreador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ModoOperacion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Estandar"),
                    CodigoAcceso = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grupos", x => x.IdGrupo);
                    table.ForeignKey(
                        name: "FK_Grupos_Usuarios_IdUsuarioCreador",
                        column: x => x.IdUsuarioCreador,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CajasComunes",
                columns: table => new
                {
                    IdCaja = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CajasComunes", x => x.IdCaja);
                    table.ForeignKey(
                        name: "FK_CajasComunes_Grupos_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MiembrosGrupo",
                columns: table => new
                {
                    IdMiembro = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Miembro"),
                    FechaUnion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MiembrosGrupo", x => x.IdMiembro);
                    table.ForeignKey(
                        name: "FK_MiembrosGrupo_Grupos_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MiembrosGrupo_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notificaciones",
                columns: table => new
                {
                    IdNotificacion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CanalEnvio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UsuarioIdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    GrupoIdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.ForeignKey(
                        name: "FK_Notificaciones_Grupos_GrupoIdGrupo",
                        column: x => x.GrupoIdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo");
                    table.ForeignKey(
                        name: "FK_Notificaciones_Usuarios_UsuarioIdUsuario",
                        column: x => x.UsuarioIdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateTable(
                name: "Recordatorios",
                columns: table => new
                {
                    IdRecordatorio = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdReferencia = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaRecordatorio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Completado = table.Column<bool>(type: "bit", nullable: false),
                    Repetir = table.Column<bool>(type: "bit", nullable: false),
                    FrecuenciaRepeticion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pendiente")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recordatorios", x => x.IdRecordatorio);
                    table.ForeignKey(
                        name: "FK_Recordatorios_Grupos_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recordatorios_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosCaja",
                columns: table => new
                {
                    IdMovimiento = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdCaja = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Concepto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ComprobantePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCaja", x => x.IdMovimiento);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_CajasComunes_IdCaja",
                        column: x => x.IdCaja,
                        principalTable: "CajasComunes",
                        principalColumn: "IdCaja",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_Usuarios_IdUsuario",
                        column: x => x.IdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Gastos",
                columns: table => new
                {
                    IdGasto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdMiembroPagador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Categoria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaGasto = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ComprobantePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UsuarioIdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gastos", x => x.IdGasto);
                    table.ForeignKey(
                        name: "FK_Gastos_Grupos_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Gastos_MiembrosGrupo_IdMiembroPagador",
                        column: x => x.IdMiembroPagador,
                        principalTable: "MiembrosGrupo",
                        principalColumn: "IdMiembro",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Gastos_Usuarios_UsuarioIdUsuario",
                        column: x => x.UsuarioIdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateTable(
                name: "Pagos",
                columns: table => new
                {
                    IdPago = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdPagador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdReceptor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Concepto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pendiente"),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    FechaPago = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaConfirmacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ComprobantePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MotivoRechazo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagos", x => x.IdPago);
                    table.ForeignKey(
                        name: "FK_Pagos_Grupos_IdGrupo",
                        column: x => x.IdGrupo,
                        principalTable: "Grupos",
                        principalColumn: "IdGrupo");
                    table.ForeignKey(
                        name: "FK_Pagos_MiembrosGrupo_IdPagador",
                        column: x => x.IdPagador,
                        principalTable: "MiembrosGrupo",
                        principalColumn: "IdMiembro");
                    table.ForeignKey(
                        name: "FK_Pagos_MiembrosGrupo_IdReceptor",
                        column: x => x.IdReceptor,
                        principalTable: "MiembrosGrupo",
                        principalColumn: "IdMiembro");
                });

            migrationBuilder.CreateTable(
                name: "DetallesGasto",
                columns: table => new
                {
                    IdDetalleGasto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGasto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdMiembroDeudor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Pagado = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    UsuarioIdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallesGasto", x => x.IdDetalleGasto);
                    table.ForeignKey(
                        name: "FK_DetallesGasto_Gastos_IdGasto",
                        column: x => x.IdGasto,
                        principalTable: "Gastos",
                        principalColumn: "IdGasto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DetallesGasto_MiembrosGrupo_IdMiembroDeudor",
                        column: x => x.IdMiembroDeudor,
                        principalTable: "MiembrosGrupo",
                        principalColumn: "IdMiembro",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DetallesGasto_Usuarios_UsuarioIdUsuario",
                        column: x => x.UsuarioIdUsuario,
                        principalTable: "Usuarios",
                        principalColumn: "IdUsuario");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CajasComunes_IdGrupo",
                table: "CajasComunes",
                column: "IdGrupo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracionesNotificaciones_IdUsuario",
                table: "ConfiguracionesNotificaciones",
                column: "IdUsuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DetallesGasto_IdGasto",
                table: "DetallesGasto",
                column: "IdGasto");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesGasto_IdMiembroDeudor",
                table: "DetallesGasto",
                column: "IdMiembroDeudor");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesGasto_UsuarioIdUsuario",
                table: "DetallesGasto",
                column: "UsuarioIdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Gastos_IdGrupo",
                table: "Gastos",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Gastos_IdMiembroPagador",
                table: "Gastos",
                column: "IdMiembroPagador");

            migrationBuilder.CreateIndex(
                name: "IX_Gastos_UsuarioIdUsuario",
                table: "Gastos",
                column: "UsuarioIdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Grupos_IdUsuarioCreador",
                table: "Grupos",
                column: "IdUsuarioCreador");

            migrationBuilder.CreateIndex(
                name: "IX_MiembrosGrupo_IdGrupo",
                table: "MiembrosGrupo",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_MiembrosGrupo_IdUsuario",
                table: "MiembrosGrupo",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_IdCaja",
                table: "MovimientosCaja",
                column: "IdCaja");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_IdUsuario",
                table: "MovimientosCaja",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_GrupoIdGrupo",
                table: "Notificaciones",
                column: "GrupoIdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioIdUsuario",
                table: "Notificaciones",
                column: "UsuarioIdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdGrupo",
                table: "Pagos",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdPagador",
                table: "Pagos",
                column: "IdPagador");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdReceptor",
                table: "Pagos",
                column: "IdReceptor");

            migrationBuilder.CreateIndex(
                name: "IX_Recordatorios_IdGrupo",
                table: "Recordatorios",
                column: "IdGrupo");

            migrationBuilder.CreateIndex(
                name: "IX_Recordatorios_IdUsuario",
                table: "Recordatorios",
                column: "IdUsuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracionesNotificaciones");

            migrationBuilder.DropTable(
                name: "DetallesGasto");

            migrationBuilder.DropTable(
                name: "MovimientosCaja");

            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.DropTable(
                name: "Pagos");

            migrationBuilder.DropTable(
                name: "Recordatorios");

            migrationBuilder.DropTable(
                name: "Gastos");

            migrationBuilder.DropTable(
                name: "CajasComunes");

            migrationBuilder.DropTable(
                name: "MiembrosGrupo");

            migrationBuilder.DropTable(
                name: "Grupos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
