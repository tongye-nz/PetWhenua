using PetWhenua.Models;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public interface INotificationService
    {
        // Create and send notifications
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request);
        Task<NotificationDto> CreateAndSendNotificationAsync(CreateNotificationRequest request);
        
        // Retrieve notifications
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20);
        Task<List<NotificationDto>> GetUnreadNotificationsAsync(int userId);
        Task<NotificationCountDto> GetNotificationCountAsync(int userId);
        Task<NotificationDto?> GetNotificationAsync(int notificationId, int userId);
        
        // Update notifications
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DismissNotificationAsync(int notificationId, int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        
        // Real-time delivery
        Task SendRealTimeNotificationAsync(int userId, NotificationDto notification);
        Task BroadcastNotificationAsync(List<int> userIds, NotificationDto notification);
        
        // Convenience methods for common notification types
        Task CreatePetConnectionRequestNotificationAsync(int targetUserId, int requesterUserId, int connectionId, string requesterPetName, string targetPetName);
        Task CreatePetConnectionResponseNotificationAsync(int targetUserId, int responderUserId, int connectionId, bool isApproved, string requesterPetName, string responderPetName);
        Task CreatePetWeddingApprovalNotificationAsync(int targetUserId, int postId, string postTitle, string requesterName);
        Task CreatePetWeddingRequestNotificationAsync(int targetUserId, int postId, string postTitle, string requesterName);
        Task CreateMeetupActivationNotificationAsync(int targetUserId, int postId, string postTitle);
        Task CreateMeetupPendingNotificationAsync(int postId, string postTitle, string creatorName);
        Task CreateMeetupApprovedNotificationAsync(int targetUserId, int postId, string postTitle);
        Task CreateMeetupRejectedNotificationAsync(int targetUserId, int postId, string postTitle);
        Task CreatePostLikedNotificationAsync(int targetUserId, int likerUserId, int postId, string postTitle, string likerName);
        Task CreatePostCommentedNotificationAsync(int targetUserId, int commenterUserId, int postId, string postTitle, string commenterName);
        Task CreateUserFollowedNotificationAsync(int targetUserId, int followerUserId, string followerName);
        Task CreateChatMessageNotificationAsync(int targetUserId, int senderId, string senderName, string messagePreview);
        
        // Cleanup operations
        Task CleanupOldNotificationsAsync();
        Task DeleteNotificationsByTypeAsync(int userId, NotificationType type);
    }
} 