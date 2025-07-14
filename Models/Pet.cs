using System;
using System.ComponentModel.DataAnnotations;

public class Pet
{
    [Key]
    public int PetId { get; set; } // pet_id (PK)

    // Foreign key
    public int UserId { get; set; } // user_id (FK)
    public User? User { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Species { get; set; } // species (dog, cat, bird, etc.)

    [MaxLength(50)]
    public string? Breed { get; set; }

    public int Age { get; set; }

    // New fields for more precise age calculation
    public int? BirthYear { get; set; }
    public int? BirthMonth { get; set; } // 1-12

    [MaxLength(20)]
    public string? Gender { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? ProfilePicture { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties for pet connections
    public List<PetConnection> ConnectionsAsPet1 { get; set; } = new();
    public List<PetConnection> ConnectionsAsPet2 { get; set; } = new();
    
    // Pet wedding participation
    public List<PetWeddingParticipant> PetWeddingParticipations { get; set; } = new();
}