using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Collections.Concurrent;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        // Track user connections - In production, use Redis or database
        private static readonly ConcurrentDictionary<int, HashSet<string>> UserConnections = new();
        private static readonly ConcurrentDictionary<string, int> ConnectionUsers = new();

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId > 0)
            {
                // Add connection to user tracking
                UserConnections.AddOrUpdate(userId, 
                    new HashSet<string> { Context.ConnectionId },
                    (key, existing) => 
                    {
                        existing.Add(Context.ConnectionId);
                        return existing;
                    });

                ConnectionUsers[Context.ConnectionId] = userId;

                // Join personal notification group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                
                // Notify other users that this user is online
                await Clients.All.SendAsync("UserOnlineStatus", new { UserId = userId, IsOnline = true });

                Console.WriteLine($"User {userId} connected with connection {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            if (userId > 0)
            {
                // Remove connection from user tracking
                if (UserConnections.TryGetValue(userId, out var connections))
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        UserConnections.TryRemove(userId, out _);
                        // User is completely offline
                        await Clients.All.SendAsync("UserOnlineStatus", new { UserId = userId, IsOnline = false });
                    }
                }

                ConnectionUsers.TryRemove(Context.ConnectionId, out _);

                // Leave personal notification group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");

                Console.WriteLine($"User {userId} disconnected from connection {Context.ConnectionId}");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Send notification to specific user
        public async Task SendNotificationToUser(int targetUserId, NotificationDto notification)
        {
            await Clients.Group($"user_{targetUserId}").SendAsync("ReceiveNotification", notification);
        }

        // Send chat message to specific user
        public async Task SendChatMessage(int receiverId, ChatMessageDto message)
        {
            var senderId = GetCurrentUserId();
            
            // Send to receiver
            await Clients.Group($"user_{receiverId}").SendAsync("ReceiveChatMessage", message);
            
            // Send back to sender for confirmation (different event to avoid loops)
            await Clients.Group($"user_{senderId}").SendAsync("ChatMessageSent", message);
        }

        // Join a specific chat room
        public async Task JoinChatRoom(int chatRoomId, int otherUserId)
        {
            var userId = GetCurrentUserId();
            var roomName = $"chat_{chatRoomId}";
            
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            
            // Notify the other user that someone joined the chat
            await Clients.Group($"user_{otherUserId}").SendAsync("UserJoinedChat", new { 
                UserId = userId, 
                ChatRoomId = chatRoomId 
            });

            Console.WriteLine($"User {userId} joined chat room {chatRoomId}");
        }

        // Leave a specific chat room
        public async Task LeaveChatRoom(int chatRoomId, int otherUserId)
        {
            var userId = GetCurrentUserId();
            var roomName = $"chat_{chatRoomId}";
            
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
            
            // Notify the other user that someone left the chat
            await Clients.Group($"user_{otherUserId}").SendAsync("UserLeftChat", new { 
                UserId = userId, 
                ChatRoomId = chatRoomId 
            });

            Console.WriteLine($"User {userId} left chat room {chatRoomId}");
        }

        // Handle typing indicators for chat
        public async Task SendTypingIndicator(int chatRoomId, int receiverId, bool isTyping)
        {
            var userId = GetCurrentUserId();
            var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";

            var typingIndicator = new TypingIndicatorDto
            {
                UserId = userId,
                UserName = userName,
                ChatRoomId = chatRoomId,
                IsTyping = isTyping,
                Timestamp = DateTime.UtcNow
            };

            // Send typing indicator to the other user
            await Clients.Group($"user_{receiverId}").SendAsync("TypingIndicator", typingIndicator);
        }

        // Mark messages as read
        public async Task MarkMessagesAsRead(int chatRoomId, int senderId, List<int> messageIds)
        {
            var userId = GetCurrentUserId();
            
            // Notify the sender that their messages have been read
            await Clients.Group($"user_{senderId}").SendAsync("MessagesMarkedAsRead", new {
                ChatRoomId = chatRoomId,
                MessageIds = messageIds,
                ReadBy = userId,
                ReadAt = DateTime.UtcNow
            });
        }

        // Broadcast notification to multiple users (for general announcements)
        public async Task BroadcastNotification(List<int> userIds, NotificationDto notification)
        {
            var tasks = userIds.Select(userId => 
                Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification));
            
            await Task.WhenAll(tasks);
        }

        // Get online status of users
        public async Task RequestOnlineUsers(List<int> userIds)
        {
            var onlineUsers = userIds.Where(id => UserConnections.ContainsKey(id)).ToList();
            await Clients.Caller.SendAsync("OnlineUsersResponse", onlineUsers);
        }

        // Helper method to get current user ID from JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return 0;
            }
            return userId;
        }

        // Static method to check if user is online (for use in controllers)
        public static bool IsUserOnline(int userId)
        {
            return UserConnections.ContainsKey(userId);
        }

        // Static method to get user connection IDs (for use in controllers)
        public static HashSet<string>? GetUserConnections(int userId)
        {
            return UserConnections.TryGetValue(userId, out var connections) ? connections : null;
        }
    }
} 