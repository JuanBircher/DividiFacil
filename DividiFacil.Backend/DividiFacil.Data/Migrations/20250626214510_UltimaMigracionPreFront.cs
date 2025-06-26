using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DividiFacil.Data.Migrations
{
    /// <inheritdoc />
    public partial class UltimaMigracionPreFront : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracionesNotificaciones_IdUsuario",
                table: "ConfiguracionesNotificaciones",
                column: "IdUsuario",
                unique: true);

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
                name: "Recordatorios");
        }
    }
}
