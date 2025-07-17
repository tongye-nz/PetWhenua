using PetWhenua.Models;

namespace PetWhenua.Models.Dtos
{
    public class ChatRoomDto
    {
        public int ChatRoomId { get; set; }
        public int User1Id { get; set; }
        public int User2Id { get; set; }
        public UserSummaryDto User1 { get; set; } = null!;
        public UserSummaryDto User2 { get; set; } = null!;
        public string CreatedAt { get; set; } = string.Empty;
        public string LastMessageAt { get; set; } = string.Empty;
        public string? LastMessage { get; set; }
        public int? LastMessageSenderId { get; set; }
    }

    public class ChatMessageDto
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public MessageStatus Status { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderProfilePicture { get; set; }
        public string? RelatedPostTitle { get; set; }
        public string? RelatedPetName { get; set; }
    }

    public class SendMessageRequest
    {
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }
        public int? ChatRoomId { get; set; }
    }

    public class ChatUnreadCountDto
    {
        public int Count { get; set; }
    }

    public class UpdateMessageStatusRequest
    {
        public MessageStatus Status { get; set; }
    }

    // Real-time chat message payload for SignalR
    public class RealTimeChatMessageDto
    {
        public ChatMessageDto Message { get; set; } = null!;
        public string ChatRoomId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    // Typing indicator for real-time chat
    public class TypingIndicatorDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int ChatRoomId { get; set; }
        public bool IsTyping { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    // Chat participant information
    public class ChatParticipantDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? ProfilePicture { get; set; }
        public bool IsOnline { get; set; }
        public DateTime? LastSeen { get; set; }
    }
} 