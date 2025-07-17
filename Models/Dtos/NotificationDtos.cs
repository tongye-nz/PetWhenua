using PetWhenua.Models;

namespace PetWhenua.Models.Dtos
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationStatus Status { get; set; }
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }
        public int? RelatedUserId { get; set; }
        public int? RelatedConnectionId { get; set; }
        public string? AdditionalData { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        // Related entity data for display
        public string? RelatedUserName { get; set; }
        public string? RelatedPetName { get; set; }
        public string? RelatedPostTitle { get; set; }
    }

    public class CreateNotificationRequest
    {
        public int UserId { get; set; }
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }
        public int? RelatedUserId { get; set; }
        public int? RelatedConnectionId { get; set; }
        public string? AdditionalData { get; set; }
    }

    public class UpdateNotificationStatusRequest
    {
        public NotificationStatus Status { get; set; }
    }

    public class NotificationCountDto
    {
        public int UnreadCount { get; set; }
        public int TotalCount { get; set; }
    }

    // Real-time notification payload for SignalR
    public class RealTimeNotificationDto
    {
        public NotificationDto Notification { get; set; } = null!;
        public string ConnectionId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
} 