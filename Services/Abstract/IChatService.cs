using PetWhenua.Models;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public interface IChatService
    {
        Task<IEnumerable<ChatRoomDto>> GetUserChatRoomsAsync(int userId);
        Task<ChatRoomDto> GetOrCreateChatRoomAsync(int user1Id, int user2Id);
        Task<IEnumerable<ChatMessageDto>> GetChatMessagesAsync(int chatRoomId, int page = 1, int limit = 50);
        Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request);
        Task MarkMessagesAsReadAsync(int chatRoomId, int userId);
        Task MarkMessageAsDeliveredAsync(int messageId, int userId);
        Task<int> GetUnreadMessageCountAsync(int userId);
        Task DeleteMessageAsync(int messageId);
        Task<bool> UserHasAccessToChatRoomAsync(int userId, int chatRoomId);
        Task<bool> UserCanDeleteMessageAsync(int messageId, int userId);
        Task<int?> GetOtherUserInChatRoomAsync(int chatRoomId, int currentUserId);
        Task<ChatRoom?> GetChatRoomAsync(int chatRoomId);
        Task<ChatMessage?> GetMessageAsync(int messageId);
    }
} 