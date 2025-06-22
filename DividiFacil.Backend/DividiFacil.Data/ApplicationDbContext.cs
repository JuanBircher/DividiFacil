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
                entity.Property(e => e.Nombre).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
                entity.Property(e => e.PasswordHash).HasMaxLength(200);
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
                entity.Property(e => e.ModoOperacion).HasMaxLength(20).HasDefaultValue("Estandar");
                entity.Property(e => e.CodigoAcceso).HasMaxLength(10);

                entity.HasOne(g => g.UsuarioCreador)
                    .WithMany(u => u.GruposCreados)
                    .HasForeignKey(g => g.IdUsuarioCreador)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración MiembroGrupo
            modelBuilder.Entity<MiembroGrupo>(entity =>
            {
                entity.ToTable("MiembrosGrupo");
                entity.HasKey(e => e.IdMiembro);
                entity.Property(e => e.Rol).HasMaxLength(20).HasDefaultValue("Miembro");
                entity.Property(e => e.FechaUnion).HasDefaultValueSql("GETDATE()");

                entity.HasOne(m => m.Usuario)
                    .WithMany(u => u.MiembrosGrupo)
                    .HasForeignKey(m => m.IdUsuario)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Grupo)
                    .WithMany(g => g.Miembros)
                    .HasForeignKey(m => m.IdGrupo)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración Gasto
            modelBuilder.Entity<Gasto>(entity =>
            {
                entity.ToTable("Gastos");
                entity.HasKey(e => e.IdGasto);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Descripcion).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Categoria).HasMaxLength(50);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.ComprobantePath).HasMaxLength(500);

                entity.HasOne(g => g.Grupo)
                    .WithMany(g => g.Gastos)
                    .HasForeignKey(g => g.IdGrupo)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(g => g.MiembroPagador)
                    .WithMany()
                    .HasForeignKey(g => g.IdMiembroPagador)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración DetalleGasto
            modelBuilder.Entity<DetalleGasto>(entity =>
            {
                entity.ToTable("DetallesGasto");
                entity.HasKey(e => e.IdDetalleGasto);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Pagado).HasDefaultValue(false);

                entity.HasOne(d => d.Gasto)
                    .WithMany(g => g.DetallesGasto)
                    .HasForeignKey(d => d.IdGasto)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.MiembroDeudor)
                    .WithMany()
                    .HasForeignKey(d => d.IdMiembroDeudor)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración CajaComun
            modelBuilder.Entity<CajaComun>(entity =>
            {
                entity.ToTable("CajasComunes");
                entity.HasKey(e => e.IdCaja);
                entity.Property(e => e.Saldo).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETDATE()");

                entity.HasOne(c => c.Grupo)
                    .WithOne(g => g.CajaComun)
                    .HasForeignKey<CajaComun>(c => c.IdGrupo)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración MovimientoCaja
            modelBuilder.Entity<MovimientoCaja>(entity =>
            {
                entity.ToTable("MovimientosCaja");
                entity.HasKey(e => e.IdMovimiento);
                entity.Property(e => e.Monto).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.TipoMovimiento).HasMaxLength(20).IsRequired();
                entity.Property(e => e.Concepto).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Fecha).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.ComprobantePath).HasMaxLength(500);

                entity.HasOne(m => m.Caja)
                    .WithMany(c => c.Movimientos)
                    .HasForeignKey(m => m.IdCaja)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Usuario)
                    .WithMany()
                    .HasForeignKey(m => m.IdUsuario)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración Pago
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

            modelBuilder.Entity<Notificacion>().HasNoKey();
        }
    }
}