using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Abstract;

namespace PetWhenua.Services
{
    public class UserFollowService : IUserFollowService
    {
        private readonly AppDbContext _context;

        public UserFollowService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserFollow> FollowUserAsync(int followerId, int followingId)
        {
            if (followerId == followingId)
                throw new InvalidOperationException("Users cannot follow themselves");

            var existingFollow = await _context.UserFollows
                .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowingId == followingId);

            if (existingFollow != null)
                throw new InvalidOperationException("User is already being followed");

            var userFollow = new UserFollow
            {
                FollowerId = followerId,
                FollowingId = followingId,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserFollows.Add(userFollow);
            await _context.SaveChangesAsync();

            return userFollow;
        }

        public async Task<bool> UnfollowUserAsync(int followerId, int followingId)
        {
            var userFollow = await _context.UserFollows
                .FirstOrDefaultAsync(uf => uf.FollowerId == followerId && uf.FollowingId == followingId);

            if (userFollow == null)
                return false;

            _context.UserFollows.Remove(userFollow);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _context.UserFollows
                .AnyAsync(uf => uf.FollowerId == followerId && uf.FollowingId == followingId);
        }

        public async Task<IEnumerable<User>> GetFollowersAsync(int userId)
        {
            return await _context.UserFollows
                .Where(uf => uf.FollowingId == userId)
                .Include(uf => uf.Follower)
                .Select(uf => uf.Follower)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetFollowingAsync(int userId)
        {
            return await _context.UserFollows
                .Where(uf => uf.FollowerId == userId)
                .Include(uf => uf.Following)
                .Select(uf => uf.Following)
                .ToListAsync();
        }

        public async Task<int> GetFollowerCountAsync(int userId)
        {
            return await _context.UserFollows
                .CountAsync(uf => uf.FollowingId == userId);
        }

        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.UserFollows
                .CountAsync(uf => uf.FollowerId == userId);
        }
    }
}
