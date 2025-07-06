using Microsoft.EntityFrameworkCore;

namespace PetWhenua.Services
{
    public class PostService : IPostService
    {
        private readonly AppDbContext _context;

        public PostService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null)
        {
            var query = _context.Posts.Include(p => p.User).AsQueryable();

            if (postType.HasValue)
            {
                query = query.Where(p => p.PostType == postType.Value);
            }

            if (userId.HasValue)
            {
                query = query.Where(p => p.UserId == userId.Value);
            }

            return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PostId == id);
        }

        public async Task<Post> CreatePostAsync(Post post)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserId == post.UserId);
            if (!userExists)
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return post;
        }

        public async Task<Post> UpdatePostAsync(Post post)
        {
            var existingPost = await _context.Posts.FindAsync(post.PostId);
            if (existingPost == null)
            {
                throw new InvalidOperationException($"Post with ID {post.PostId} not found.");
            }

            // Update properties
            existingPost.PostType = post.PostType;
            existingPost.Title = post.Title;
            existingPost.Description = post.Description;
            existingPost.Content = post.Content;
            existingPost.Images = post.Images;
            existingPost.Location = post.Location;
            existingPost.Price = post.Price;
            existingPost.EventDate = post.EventDate;
            existingPost.Category = post.Category;
            existingPost.Status = post.Status;
            existingPost.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingPost;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return false;
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                throw new InvalidOperationException($"User with ID {userId} not found.");
            }

            return await _context.Posts
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            return await _context.Posts
                .Include(p => p.User)
                .Where(p => p.PostType == postType)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> PostExistsAsync(int id)
        {
            return await _context.Posts.AnyAsync(p => p.PostId == id);
        }
    }
}
