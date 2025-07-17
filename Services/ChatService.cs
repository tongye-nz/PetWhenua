using Microsoft.EntityFrameworkCore;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;

        public ChatService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatRoomDto>> GetUserChatRoomsAsync(int userId)
        {
            var chatRooms = await _context.ChatRooms
                .Where(cr => cr.User1Id == userId || cr.User2Id == userId)
                .Include(cr => cr.User1)
                .Include(cr => cr.User2)
                .OrderByDescending(cr => cr.LastMessageAt)
                .Select(cr => new ChatRoomDto
                {
                    ChatRoomId = cr.ChatRoomId,
                    User1Id = cr.User1Id,
                    User2Id = cr.User2Id,
                    User1 = new UserSummaryDto
                    {
                        UserId = cr.User1.UserId,
                        FirstName = cr.User1.FirstName,
                        LastName = cr.User1.LastName,
                        ProfilePicture = cr.User1.ProfilePicture,
                        Location = cr.User1.Location
                    },
                    User2 = new UserSummaryDto
                    {
                        UserId = cr.User2.UserId,
                        FirstName = cr.User2.FirstName,
                        LastName = cr.User2.LastName,
                        ProfilePicture = cr.User2.ProfilePicture,
                        Location = cr.User2.Location
                    },
                    CreatedAt = cr.CreatedAt,
                    LastMessageAt = cr.LastMessageAt,
                    LastMessage = cr.LastMessage,
                    LastMessageSenderId = cr.LastMessageSenderId
                })
                .ToListAsync();

            return chatRooms;
        }

        public async Task<ChatRoomDto> GetOrCreateChatRoomAsync(int user1Id, int user2Id)
        {
            // Ensure user1Id is always the smaller ID for consistency
            if (user1Id > user2Id)
            {
                (user1Id, user2Id) = (user2Id, user1Id);
            }

            var existingRoom = await _context.ChatRooms
                .Where(cr => cr.User1Id == user1Id && cr.User2Id == user2Id)
                .Include(cr => cr.User1)
                .Include(cr => cr.User2)
                .FirstOrDefaultAsync();

            if (existingRoom != null)
            {
                return new ChatRoomDto
                {
                    ChatRoomId = existingRoom.ChatRoomId,
                    User1Id = existingRoom.User1Id,
                    User2Id = existingRoom.User2Id,
                    User1 = new UserSummaryDto
                    {
                        UserId = existingRoom.User1.UserId,
                        FirstName = existingRoom.User1.FirstName,
                        LastName = existingRoom.User1.LastName,
                        ProfilePicture = existingRoom.User1.ProfilePicture,
                        Location = existingRoom.User1.Location
                    },
                    User2 = new UserSummaryDto
                    {
                        UserId = existingRoom.User2.UserId,
                        FirstName = existingRoom.User2.FirstName,
                        LastName = existingRoom.User2.LastName,
                        ProfilePicture = existingRoom.User2.ProfilePicture,
                        Location = existingRoom.User2.Location
                    },
                    CreatedAt = existingRoom.CreatedAt,
                    LastMessageAt = existingRoom.LastMessageAt,
                    LastMessage = existingRoom.LastMessage,
                    LastMessageSenderId = existingRoom.LastMessageSenderId
                };
            }

            // Create new chat room
            var newRoom = new ChatRoom
            {
                User1Id = user1Id,
                User2Id = user2Id,
                CreatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow
            };

            _context.ChatRooms.Add(newRoom);
            await _context.SaveChangesAsync();

            // Load the full entity with users
            var createdRoom = await _context.ChatRooms
                .Where(cr => cr.ChatRoomId == newRoom.ChatRoomId)
                .Include(cr => cr.User1)
                .Include(cr => cr.User2)
                .FirstOrDefaultAsync();

            return new ChatRoomDto
            {
                ChatRoomId = createdRoom!.ChatRoomId,
                User1Id = createdRoom.User1Id,
                User2Id = createdRoom.User2Id,
                User1 = new UserSummaryDto
                {
                    UserId = createdRoom.User1.UserId,
                    FirstName = createdRoom.User1.FirstName,
                    LastName = createdRoom.User1.LastName,
                    ProfilePicture = createdRoom.User1.ProfilePicture,
                    Location = createdRoom.User1.Location
                },
                User2 = new UserSummaryDto
                {
                    UserId = createdRoom.User2.UserId,
                    FirstName = createdRoom.User2.FirstName,
                    LastName = createdRoom.User2.LastName,
                    ProfilePicture = createdRoom.User2.ProfilePicture,
                    Location = createdRoom.User2.Location
                },
                CreatedAt = createdRoom.CreatedAt,
                LastMessageAt = createdRoom.LastMessageAt,
                LastMessage = createdRoom.LastMessage,
                LastMessageSenderId = createdRoom.LastMessageSenderId
            };
        }

        public async Task<IEnumerable<ChatMessageDto>> GetChatMessagesAsync(int chatRoomId, int page = 1, int limit = 50)
        {
            var messages = await _context.ChatMessages
                .Where(cm => cm.ChatRoomId == chatRoomId)
                .Include(cm => cm.Sender)
                .Include(cm => cm.RelatedPost)
                .Include(cm => cm.RelatedPet)
                .OrderByDescending(cm => cm.SentAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(cm => new ChatMessageDto
                {
                    MessageId = cm.MessageId,
                    SenderId = cm.SenderId,
                    ReceiverId = cm.ReceiverId,
                    Content = cm.Content,
                    Status = cm.Status,
                    SentAt = cm.SentAt,
                    DeliveredAt = cm.DeliveredAt,
                    ReadAt = cm.ReadAt,
                    RelatedPostId = cm.RelatedPostId,
                    RelatedPetId = cm.RelatedPetId,
                    SenderName = $"{cm.Sender.FirstName} {cm.Sender.LastName}",
                    SenderProfilePicture = cm.Sender.ProfilePicture,
                    RelatedPostTitle = cm.RelatedPost != null ? cm.RelatedPost.Title : null,
                    RelatedPetName = cm.RelatedPet != null ? cm.RelatedPet.Name : null
                })
                .ToListAsync();

            return messages.OrderBy(m => m.SentAt);
        }

        public async Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request)
        {
            // Get the chat room to find the receiver
            var chatRoom = await _context.ChatRooms
                .Where(cr => cr.ChatRoomId == request.ChatRoomId)
                .FirstOrDefaultAsync();

            if (chatRoom == null)
            {
                throw new ArgumentException("Chat room not found");
            }

            var receiverId = chatRoom.User1Id == senderId ? chatRoom.User2Id : chatRoom.User1Id;

            var message = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = request.Content,
                Status = MessageStatus.Sent,
                SentAt = DateTime.UtcNow,
                RelatedPostId = request.RelatedPostId,
                RelatedPetId = request.RelatedPetId,
                ChatRoomId = request.ChatRoomId
            };

            _context.ChatMessages.Add(message);

            // Update chat room's last message
            chatRoom.LastMessage = request.Content.Length > 100 
                ? request.Content.Substring(0, 97) + "..." 
                : request.Content;
            chatRoom.LastMessageAt = DateTime.UtcNow;
            chatRoom.LastMessageSenderId = senderId;

            await _context.SaveChangesAsync();

            // Load the message with sender information
            var savedMessage = await _context.ChatMessages
                .Where(cm => cm.MessageId == message.MessageId)
                .Include(cm => cm.Sender)
                .Include(cm => cm.RelatedPost)
                .Include(cm => cm.RelatedPet)
                .Select(cm => new ChatMessageDto
                {
                    MessageId = cm.MessageId,
                    SenderId = cm.SenderId,
                    ReceiverId = cm.ReceiverId,
                    Content = cm.Content,
                    Status = cm.Status,
                    SentAt = cm.SentAt,
                    DeliveredAt = cm.DeliveredAt,
                    ReadAt = cm.ReadAt,
                    RelatedPostId = cm.RelatedPostId,
                    RelatedPetId = cm.RelatedPetId,
                    SenderName = $"{cm.Sender.FirstName} {cm.Sender.LastName}",
                    SenderProfilePicture = cm.Sender.ProfilePicture,
                    RelatedPostTitle = cm.RelatedPost != null ? cm.RelatedPost.Title : null,
                    RelatedPetName = cm.RelatedPet != null ? cm.RelatedPet.Name : null
                })
                .FirstOrDefaultAsync();

            return savedMessage!;
        }

        public async Task MarkMessagesAsReadAsync(int chatRoomId, int userId)
        {
            var messages = await _context.ChatMessages
                .Where(cm => cm.ChatRoomId == chatRoomId && cm.ReceiverId == userId && cm.ReadAt == null)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.ReadAt = DateTime.UtcNow;
                message.Status = MessageStatus.Read;
            }

            await _context.SaveChangesAsync();
        }

        public async Task MarkMessageAsDeliveredAsync(int messageId, int userId)
        {
            var message = await _context.ChatMessages
                .Where(cm => cm.MessageId == messageId && cm.ReceiverId == userId)
                .FirstOrDefaultAsync();

            if (message != null && message.DeliveredAt == null)
            {
                message.DeliveredAt = DateTime.UtcNow;
                message.Status = MessageStatus.Delivered;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetUnreadMessageCountAsync(int userId)
        {
            return await _context.ChatMessages
                .Where(cm => cm.ReceiverId == userId && cm.ReadAt == null)
                .CountAsync();
        }

        public async Task DeleteMessageAsync(int messageId)
        {
            var message = await _context.ChatMessages
                .FindAsync(messageId);

            if (message != null)
            {
                _context.ChatMessages.Remove(message);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> UserHasAccessToChatRoomAsync(int userId, int chatRoomId)
        {
            return await _context.ChatRooms
                .AnyAsync(cr => cr.ChatRoomId == chatRoomId && (cr.User1Id == userId || cr.User2Id == userId));
        }

        public async Task<bool> UserCanDeleteMessageAsync(int messageId, int userId)
        {
            return await _context.ChatMessages
                .AnyAsync(cm => cm.MessageId == messageId && cm.SenderId == userId);
        }

        public async Task<int?> GetOtherUserInChatRoomAsync(int chatRoomId, int currentUserId)
        {
            var chatRoom = await _context.ChatRooms
                .Where(cr => cr.ChatRoomId == chatRoomId)
                .FirstOrDefaultAsync();

            if (chatRoom == null)
                return null;

            return chatRoom.User1Id == currentUserId ? chatRoom.User2Id : chatRoom.User1Id;
        }

        public async Task<ChatRoom?> GetChatRoomAsync(int chatRoomId)
        {
            return await _context.ChatRooms
                .Include(cr => cr.User1)
                .Include(cr => cr.User2)
                .FirstOrDefaultAsync(cr => cr.ChatRoomId == chatRoomId);
        }

        public async Task<ChatMessage?> GetMessageAsync(int messageId)
        {
            return await _context.ChatMessages
                .Include(cm => cm.Sender)
                .Include(cm => cm.Receiver)
                .FirstOrDefaultAsync(cm => cm.MessageId == messageId);
        }
    }
} 