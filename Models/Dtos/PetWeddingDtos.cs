using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models.Dtos
{
    public class CreatePetWeddingDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        public List<int> PetIds { get; set; } = new();
        
        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public DateTime EventDate { get; set; }
        
        public List<string>? Images { get; set; }
        
        [MaxLength(100)]
        public string? Category { get; set; }
    }

    public class UpdatePetWeddingParticipantsDto
    {
        [Required]
        public List<int> PetIds { get; set; } = new();
    }

    public class SelectablePetDto
    {
        public int PetId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Species { get; set; }
        public string? Breed { get; set; }
        public int Age { get; set; }
        public int? BirthYear { get; set; }
        public int? BirthMonth { get; set; }
        public string? Gender { get; set; }
        public string? Description { get; set; }
        public string? ProfilePicture { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // SelectablePet specific properties
        public bool IsOwned { get; set; }
        public bool IsConnected { get; set; }
        
        // User information (pet owner)
        public UserDto? User { get; set; }
        
        // Connection owner (for connected pets)
        public UserDto? ConnectionOwner { get; set; }
    }


} 