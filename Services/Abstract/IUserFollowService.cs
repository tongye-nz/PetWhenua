namespace PetWhenua.Services.Abstract
{
    public interface IUserFollowService
    {
        Task<UserFollow> FollowUserAsync(int followerId, int followingId);
        Task<bool> UnfollowUserAsync(int followerId, int followingId);
        Task<bool> IsFollowingAsync(int followerId, int followingId);
        Task<IEnumerable<User>> GetFollowersAsync(int userId);
        Task<IEnumerable<User>> GetFollowingAsync(int userId);
        Task<int> GetFollowerCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);
    }
}
