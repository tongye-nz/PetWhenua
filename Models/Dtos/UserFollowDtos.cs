using System.ComponentModel.DataAnnotations;

namespace PetWhenua.Models.Dtos
{
    public class UserFollowDto
    {
        public int UserFollowId { get; set; }
        public int FollowerId { get; set; }
        public int FollowingId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FollowResponse
    {
        public string Message { get; set; } = string.Empty;
        public UserFollowDto? Follow { get; set; }
    }

    public class UnfollowResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class IsFollowingResponse
    {
        public bool IsFollowing { get; set; }
    }

    public class FollowStats
    {
        public int FollowerCount { get; set; }
        public int FollowingCount { get; set; }
    }
} 