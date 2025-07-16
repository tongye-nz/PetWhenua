using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class UserFollow
{
    [Key]
    public int UserFollowId { get; set; }

    [Required]
    [ForeignKey("Follower")]
    public int FollowerId { get; set; }

    [Required]
    [ForeignKey("Following")]
    public int FollowingId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User Follower { get; set; } = null!;
    public User Following { get; set; } = null!;
}
