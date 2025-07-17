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
                    CreatedAt = cr.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    LastMessageAt = cr.LastMessageAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
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
                .FirstOrDefaultAsync();

            if (existingRoom != null)
            {
                // Manually fetch user data
                var user1 = await _context.Users.FindAsync(existingRoom.User1Id);
                var user2 = await _context.Users.FindAsync(existingRoom.User2Id);

                return new ChatRoomDto
                {
                    ChatRoomId = existingRoom.ChatRoomId,
                    User1Id = existingRoom.User1Id,
                    User2Id = existingRoom.User2Id,
                    User1 = new UserSummaryDto
                    {
                        UserId = user1?.UserId ?? 0,
                        FirstName = user1?.FirstName,
                        LastName = user1?.LastName,
                        ProfilePicture = user1?.ProfilePicture,
                        Location = user1?.Location
                    },
                    User2 = new UserSummaryDto
                    {
                        UserId = user2?.UserId ?? 0,
                        FirstName = user2?.FirstName,
                        LastName = user2?.LastName,
                        ProfilePicture = user2?.ProfilePicture,
                        Location = user2?.Location
                    },
                    CreatedAt = existingRoom.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    LastMessageAt = existingRoom.LastMessageAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
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

            // Manually fetch user data for new room
            var newUser1 = await _context.Users.FindAsync(user1Id);
            var newUser2 = await _context.Users.FindAsync(user2Id);

            return new ChatRoomDto
            {
                ChatRoomId = newRoom.ChatRoomId,
                User1Id = newRoom.User1Id,
                User2Id = newRoom.User2Id,
                User1 = new UserSummaryDto
                {
                    UserId = newUser1?.UserId ?? 0,
                    FirstName = newUser1?.FirstName,
                    LastName = newUser1?.LastName,
                    ProfilePicture = newUser1?.ProfilePicture,
                    Location = newUser1?.Location
                },
                User2 = new UserSummaryDto
                {
                    UserId = newUser2?.UserId ?? 0,
                    FirstName = newUser2?.FirstName,
                    LastName = newUser2?.LastName,
                    ProfilePicture = newUser2?.ProfilePicture,
                    Location = newUser2?.Location
                },
                CreatedAt = newRoom.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                LastMessageAt = newRoom.LastMessageAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                LastMessage = newRoom.LastMessage,
                LastMessageSenderId = newRoom.LastMessageSenderId
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