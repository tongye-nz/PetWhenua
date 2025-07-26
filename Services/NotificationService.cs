using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;
using PetWhenua.Hubs;
using System.Text.Json;

namespace PetWhenua.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;
        private readonly IUserService _userService;

        public NotificationService(
            AppDbContext context,
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger,
            IUserService userService)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
            _userService = userService;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationRequest request)
        {
            var notification = new Notification
            {
                UserId = request.UserId,
                Type = request.Type,
                Title = request.Title,
                Message = request.Message,
                RelatedPostId = request.RelatedPostId,
                RelatedPetId = request.RelatedPetId,
                RelatedUserId = request.RelatedUserId,
                RelatedConnectionId = request.RelatedConnectionId,
                AdditionalData = request.AdditionalData,
                Status = NotificationStatus.Unread,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return await MapToNotificationDto(notification);
        }

        public async Task<NotificationDto> CreateAndSendNotificationAsync(CreateNotificationRequest request)
        {
            var notificationDto = await CreateNotificationAsync(request);
            await SendRealTimeNotificationAsync(request.UserId, notificationDto);
            return notificationDto;
        }

        public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId, int page = 1, int pageSize = 20)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .Include(n => n.RelatedUser)
                .Include(n => n.RelatedPet)
                .Include(n => n.RelatedPost)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var notificationDtos = new List<NotificationDto>();
            foreach (var notification in notifications)
            {
                notificationDtos.Add(await MapToNotificationDto(notification));
            }

            return notificationDtos;
        }

        public async Task<List<NotificationDto>> GetUnreadNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
                .Include(n => n.RelatedUser)
                .Include(n => n.RelatedPet)
                .Include(n => n.RelatedPost)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50) // Limit to prevent performance issues
                .ToListAsync();

            var notificationDtos = new List<NotificationDto>();
            foreach (var notification in notifications)
            {
                notificationDtos.Add(await MapToNotificationDto(notification));
            }

            return notificationDtos;
        }

        public async Task<NotificationCountDto> GetNotificationCountAsync(int userId)
        {
            var unreadCount = await _context.Notifications
                .CountAsync(n => n.UserId == userId && n.Status == NotificationStatus.Unread);

            var totalCount = await _context.Notifications
                .CountAsync(n => n.UserId == userId);

            return new NotificationCountDto
            {
                UnreadCount = unreadCount,
                TotalCount = totalCount
            };
        }

        public async Task<NotificationDto?> GetNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .Include(n => n.RelatedUser)
                .Include(n => n.RelatedPet)
                .Include(n => n.RelatedPost)
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            return notification != null ? await MapToNotificationDto(notification) : null;
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null) return false;

            notification.Status = NotificationStatus.Read;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.Status == NotificationStatus.Unread)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.Status = NotificationStatus.Read;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DismissNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null) return false;

            notification.Status = NotificationStatus.Dismissed;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

            if (notification == null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task SendRealTimeNotificationAsync(int userId, NotificationDto notification)
        {
            try
            {
                await _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
                _logger.LogInformation($"Real-time notification sent to user {userId}: {notification.Title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send real-time notification to user {userId}");
            }
        }

        public async Task BroadcastNotificationAsync(List<int> userIds, NotificationDto notification)
        {
            try
            {
                var tasks = userIds.Select(userId =>
                    _hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification));

                await Task.WhenAll(tasks);
                _logger.LogInformation($"Broadcast notification sent to {userIds.Count} users: {notification.Title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to broadcast notification to users");
            }
        }

        // Convenience methods for common notification types
        public async Task CreatePetConnectionRequestNotificationAsync(int targetUserId, int requesterUserId, int connectionId, string requesterPetName, string targetPetName, int? requesterPetId = null)
        {
            var requester = await _context.Users.FindAsync(requesterUserId);
            var requesterName = requester?.FirstName ?? requester?.Username ?? "Someone";

            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.PetConnectionRequest,
                Title = "New Pet Connection Request",
                Message = $"{requesterName} wants to connect {requesterPetName} with {targetPetName}",
                RelatedUserId = requesterUserId,
                RelatedConnectionId = connectionId,
                RelatedPetId = requesterPetId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreatePetConnectionResponseNotificationAsync(int targetUserId, int responderUserId, int connectionId, bool isApproved, string requesterPetName, string responderPetName, int? connectedPetId = null)
        {
            var responder = await _context.Users.FindAsync(responderUserId);
            var responderName = responder?.FirstName ?? responder?.Username ?? "Someone";

            var type = isApproved ? NotificationType.PetConnectionApproved : NotificationType.PetConnectionRejected;
            var status = isApproved ? "accepted" : "declined";

            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = type,
                Title = $"Pet Connection Request {status.ToTitleCase()}",
                Message = $"{responderName} has {status} the connection request between {requesterPetName} and {responderPetName}",
                RelatedUserId = responderUserId,
                RelatedConnectionId = connectionId,
                RelatedPetId = connectedPetId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreatePetWeddingApprovalNotificationAsync(int targetUserId, int postId, string postTitle, string requesterName)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.PetWeddingPendingApproval,
                Title = "Pet Wedding Approval Needed",
                Message = $"{requesterName} has invited your pet to a wedding: {postTitle}",
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreatePetWeddingRequestNotificationAsync(int targetUserId, int postId, string postTitle, string requesterName)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.PetWeddingPendingApproval,
                Title = "Pet Wedding Request",
                Message = $"{requesterName} has invited your pet to participate in a wedding: {postTitle}. Please review and respond.",
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreateMeetupActivationNotificationAsync(int targetUserId, int postId, string postTitle)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.MeetupPendingActivation,
                Title = "Meetup Needs Activation",
                Message = $"Your meetup '{postTitle}' is pending activation",
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreateMeetupPendingNotificationAsync(int postId, string postTitle, string creatorName)
        {
            // Get all meetup admin and site admin user IDs
            var meetupAdminIds = await _userService.GetUserIdsByRoleAsync(UserRoles.MeetupAdmin);
            var siteAdminIds = await _userService.GetUserIdsByRoleAsync(UserRoles.SiteAdmin);
            
            var adminUserIds = meetupAdminIds.Concat(siteAdminIds).Distinct().ToList();

            if (!adminUserIds.Any())
            {
                _logger.LogWarning("No meetup admins or site admins found to notify about pending meetup {PostId}", postId);
                return;
            }

            // Create notifications for all admin users
            var notifications = new List<NotificationDto>();
            foreach (var adminId in adminUserIds)
            {
                var request = new CreateNotificationRequest
                {
                    UserId = adminId,
                    Type = NotificationType.MeetupPendingActivation,
                    Title = "New Meetup Requires Approval",
                    Message = $"{creatorName} created a meetup '{postTitle}' that needs your approval",
                    RelatedPostId = postId
                };

                var notification = await CreateNotificationAsync(request);
                notifications.Add(notification);
            }

            // Send real-time notifications to all admin users
            await BroadcastNotificationAsync(adminUserIds, notifications.First());
            
            _logger.LogInformation("Notified {AdminCount} admin(s) about pending meetup {PostId}", adminUserIds.Count, postId);
        }

        public async Task CreateMeetupApprovedNotificationAsync(int targetUserId, int postId, string postTitle)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.MeetupActivated,
                Title = "Meetup Approved",
                Message = $"Great news! Your meetup '{postTitle}' has been approved and is now active",
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreateMeetupRejectedNotificationAsync(int targetUserId, int postId, string postTitle)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.MeetupRejected,
                Title = "Meetup Not Approved",
                Message = $"Your meetup '{postTitle}' was not approved. Please contact support if you have questions",
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreatePostLikedNotificationAsync(int targetUserId, int likerUserId, int postId, string postTitle, string likerName)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.PostLiked,
                Title = "Post Liked",
                Message = $"{likerName} liked your post: {postTitle}",
                RelatedUserId = likerUserId,
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreatePostCommentedNotificationAsync(int targetUserId, int commenterUserId, int postId, string postTitle, string commenterName)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.PostCommented,
                Title = "New Comment",
                Message = $"{commenterName} commented on your post: {postTitle}",
                RelatedUserId = commenterUserId,
                RelatedPostId = postId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreateUserFollowedNotificationAsync(int targetUserId, int followerUserId, string followerName)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.UserFollowed,
                Title = "New Follower",
                Message = $"{followerName} started following you",
                RelatedUserId = followerUserId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CreateChatMessageNotificationAsync(int targetUserId, int senderId, string senderName, string messagePreview)
        {
            var request = new CreateNotificationRequest
            {
                UserId = targetUserId,
                Type = NotificationType.ChatMessage,
                Title = "New Message",
                Message = $"{senderName}: {messagePreview}",
                RelatedUserId = senderId
            };

            await CreateAndSendNotificationAsync(request);
        }

        public async Task CleanupOldNotificationsAsync()
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-30); // Keep notifications for 30 days

            var oldNotifications = await _context.Notifications
                .Where(n => n.CreatedAt < cutoffDate && n.Status != NotificationStatus.Unread)
                .ToListAsync();

            _context.Notifications.RemoveRange(oldNotifications);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Cleaned up {oldNotifications.Count} old notifications");
        }

        public async Task DeleteNotificationsByTypeAsync(int userId, NotificationType type)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.Type == type)
                .ToListAsync();

            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }

        private Task<NotificationDto> MapToNotificationDto(Notification notification)
        {
            return Task.FromResult(new NotificationDto
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Status = notification.Status,
                RelatedPostId = notification.RelatedPostId,
                RelatedPetId = notification.RelatedPetId,
                RelatedUserId = notification.RelatedUserId,
                RelatedConnectionId = notification.RelatedConnectionId,
                AdditionalData = notification.AdditionalData,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                RelatedUserName = notification.RelatedUser != null 
                    ? $"{notification.RelatedUser.FirstName} {notification.RelatedUser.LastName}".Trim() 
                    ?? notification.RelatedUser.Username 
                    : null,
                RelatedPetName = notification.RelatedPet?.Name,
                RelatedPostTitle = notification.RelatedPost?.Title
            });
        }
    }

    // Extension method for string formatting
    public static class StringExtensions
    {
        public static string ToTitleCase(this string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }
    }
} 