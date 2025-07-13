using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    /// <summary>
    /// Basic post service for API testing
    /// </summary>
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IPostFactory _postFactory;

        public PostService(
            IPostRepository postRepository,
            IPostFactory postFactory)
        {
            _postRepository = postRepository;
            _postFactory = postFactory;
        }

        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null)
        {
            return await _postRepository.GetAllPostsAsync(postType, userId);
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await _postRepository.GetPostByIdAsync(id);
        }

        public async Task<Post> CreatePostAsync(Post post)
        {
            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostAsync(int userId, PostType postType, string title, string content)
        {
            var post = _postFactory.CreatePost(userId, postType, title, content);
            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostWithUserRoleAsync(int userId, string userRole, PostType postType, string title, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> UpdatePostAsync(Post post)
        {
            return await _postRepository.UpdatePostAsync(post);
        }

        public async Task<Post> MarkPostAsSoldAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                post.Status = PostStatus.Sold;
                return await _postRepository.UpdatePostAsync(post);
            }
            throw new InvalidOperationException("Post not found");
        }

        public async Task<Post> MarkPostAsExpiredAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                post.Status = PostStatus.Expired;
                return await _postRepository.UpdatePostAsync(post);
            }
            throw new InvalidOperationException("Post not found");
        }

        public async Task<Post> MarkPostAsCancelledAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                post.Status = PostStatus.Cancelled;
                return await _postRepository.UpdatePostAsync(post);
            }
            throw new InvalidOperationException("Post not found");
        }

        public async Task<Post> MarkPostAsActiveAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                post.Status = PostStatus.Active;
                return await _postRepository.UpdatePostAsync(post);
            }
            throw new InvalidOperationException("Post not found");
        }

        public async Task<Post> ChangePostStatusAsync(int postId, PostStatus newStatus, int requestingUserId, string requestingUserRole)
        {
            var post = await _postRepository.GetPostByIdAsync(postId);
            if (post != null)
            {
                post.Status = newStatus;
                return await _postRepository.UpdatePostAsync(post);
            }
            throw new InvalidOperationException("Post not found");
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            return await _postRepository.DeletePostAsync(id);
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            return await _postRepository.GetPostsByUserAsync(userId);
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            return await _postRepository.GetPostsByTypeAsync(postType);
        }

        public async Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync()
        {
            return await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Expired);
        }

        public async Task<bool> PostExistsAsync(int id)
        {
            return await _postRepository.PostExistsAsync(id);
        }

        public Task<bool> CanUserChangePostStatusAsync(int postId, int userId, string userRole)
        {
            // Basic implementation for testing
            return Task.FromResult(true);
        }

        public Task<List<PostStatus>> GetAvailableStatusTransitionsAsync(int postId, int userId, string userRole)
        {
            // Basic implementation for testing
            return Task.FromResult(new List<PostStatus> { PostStatus.Active, PostStatus.Sold, PostStatus.Expired, PostStatus.Cancelled });
        }

        public Dictionary<PostType, List<PostStatus>> GetStatusChangePermissions(string userRole)
        {
            // Basic implementation for testing
            return new Dictionary<PostType, List<PostStatus>>();
        }
    }
}
