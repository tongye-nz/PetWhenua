using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models
{
    public enum NotificationType
    {
        PetConnectionRequest = 0,
        PetConnectionApproved = 1,
        PetConnectionRejected = 2,
        PetWeddingPendingApproval = 3,
        PetWeddingApproved = 4,
        PetWeddingRejected = 5,
        MeetupPendingActivation = 6,
        MeetupActivated = 7,
        PostLiked = 8,
        PostCommented = 9,
        UserFollowed = 10,
        ChatMessage = 11,
        General = 12
    }

    public enum NotificationStatus
    {
        Unread = 0,
        Read = 1,
        Dismissed = 2
    }

    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public NotificationType Type { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        public NotificationStatus Status { get; set; } = NotificationStatus.Unread;

        // Optional reference to related entities
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }
        public int? RelatedUserId { get; set; }
        public int? RelatedConnectionId { get; set; }

        // Additional data as JSON string for complex notifications
        public string? AdditionalData { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Post? RelatedPost { get; set; }
        public virtual Pet? RelatedPet { get; set; }
        public virtual User? RelatedUser { get; set; }
        public virtual PetConnection? RelatedConnection { get; set; }
    }
} 