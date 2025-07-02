using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany(u => u.Pets)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Posts)
            .WithOne(p => p.User)
            .HasForeignKey(p => p.UserId);

        // Configure enum storage
        modelBuilder.Entity<Post>()
            .Property(p => p.PostType)
            .HasConversion<string>();

        modelBuilder.Entity<Post>()
            .Property(p => p.Status)
            .HasConversion<string>();

        // Configure Images as JSON column
        modelBuilder.Entity<Post>()
            .Property(p => p.Images)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());
    }
}