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

    public class PostCreationPermissionsResponse
    {
        public string UserRole { get; set; } = string.Empty;
        public string UserRoleDisplayName { get; set; } = string.Empty;
        public Dictionary<string, bool> Permissions { get; set; } = new();
        public List<string> RestrictedPostTypes { get; set; } = new();
        public List<string> AllowedPostTypes { get; set; } = new();
    }

    public class PostCreationRestrictionsInfo
    {
        public List<string> LibraryPostRoles { get; set; } = new();
        public List<string> AnnouncementPostRoles { get; set; } = new();
        public List<string> UnrestrictedPostRoles { get; set; } = new();
        public Dictionary<string, List<string>> PostTypeRestrictions { get; set; } = new();
        public string LibraryRestrictionMessage { get; set; } = "Only veterinarians and site administrators can create Library posts.";
        public string AnnouncementRestrictionMessage { get; set; } = "Only site administrators can create Announcement posts.";
        public string UnrestrictedMessage { get; set; } = "All authenticated users can create Moment, BuySell, PetWedding, and Meetup posts.";
    }
}
