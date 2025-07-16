using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public enum PetConnectionStatus
{
    Pending,
    Accepted,
    Rejected,
    Blocked
}

public class PetConnection
{
    [Key]
    public int PetConnectionId { get; set; }

    [Required]
    [ForeignKey("Pet1")]
    public int Pet1Id { get; set; }

    [Required]
    [ForeignKey("Pet2")]
    public int Pet2Id { get; set; }

    [Required]
    public PetConnectionStatus Status { get; set; } = PetConnectionStatus.Pending;

    [Required]
    [ForeignKey("RequestedBy")]
    public int RequestedById { get; set; }

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }

    [MaxLength(500)]
    public string? RequestMessage { get; set; }

    [MaxLength(500)]
    public string? ResponseMessage { get; set; }

    // Navigation properties
    public Pet Pet1 { get; set; } = null!;
    public Pet Pet2 { get; set; } = null!;
    public User RequestedBy { get; set; } = null!;
}
