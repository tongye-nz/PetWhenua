using Microsoft.EntityFrameworkCore;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Repositories.Concrete
{
    public class PostRepository : IPostRepository
    {
        private readonly AppDbContext _context;

        public PostRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Post>> GetAllPostsAsync(PostType? postType = null, int? userId = null, string? region = null, string? district = null)
        {
            var query = _context.Posts
                .Include(p => p.User)
                .Include(p => p.PetWeddingParticipants)
                .ThenInclude(pwp => pwp.Pet)
                .AsQueryable();

            // Only show active posts for public browsing (unless filtering by specific userId for user's own posts)
            if (!userId.HasValue)
            {
                query = query.Where(p => p.Status == PostStatus.Active);
            }

            if (postType.HasValue)
            {
                query = query.Where(p => p.PostType == postType.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(p => p.UserId == userId.Value);
            }

            if (!string.IsNullOrEmpty(region))
            {
                query = query.Where(p => p.Location != null && p.Location.Contains(region));
            }

            if (!string.IsNullOrEmpty(district))
            {
                query = query.Where(p => p.Location != null && p.Location.Contains(district));
            }

            return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.PetWeddingParticipants)
                .ThenInclude(pwp => pwp.Pet)
                .FirstOrDefaultAsync(p => p.PostId == id);
        }

        public async Task<Post> AddPostAsync(Post post)
        {
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<Post> UpdatePostAsync(Post post)
        {
            _context.Posts.Update(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return false;
            }

            // Delete related data that doesn't have cascade delete configured
            // This prevents foreign key constraint violations

            // Delete related notifications
            var relatedNotifications = await _context.Notifications
                .Where(n => n.RelatedPostId == id)
                .ToListAsync();
            if (relatedNotifications.Any())
            {
                _context.Notifications.RemoveRange(relatedNotifications);
            }

            // Delete related chat messages
            var relatedChatMessages = await _context.ChatMessages
                .Where(cm => cm.RelatedPostId == id)
                .ToListAsync();
            if (relatedChatMessages.Any())
            {
                _context.ChatMessages.RemoveRange(relatedChatMessages);
            }

            // Now delete the post (cascade delete will handle Comments, Likes, PostImages, PetWeddingParticipants)
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Include(p => p.PetWeddingParticipants)
                .ThenInclude(pwp => pwp.Pet)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.PostType == postType && p.Status == PostStatus.Active)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAndStatusAsync(PostType postType, PostStatus status)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.PostType == postType && p.Status == status)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> PostExistsAsync(int id)
        {
            return await _context.Posts.AnyAsync(p => p.PostId == id);
        }

        public async Task<bool> UserExistsAsync(int userId)
        {
            return await _context.Users.AnyAsync(u => u.UserId == userId);
        }

        public async Task<IEnumerable<Post>> GetExpirablePostsAsync(DateTime currentDate)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => 
                    (p.PostType == PostType.Meetup || p.PostType == PostType.PetWedding) &&
                    p.Status == PostStatus.Active &&
                    p.EventDate.HasValue &&
                    p.EventDate.Value.Date < currentDate.Date)
                .OrderBy(p => p.EventDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetActiveTimeBasedPostsAsync()
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => 
                    (p.PostType == PostType.Meetup || p.PostType == PostType.PetWedding) &&
                    p.Status == PostStatus.Active &&
                    p.EventDate.HasValue)
                .OrderBy(p => p.EventDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetAllPostsByTypeAsync(PostType postType)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.PostType == postType)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}
