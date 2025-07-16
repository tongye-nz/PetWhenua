using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PetWhenua.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostImage> PostImages => Set<PostImage>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();
    public DbSet<PetConnection> PetConnections => Set<PetConnection>();
    public DbSet<PetWeddingParticipant> PetWeddingParticipants => Set<PetWeddingParticipant>();

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

        // Configure Comment relationships
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Like relationships
        modelBuilder.Entity<Like>()
            .HasOne(l => l.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(l => l.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ensure one like per user per post
        modelBuilder.Entity<Like>()
            .HasIndex(l => new { l.PostId, l.UserId })
            .IsUnique();

        // Configure UserFollow relationships
        modelBuilder.Entity<UserFollow>()
            .HasOne(uf => uf.Follower)
            .WithMany(u => u.Following)
            .HasForeignKey(uf => uf.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFollow>()
            .HasOne(uf => uf.Following)
            .WithMany(u => u.Followers)
            .HasForeignKey(uf => uf.FollowingId)
            .OnDelete(DeleteBehavior.Restrict);

        // Prevent self-following
        modelBuilder.Entity<UserFollow>()
            .HasIndex(uf => new { uf.FollowerId, uf.FollowingId })
            .IsUnique();

        // Configure PetConnection relationships
        modelBuilder.Entity<PetConnection>()
            .HasOne(pc => pc.Pet1)
            .WithMany(p => p.ConnectionsAsPet1)
            .HasForeignKey(pc => pc.Pet1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PetConnection>()
            .HasOne(pc => pc.Pet2)
            .WithMany(p => p.ConnectionsAsPet2)
            .HasForeignKey(pc => pc.Pet2Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PetConnection>()
            .HasOne(pc => pc.RequestedBy)
            .WithMany()
            .HasForeignKey(pc => pc.RequestedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Prevent duplicate connections and self-connections
        modelBuilder.Entity<PetConnection>()
            .HasIndex(pc => new { pc.Pet1Id, pc.Pet2Id })
            .IsUnique();

        // Configure PetWeddingParticipant relationships
        modelBuilder.Entity<PetWeddingParticipant>()
            .HasOne(pwp => pwp.Post)
            .WithMany(p => p.PetWeddingParticipants)
            .HasForeignKey(pwp => pwp.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PetWeddingParticipant>()
            .HasOne(pwp => pwp.Pet)
            .WithMany(p => p.PetWeddingParticipations)
            .HasForeignKey(pwp => pwp.PetId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PetWeddingParticipant>()
            .HasOne(pwp => pwp.Owner)
            .WithMany(u => u.PetWeddingParticipations)
            .HasForeignKey(pwp => pwp.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ensure unique pet per wedding
        modelBuilder.Entity<PetWeddingParticipant>()
            .HasIndex(pwp => new { pwp.PostId, pwp.PetId })
            .IsUnique();

        // Configure enum storage
        modelBuilder.Entity<Post>()
            .Property(p => p.PostType)
            .HasConversion<string>();

        modelBuilder.Entity<Post>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<PetConnection>()
            .Property(pc => pc.Status)
            .HasConversion<string>();

        // Configure Images as JSON column
        modelBuilder.Entity<Post>()
            .Property(p => p.Images)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
            .Metadata.SetValueComparer(
                new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));

        // Configure PostImage relationships to avoid cascade delete conflicts
        modelBuilder.Entity<PostImage>()
            .HasOne(pi => pi.Post)
            .WithMany(p => p.PostImages)
            .HasForeignKey(pi => pi.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PostImage>()
            .HasOne(pi => pi.UploadedByUser)
            .WithMany()
            .HasForeignKey(pi => pi.UploadedBy)
            .OnDelete(DeleteBehavior.NoAction);
    }
}