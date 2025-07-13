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

        public async Task<IEnumerable<Post>> GetAllPostsAsync(PostType? postType = null, int? userId = null)
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

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
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
    }
}
