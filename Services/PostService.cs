using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IPostFactory _postFactory;
        private readonly IPostAuthorizationService _authorizationService;

        public PostService(IPostRepository postRepository, IPostFactory postFactory, IPostAuthorizationService authorizationService)
        {
            _postRepository = postRepository;
            _postFactory = postFactory;
            _authorizationService = authorizationService;
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
            // Validate user exists
            if (!await _postRepository.UserExistsAsync(post.UserId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Validate post using factory
            _postFactory.ValidatePostForCreation(post);

            // Set timestamps
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;

            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostAsync(int userId, PostType postType, string title, string description, string content)
        {
            // Validate user exists
            if (!await _postRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Create post using factory
            var post = _postFactory.CreatePost(userId, postType, title, description, content);

            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            // Validate user exists
            if (!await _postRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Create post using factory
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, description, content, images, location, price, eventDate, category);

            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> UpdatePostAsync(Post post)
        {
            var existingPost = await _postRepository.GetPostByIdAsync(post.PostId);
            if (existingPost == null)
            {
                throw new InvalidOperationException($"Post with ID {post.PostId} not found.");
            }

            // Use factory to create updated post
            var updatedPost = _postFactory.CreatePostFromExisting(existingPost, post);

            return await _postRepository.UpdatePostAsync(updatedPost);
        }

        public async Task<Post> MarkPostAsSoldAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {id} not found.");
            }

            // Use factory to mark as sold
            var soldPost = _postFactory.CreateSoldPost(post);

            return await _postRepository.UpdatePostAsync(soldPost);
        }

        public async Task<Post> MarkPostAsExpiredAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {id} not found.");
            }

            // Use factory to mark as expired
            var expiredPost = _postFactory.CreateExpiredPost(post);

            return await _postRepository.UpdatePostAsync(expiredPost);
        }

        public async Task<Post> MarkPostAsCancelledAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {id} not found.");
            }

            // Use factory to mark as cancelled
            var cancelledPost = _postFactory.CreateCancelledPost(post);

            return await _postRepository.UpdatePostAsync(cancelledPost);
        }

        public async Task<Post> MarkPostAsActiveAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {id} not found.");
            }

            // Use factory to mark as active
            var activePost = _postFactory.CreateActivePost(post);

            return await _postRepository.UpdatePostAsync(activePost);
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            return await _postRepository.DeletePostAsync(id);
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            if (!await _postRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException($"User with ID {userId} not found.");
            }

            return await _postRepository.GetPostsByUserAsync(userId);
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            return await _postRepository.GetPostsByTypeAsync(postType);
        }

        public async Task<bool> PostExistsAsync(int id)
        {
            return await _postRepository.PostExistsAsync(id);
        }

        public async Task<Post> CreatePostWithUserRoleAsync(int userId, string userRole, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            // Validate user exists
            if (!await _postRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Check if user can create this type of post
            if (!_authorizationService.CanCreatePost(userRole, postType))
            {
                throw new InvalidOperationException($"User with role '{userRole}' cannot create posts of type '{postType}'.");
            }

            // Get the appropriate initial status based on user role and post type
            var initialStatus = _authorizationService.GetInitialPostStatus(userRole, postType);

            // Create post using factory
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, description, content, images, location, price, eventDate, category);
            
            // Override the status with role-based logic
            post.Status = initialStatus;

            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> ChangePostStatusAsync(int postId, PostStatus newStatus, int requestingUserId, string requestingUserRole)
        {
            var post = await _postRepository.GetPostByIdAsync(postId);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {postId} not found.");
            }

            // Check if the user can change this post's status
            var isOwner = post.UserId == requestingUserId;
            if (!_authorizationService.CanChangePostStatus(requestingUserRole, post.PostType, isOwner))
            {
                throw new InvalidOperationException($"User with role '{requestingUserRole}' cannot change status of {post.PostType} posts.");
            }

            // Validate the status change is allowed
            if (!_authorizationService.IsValidStatusChange(post.PostType, post.Status, newStatus))
            {
                throw new InvalidOperationException($"Cannot change post status from {post.Status} to {newStatus} for {post.PostType} posts.");
            }

            // Update the post status
            post.Status = newStatus;
            post.UpdatedAt = DateTime.UtcNow;

            return await _postRepository.UpdatePostAsync(post);
        }

        public async Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync()
        {
            return await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Inactive);
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
    }
}
