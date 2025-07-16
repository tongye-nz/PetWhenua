using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using PetWhenua.Models;

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
    Cancelled,
    Pending
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

    [MaxLength(500)]
    public string? Address { get; set; }

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
    
    // Pet Wedding specific navigation properties
    public List<PetWeddingParticipant> PetWeddingParticipants { get; set; } = new();
    
    // Image metadata navigation properties
    public List<PostImage> PostImages { get; set; } = new();
    
    // Comment navigation properties
    public List<Comment> Comments { get; set; } = new();
    
    // Like navigation properties  
    public List<Like> Likes { get; set; } = new();
    
    // Helper property for validated image count
    [NotMapped]
    public List<string> ValidatedImages => Images?.Take(9).ToList() ?? new();
} 