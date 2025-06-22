using DividiFacil.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace DividiFacil.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Grupo> Grupos { get; set; }
        public DbSet<MiembroGrupo> MiembrosGrupo { get; set; }
        public DbSet<Gasto> Gastos { get; set; }
        public DbSet<DetalleGasto> DetallesGasto { get; set; }
        public DbSet<CajaComun> CajaComun { get; set; }
        public DbSet<MovimientoCaja> MovimientosCaja { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }
        public DbSet<Pago> Pagos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(e => e.IdUsuario);
                entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Nombre).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(255);
                entity.Property(e => e.ProveedorAuth).HasMaxLength(50);
                entity.Property(e => e.IdExterno).HasMaxLength(100);
                entity.Property(e => e.FechaRegistro).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Activo).HasDefaultValue(true);
                entity.Property(e => e.UrlImagen).HasMaxLength(500);
                entity.Property(e => e.TokenNotificacion).HasMaxLength(500);
                entity.Property(e => e.Telefono).HasMaxLength(20);
            });

            // Configuración Grupo
            modelBuilder.Entity<Grupo>(entity =>
            {
                entity.ToTable("Grupos");
                entity.HasKey(e => e.IdGrupo);
                entity.Property(e => e.NombreGrupo).HasMaxLength(100).IsRequired();
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Descripcion).HasMaxLength(500);
                entity.Property(e => e.ModoOperacion).HasMaxLength(50).HasDefaultValue("Estandar");
                entity.Property(e => e.CodigoAcceso).HasMaxLength(20);

                entity.HasOne(g => g.UsuarioCreador)
                      .WithMany(u => u.GruposCreados)
                      .HasForeignKey(g => g.IdUsuarioCreador)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración MiembroGrupo
            modelBuilder.Entity<MiembroGrupo>(entity =>
            {
                entity.ToTable("MiembrosGrupo");
                entity.HasKey(e => e.IdMiembro);
                entity.Property(e => e.Rol).HasMaxLength(50).HasDefaultValue("Miembro");
                entity.Property(e => e.FechaUnion).HasDefaultValueSql("GETDATE()");

                entity.HasOne(m => m.Usuario)
                      .WithMany(u => u.MiembrosGrupo)
                      .HasForeignKey(m => m.IdUsuario)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(m => m.Grupo)
                      .WithMany(g => g.Miembros)
                      .HasForeignKey(m => m.IdGrupo)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(m => new { m.IdUsuario, m.IdGrupo }).IsUnique();
            });

            // Configuración Gasto
            modelBuilder.Entity<Gasto>(entity =>
            {
                entity.ToTable("Gastos");
                entity.HasKey(e => e.IdGasto);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Concepto).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Fecha).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.TipoGasto).HasMaxLength(50).HasDefaultValue("Normal");
                entity.Property(e => e.ComprobantePath).HasMaxLength(500);

                entity.HasOne(g => g.Grupo)
                      .WithMany(gr => gr.Gastos)
                      .HasForeignKey(g => g.IdGrupo)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(g => g.Pagador)
                      .WithMany(u => u.GastosPagados)
                      .HasForeignKey(g => g.IdPagador)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración DetalleGasto
            modelBuilder.Entity<DetalleGasto>(entity =>
            {
                entity.ToTable("DetallesGasto");
                entity.HasKey(e => e.IdDetalle);
                entity.Property(e => e.MontoDebe).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Estado).HasMaxLength(50).HasDefaultValue("Pendiente");

                entity.HasOne(d => d.Gasto)
                      .WithMany(g => g.Detalles)
                      .HasForeignKey(d => d.IdGasto)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(d => d.Usuario)
                      .WithMany(u => u.DetallesGasto)
                      .HasForeignKey(d => d.IdUsuario)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración CajaComun
            modelBuilder.Entity<CajaComun>(entity =>
            {
                entity.ToTable("CajaComun");
                entity.HasKey(e => e.IdCaja);
                entity.Property(e => e.Saldo).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");

                entity.HasOne(c => c.Grupo)
                      .WithOne(g => g.CajaComun)
                      .HasForeignKey<CajaComun>(c => c.IdGrupo)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración MovimientoCaja
            modelBuilder.Entity<MovimientoCaja>(entity =>
            {
                entity.ToTable("MovimientosCaja");
                entity.HasKey(e => e.IdMovimiento);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TipoMovimiento).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Concepto).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Fecha).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.ComprobantePath).HasMaxLength(500);

                entity.HasOne(m => m.Caja)
                      .WithMany(c => c.Movimientos)
                      .HasForeignKey(m => m.IdCaja)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(m => m.Usuario)
                      .WithMany()
                      .HasForeignKey(m => m.IdUsuario)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Configuración Notificacion
            modelBuilder.Entity<Notificacion>(entity =>
            {
                entity.ToTable("Notificaciones");
                entity.HasKey(e => e.IdNotificacion);
                entity.Property(e => e.Tipo).HasMaxLength(50).IsRequired();
                entity.Property(e => e.Mensaje).HasMaxLength(1000).IsRequired();
                entity.Property(e => e.Estado).HasMaxLength(50).HasDefaultValue("Pendiente");
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.CanalEnvio).HasMaxLength(50).HasDefaultValue("Email");

                entity.HasOne(n => n.Usuario)
                      .WithMany()
                      .HasForeignKey(n => n.IdUsuario)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(n => n.Grupo)
                      .WithMany()
                      .HasForeignKey(n => n.IdGrupo)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            modelBuilder.Entity<Pago>(entity =>
            {
                entity.ToTable("Pagos");
                entity.HasKey(e => e.IdPago);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Concepto).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Estado).HasMaxLength(50).HasDefaultValue("Pendiente");
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.ComprobantePath).HasMaxLength(500);
                entity.Property(e => e.MotivoRechazo).HasMaxLength(500);

                entity.HasOne(p => p.Pagador)
                        .WithMany()
                        .HasForeignKey(p => p.IdPagador)
                        .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(p => p.Receptor)
                        .WithMany()
                        .HasForeignKey(p => p.IdReceptor)
                        .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(p => p.Grupo)
                        .WithMany()
                        .HasForeignKey(p => p.IdGrupo)
                        .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}