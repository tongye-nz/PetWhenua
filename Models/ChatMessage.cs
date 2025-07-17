using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models
{
    public enum MessageStatus
    {
        Sent = 0,
        Delivered = 1,
        Read = 2
    }

    public class ChatMessage
    {
        [Key]
        public int MessageId { get; set; }

        [Required]
        public int SenderId { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        public MessageStatus Status { get; set; } = MessageStatus.Sent;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveredAt { get; set; }
        public DateTime? ReadAt { get; set; }

        // Optional: Reference to a post or pet for context
        public int? RelatedPostId { get; set; }
        public int? RelatedPetId { get; set; }

        // Chat room reference
        public int? ChatRoomId { get; set; }

        // Navigation properties
        public virtual User Sender { get; set; } = null!;
        public virtual User Receiver { get; set; } = null!;
        public virtual Post? RelatedPost { get; set; }
        public virtual Pet? RelatedPet { get; set; }
        public virtual ChatRoom? ChatRoom { get; set; }
    }

    // Chat Room for tracking conversations between users
    public class ChatRoom
    {
        [Key]
        public int ChatRoomId { get; set; }

        [Required]
        public int User1Id { get; set; }

        [Required]
        public int User2Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        // Last message preview
        public string? LastMessage { get; set; }
        public int? LastMessageSenderId { get; set; }

        // Navigation properties
        public virtual User User1 { get; set; } = null!;
        public virtual User User2 { get; set; } = null!;
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
} 