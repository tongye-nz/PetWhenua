using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class PetWeddingParticipant
{
    [Key]
    public int ParticipantId { get; set; }

    [Required]
    [ForeignKey("Post")]
    public int PostId { get; set; }

    [Required]
    [ForeignKey("Pet")]
    public int PetId { get; set; }

    [Required]
    [ForeignKey("Owner")]
    public int OwnerId { get; set; }

    public bool HasApproved { get; set; } = false;

    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Post Post { get; set; } = null!;
    public Pet Pet { get; set; } = null!;
    public User Owner { get; set; } = null!;
}
