using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PetWhenua.Services;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;
using PetWhenua.Hubs;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ChatController(
            IChatService chatService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext)
        {
            _chatService = chatService;
            _notificationService = notificationService;
            _hubContext = hubContext;
        }

        // GET: api/chat/rooms
        [HttpGet("rooms")]
        public async Task<ActionResult<IEnumerable<ChatRoomDto>>> GetChatRooms()
        {
            try
            {
                var userId = GetCurrentUserId();
                var chatRooms = await _chatService.GetUserChatRoomsAsync(userId);
                return Ok(chatRooms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve chat rooms", error = ex.Message });
            }
        }

        // POST: api/chat/rooms
        [HttpPost("rooms")]
        public async Task<ActionResult<ChatRoomDto>> CreateOrGetChatRoom([FromBody] CreateChatRoomRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var chatRoom = await _chatService.GetOrCreateChatRoomAsync(userId, request.OtherUserId);
                return Ok(chatRoom);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create chat room", error = ex.Message });
            }
        }

        // GET: api/chat/rooms/{chatRoomId}/messages
        [HttpGet("rooms/{chatRoomId}/messages")]
        public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetMessages(int chatRoomId, [FromQuery] int page = 1, [FromQuery] int limit = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify user has access to this chat room
                if (!await _chatService.UserHasAccessToChatRoomAsync(userId, chatRoomId))
                {
                    return Forbid("You don't have access to this chat room");
                }

                var messages = await _chatService.GetChatMessagesAsync(chatRoomId, page, limit);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve messages", error = ex.Message });
            }
        }

        // POST: api/chat/messages
        [HttpPost("messages")]
        public async Task<ActionResult<ChatMessageDto>> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                var senderId = GetCurrentUserId();
                var message = await _chatService.SendMessageAsync(senderId, request);

                // Send real-time notification via SignalR
                await _hubContext.Clients.User(request.ReceiverId.ToString())
                    .SendAsync("ReceiveMessage", new
                    {
                        messageId = message.MessageId,
                        senderId = message.SenderId,
                        senderName = message.SenderName,
                        content = message.Content,
                        sentAt = message.SentAt,
                        chatRoomId = request.ChatRoomId
                    });

                // Create notification for the receiver
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = request.ReceiverId,
                    Type = NotificationType.ChatMessage,
                    Title = "New Message",
                    Message = $"{message.SenderName} sent you a message",
                    RelatedUserId = senderId
                });

                return Ok(message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send message", error = ex.Message });
            }
        }

        // PUT: api/chat/rooms/{chatRoomId}/mark-read
        [HttpPut("rooms/{chatRoomId}/mark-read")]
        public async Task<IActionResult> MarkMessagesAsRead(int chatRoomId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify user has access to this chat room
                if (!await _chatService.UserHasAccessToChatRoomAsync(userId, chatRoomId))
                {
                    return Forbid("You don't have access to this chat room");
                }

                await _chatService.MarkMessagesAsReadAsync(chatRoomId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to mark messages as read", error = ex.Message });
            }
        }

        // PUT: api/chat/messages/{messageId}/delivered
        [HttpPut("messages/{messageId}/delivered")]
        public async Task<IActionResult> MarkMessageAsDelivered(int messageId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _chatService.MarkMessageAsDeliveredAsync(messageId, userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to mark message as delivered", error = ex.Message });
            }
        }

        // GET: api/chat/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<object>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                var count = await _chatService.GetUnreadMessageCountAsync(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get unread count", error = ex.Message });
            }
        }

        // DELETE: api/chat/messages/{messageId}
        [HttpDelete("messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Check if user can delete this message (only sender can delete)
                if (!await _chatService.UserCanDeleteMessageAsync(messageId, userId))
                {
                    return Forbid("You can only delete your own messages");
                }

                await _chatService.DeleteMessageAsync(messageId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete message", error = ex.Message });
            }
        }

        // GET: api/chat/typing/{chatRoomId}/{isTyping}
        [HttpPost("typing")]
        public async Task<IActionResult> SetTypingStatus([FromBody] TypingStatusRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Verify user has access to this chat room
                if (!await _chatService.UserHasAccessToChatRoomAsync(userId, request.ChatRoomId))
                {
                    return Forbid("You don't have access to this chat room");
                }

                // Get the other user in the chat room to send typing indicator
                var otherUserId = await _chatService.GetOtherUserInChatRoomAsync(request.ChatRoomId, userId);
                
                if (otherUserId.HasValue)
                {
                    await _hubContext.Clients.User(otherUserId.Value.ToString())
                        .SendAsync("TypingStatus", new
                        {
                            chatRoomId = request.ChatRoomId,
                            userId = userId,
                            isTyping = request.IsTyping
                        });
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to set typing status", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }
    }

    // DTOs for requests
    public class CreateChatRoomRequest
    {
        public int OtherUserId { get; set; }
    }

    public class TypingStatusRequest
    {
        public int ChatRoomId { get; set; }
        public bool IsTyping { get; set; }
    }
} 