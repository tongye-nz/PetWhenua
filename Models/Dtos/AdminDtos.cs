using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models.Dtos
{
    public class UpdateUserRoleRequest
    {
        [Required]
        public string Role { get; set; } = string.Empty;
    }

    public class UpdateUserStatusRequest
    {
        [Required]
        public bool IsActive { get; set; }
    }

    public class AdminUserListDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }

    public class UpdateUserRoleResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string OldRole { get; set; } = string.Empty;
        public string NewRole { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateUserStatusResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public bool OldStatus { get; set; }
        public bool NewStatus { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Message { get; set; } = string.Empty;
    }
} 