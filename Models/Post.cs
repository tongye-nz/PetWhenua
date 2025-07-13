using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum PostType
{
    Meetup,
    PetWedding,
    BuySell,
    Library,
    Announcement,
    Moment
}

public enum PostStatus
{
    Active,
    Sold,
    Expired,
    Inactive,
    Cancelled
}

public class Post
{
    [Key]
    public int PostId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    public PostType PostType { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public List<string> Images { get; set; } = new();

    [MaxLength(200)]
    public string? Location { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Price { get; set; }

    public DateTime? EventDate { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [Required]
    public PostStatus Status { get; set; } = PostStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public User User { get; set; } = null!;
} 