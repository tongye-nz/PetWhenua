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

    [MaxLength(20)]
    public string? Gender { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? ProfilePicture { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}