using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;
using System.Linq;

namespace PetWhenua.Services
{
    /// <summary>
    /// Basic post service for API testing
    /// </summary>
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IPostFactory _postFactory;
        private readonly IPostAuthorizationService _authorizationService;

        public PostService(
            IPostRepository postRepository,
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService)
        {
            _postRepository = postRepository;
            _postFactory = postFactory;
            _authorizationService = authorizationService;
        }

        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null, string? region = null, string? district = null)
        {
            return await _postRepository.GetAllPostsAsync(postType, userId, region, district);
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
            // Check if user can create this post type
            if (!_authorizationService.CanCreatePost(userRole, postType))
            {
                var errorMessage = _authorizationService.GetPostCreationErrorMessage(userRole, postType);
                throw new InvalidOperationException(errorMessage);
            }

            // Get the appropriate initial status based on user role and post type
            var initialStatus = _authorizationService.GetInitialPostStatus(userRole, postType);

            // Create the post with proper status
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            post.Status = initialStatus; // Override the default Active status with role-based status
            post.UpdatedAt = DateTime.UtcNow;

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
            if (post == null)
            {
                throw new InvalidOperationException("Post not found");
            }

            var isOwner = post.UserId == requestingUserId;
            
            // Check if user can change status for this post type
            if (!_authorizationService.CanChangePostStatus(requestingUserRole, post.PostType, isOwner))
            {
                var errorMessage = _authorizationService.GetStatusChangeErrorMessage(requestingUserRole, post.PostType, isOwner);
                throw new UnauthorizedAccessException(errorMessage);
            }

            // Check if the status transition is valid for this post type
            if (!_authorizationService.IsValidStatusChange(post.PostType, post.Status, newStatus))
            {
                var allowedStatuses = _authorizationService.GetAllowedStatusTransitions(post.PostType);
                var allowedStatusNames = string.Join(", ", allowedStatuses);
                throw new InvalidOperationException($"Cannot change {post.PostType} post status from {post.Status} to {newStatus}. Allowed statuses for {post.PostType} posts are: {allowedStatusNames}");
            }

            post.Status = newStatus;
            post.UpdatedAt = DateTime.UtcNow;
            return await _postRepository.UpdatePostAsync(post);
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
            return await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Inactive);
        }

        public async Task<bool> PostExistsAsync(int id)
        {
            return await _postRepository.PostExistsAsync(id);
        }

        public async Task<bool> CanUserChangePostStatusAsync(int postId, int userId, string userRole)
        {
            var post = await _postRepository.GetPostByIdAsync(postId);
            if (post == null)
            {
                return false;
            }

            var isOwner = post.UserId == userId;
            return _authorizationService.CanChangePostStatus(userRole, post.PostType, isOwner);
        }

        public async Task<List<PostStatus>> GetAvailableStatusTransitionsAsync(int postId, int userId, string userRole)
        {
            var post = await _postRepository.GetPostByIdAsync(postId);
            if (post == null)
            {
                return new List<PostStatus>();
            }

            var isOwner = post.UserId == userId;
            if (!_authorizationService.CanChangePostStatus(userRole, post.PostType, isOwner))
            {
                return new List<PostStatus>();
            }

            var allowedTransitions = _authorizationService.GetAllowedStatusTransitions(post.PostType);
            return allowedTransitions.Where(status => status != post.Status).ToList();
        }

        public Dictionary<PostType, List<PostStatus>> GetStatusChangePermissions(string userRole)
        {
            var permissions = new Dictionary<PostType, List<PostStatus>>();
            
            foreach (PostType postType in Enum.GetValues<PostType>())
            {
                if (_authorizationService.CanCreatePost(userRole, postType))
                {
                    permissions[postType] = _authorizationService.GetAllowedStatusTransitions(postType);
                }
                else
                {
                    permissions[postType] = new List<PostStatus>();
                }
            }
            
            return permissions;
        }


    }
}
