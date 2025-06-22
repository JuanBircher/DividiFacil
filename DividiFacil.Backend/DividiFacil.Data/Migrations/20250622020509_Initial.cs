using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DividiFacil.Data.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.CreateTable(
            //    name: "Usuarios",
            //    columns: table => new
            //    {
            //        IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
            //        Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
            //        PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
            //        ProveedorAuth = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
            //        IdExterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
            //        FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
            //        Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
            //        UrlImagen = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
            //        TokenNotificacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
            //        Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Grupos",
            //    columns: table => new
            //    {
            //        IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        NombreGrupo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
            //        IdUsuarioCreador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
            //        Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
            //        ModoOperacion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Estandar"),
            //        CodigoAcceso = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Grupos", x => x.IdGrupo);
            //        table.ForeignKey(
            //            name: "FK_Grupos_Usuarios_IdUsuarioCreador",
            //            column: x => x.IdUsuarioCreador,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "CajaComun",
            //    columns: table => new
            //    {
            //        IdCaja = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
            //        FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_CajaComun", x => x.IdCaja);
            //        table.ForeignKey(
            //            name: "FK_CajaComun_Grupos_IdGrupo",
            //            column: x => x.IdGrupo,
            //            principalTable: "Grupos",
            //            principalColumn: "IdGrupo");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Gastos",
            //    columns: table => new
            //    {
            //        IdGasto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdPagador = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //        Concepto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
            //        Fecha = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
            //        TipoGasto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Normal"),
            //        FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
            //        ComprobantePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Gastos", x => x.IdGasto);
            //        table.ForeignKey(
            //            name: "FK_Gastos_Grupos_IdGrupo",
            //            column: x => x.IdGrupo,
            //            principalTable: "Grupos",
            //            principalColumn: "IdGrupo");
            //        table.ForeignKey(
            //            name: "FK_Gastos_Usuarios_IdPagador",
            //            column: x => x.IdPagador,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "MiembrosGrupo",
            //    columns: table => new
            //    {
            //        IdMiembro = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Rol = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Miembro"),
            //        FechaUnion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_MiembrosGrupo", x => x.IdMiembro);
            //        table.ForeignKey(
            //            name: "FK_MiembrosGrupo_Grupos_IdGrupo",
            //            column: x => x.IdGrupo,
            //            principalTable: "Grupos",
            //            principalColumn: "IdGrupo");
            //        table.ForeignKey(
            //            name: "FK_MiembrosGrupo_Usuarios_IdUsuario",
            //            column: x => x.IdUsuario,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "Notificaciones",
            //    columns: table => new
            //    {
            //        IdNotificacion = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdGrupo = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Tipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //        Mensaje = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
            //        Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pendiente"),
            //        FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
            //        FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: true),
            //        CanalEnvio = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Email")
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_Notificaciones", x => x.IdNotificacion);
            //        table.ForeignKey(
            //            name: "FK_Notificaciones_Grupos_IdGrupo",
            //            column: x => x.IdGrupo,
            //            principalTable: "Grupos",
            //            principalColumn: "IdGrupo");
            //        table.ForeignKey(
            //            name: "FK_Notificaciones_Usuarios_IdUsuario",
            //            column: x => x.IdUsuario,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "MovimientosCaja",
            //    columns: table => new
            //    {
            //        IdMovimiento = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdCaja = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //        TipoMovimiento = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
            //        Concepto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
            //        Fecha = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
            //        ComprobantePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_MovimientosCaja", x => x.IdMovimiento);
            //        table.ForeignKey(
            //            name: "FK_MovimientosCaja_CajaComun_IdCaja",
            //            column: x => x.IdCaja,
            //            principalTable: "CajaComun",
            //            principalColumn: "IdCaja");
            //        table.ForeignKey(
            //            name: "FK_MovimientosCaja_Usuarios_IdUsuario",
            //            column: x => x.IdUsuario,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateTable(
            //    name: "DetallesGasto",
            //    columns: table => new
            //    {
            //        IdDetalle = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdGasto = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        IdUsuario = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
            //        MontoDebe = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
            //        Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pendiente"),
            //        FechaPago = table.Column<DateTime>(type: "datetime2", nullable: true)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_DetallesGasto", x => x.IdDetalle);
            //        table.ForeignKey(
            //            name: "FK_DetallesGasto_Gastos_IdGasto",
            //            column: x => x.IdGasto,
            //            principalTable: "Gastos",
            //            principalColumn: "IdGasto");
            //        table.ForeignKey(
            //            name: "FK_DetallesGasto_Usuarios_IdUsuario",
            //            column: x => x.IdUsuario,
            //            principalTable: "Usuarios",
            //            principalColumn: "IdUsuario");
            //    });

            //migrationBuilder.CreateIndex(
            //    name: "IX_CajaComun_IdGrupo",
            //    table: "CajaComun",
            //    column: "IdGrupo",
            //    unique: true);

            //migrationBuilder.CreateIndex(
            //    name: "IX_DetallesGasto_IdGasto",
            //    table: "DetallesGasto",
            //    column: "IdGasto");

            //migrationBuilder.CreateIndex(
            //    name: "IX_DetallesGasto_IdUsuario",
            //    table: "DetallesGasto",
            //    column: "IdUsuario");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Gastos_IdGrupo",
            //    table: "Gastos",
            //    column: "IdGrupo");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Gastos_IdPagador",
            //    table: "Gastos",
            //    column: "IdPagador");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Grupos_IdUsuarioCreador",
            //    table: "Grupos",
            //    column: "IdUsuarioCreador");

            //migrationBuilder.CreateIndex(
            //    name: "IX_MiembrosGrupo_IdGrupo",
            //    table: "MiembrosGrupo",
            //    column: "IdGrupo");

            //migrationBuilder.CreateIndex(
            //    name: "IX_MiembrosGrupo_IdUsuario_IdGrupo",
            //    table: "MiembrosGrupo",
            //    columns: new[] { "IdUsuario", "IdGrupo" },
            //    unique: true);

            //migrationBuilder.CreateIndex(
            //    name: "IX_MovimientosCaja_IdCaja",
            //    table: "MovimientosCaja",
            //    column: "IdCaja");

            //migrationBuilder.CreateIndex(
            //    name: "IX_MovimientosCaja_IdUsuario",
            //    table: "MovimientosCaja",
            //    column: "IdUsuario");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Notificaciones_IdGrupo",
            //    table: "Notificaciones",
            //    column: "IdGrupo");

            //migrationBuilder.CreateIndex(
            //    name: "IX_Notificaciones_IdUsuario",
            //    table: "Notificaciones",
            //    column: "IdUsuario");

            migrationBuilder.Sql(@"
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '__EFMigrationsHistory')
        BEGIN
            CREATE TABLE [__EFMigrationsHistory] (
                [MigrationId] nvarchar(150) NOT NULL,
                [ProductVersion] nvarchar(32) NOT NULL,
                CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
            );
        END
    ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DetallesGasto");

            migrationBuilder.DropTable(
                name: "MiembrosGrupo");

            migrationBuilder.DropTable(
                name: "MovimientosCaja");

            migrationBuilder.DropTable(
                name: "Notificaciones");

            migrationBuilder.DropTable(
                name: "Gastos");

            migrationBuilder.DropTable(
                name: "CajaComun");

            migrationBuilder.DropTable(
                name: "Grupos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
