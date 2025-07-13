using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models.Dtos
{
    public class CreatePostWithRoleRequest
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string UserRole { get; set; } = string.Empty;

        [Required]
        public PostType PostType { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public List<string>? Images { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        public decimal? Price { get; set; }

        public DateTime? EventDate { get; set; }

        [MaxLength(100)]
        public string? Category { get; set; }
    }

    public class ChangePostStatusRequest
    {
        [Required]
        public PostStatus NewStatus { get; set; }

        [Required]
        public int RequestingUserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RequestingUserRole { get; set; } = string.Empty;
    }

    public class PostStatusResponse
    {
        public int PostId { get; set; }
        public PostStatus Status { get; set; }
        public bool CanChangeStatus { get; set; }
        public List<string> AllowedRoles { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }

    public class MeetupActivationInfo
    {
        public List<string> AutoActiveRoles { get; set; } = new();
        public List<string> ActivationRoles { get; set; } = new();
        public string MemberStatusMessage { get; set; } = "Members can create meetup posts, but they will be inactive until approved by an admin.";
        public string AdminStatusMessage { get; set; } = "Meetup admins, site admins, and vets can create active meetup posts immediately.";
    }
}
