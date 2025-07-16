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
            var userFollows = await _context.UserFollows
                .Where(uf => uf.FollowingId == userId)
                .Include(uf => uf.Follower)
                .ToListAsync();

            return userFollows.Select(uf => new User
            {
                UserId = uf.Follower.UserId,
                Username = uf.Follower.Username,
                FirstName = uf.Follower.FirstName,
                LastName = uf.Follower.LastName,
                ProfilePicture = uf.Follower.ProfilePicture,
                Bio = uf.Follower.Bio,
                Location = uf.Follower.Location,
                CreatedAt = uf.Follower.CreatedAt,
                Email = uf.Follower.Email,
                Role = uf.Follower.Role,
                IsActive = uf.Follower.IsActive
            });
        }

        public async Task<IEnumerable<User>> GetFollowingAsync(int userId)
        {
            var userFollows = await _context.UserFollows
                .Where(uf => uf.FollowerId == userId)
                .Include(uf => uf.Following)
                .ToListAsync();

            return userFollows.Select(uf => new User
            {
                UserId = uf.Following.UserId,
                Username = uf.Following.Username,
                FirstName = uf.Following.FirstName,
                LastName = uf.Following.LastName,
                ProfilePicture = uf.Following.ProfilePicture,
                Bio = uf.Following.Bio,
                Location = uf.Following.Location,
                CreatedAt = uf.Following.CreatedAt,
                Email = uf.Following.Email,
                Role = uf.Following.Role,
                IsActive = uf.Following.IsActive
            });
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
