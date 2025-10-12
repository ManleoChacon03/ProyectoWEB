namespace LibreriaChacon.Server.Contexts
{
    using LibreriaChacon.Server.Models;
    using Microsoft.EntityFrameworkCore;
    using System.Collections.Generic; // Necesario para el Dictionary

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Perfil> Perfiles { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }

        // --- AÑADE ESTOS DbSet PARA LAS NUEVAS TABLAS ---
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<DetallePedido> DetallePedido { get; set; }
        public DbSet<Direccion> Direcciones { get; set; }
        public DbSet<ReseñaProducto> ReseñasProducto { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<Devolucion> Devoluciones { get; set; }
        public DbSet<DetalleDevolucion> DetalleDevolucion { get; set; } // <-- AÑADE ESTA LÍNEA

        // -----------------------------------------------

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Perfil>().HasIndex(p => p.Email).IsUnique();

            modelBuilder.Entity<Producto>()
                .HasMany(p => p.Categorias)
                .WithMany(c => c.Productos)
                .UsingEntity<Dictionary<string, object>>(
                    "producto_categorias",
                    j => j
                        .HasOne<Categoria>()
                        .WithMany()
                        .HasForeignKey("categoria_id"),
                    j => j
                        .HasOne<Producto>()
                        .WithMany()
                        .HasForeignKey("producto_id")
                );
        }
    }
}