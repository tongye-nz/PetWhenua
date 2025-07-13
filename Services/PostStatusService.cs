using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services
{
    /// <summary>
    /// Service for handling post status management operations
    /// </summary>
    public class PostStatusService : BasePostService
    {
        private readonly IPostAuthorizationService _authorizationService;

        public PostStatusService(
            IPostRepository postRepository, 
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService) 
            : base(postRepository, postFactory)
        {
            _authorizationService = authorizationService;
        }

        /// <summary>
        /// Changes post status with authorization checks
        /// </summary>
        public async Task<Post> ChangePostStatusAsync(int postId, PostStatus newStatus, int requestingUserId, string requestingUserRole)
        {
            var post = await ValidatePostExistsAsync(postId);

            var isOwner = post.UserId == requestingUserId;
            if (!_authorizationService.CanChangePostStatus(requestingUserRole, post.PostType, isOwner))
            {
                throw new InvalidOperationException($"User with role '{requestingUserRole}' cannot change status of {post.PostType} posts.");
            }

            if (!_authorizationService.IsValidStatusChange(post.PostType, post.Status, newStatus))
            {
                throw new InvalidOperationException($"Cannot change post status from {post.Status} to {newStatus} for {post.PostType} posts.");
            }

            post.Status = newStatus;
            SetPostTimestamps(post);
            return await _postRepository.UpdatePostAsync(post);
        }

        /// <summary>
        /// Marks a post as sold
        /// </summary>
        public async Task<Post> MarkPostAsSoldAsync(int id)
        {
            var post = await ValidatePostExistsAsync(id);
            var soldPost = _postFactory.CreateSoldPost(post);
            return await _postRepository.UpdatePostAsync(soldPost);
        }

        /// <summary>
        /// Marks a post as expired
        /// </summary>
        public async Task<Post> MarkPostAsExpiredAsync(int id)
        {
            var post = await ValidatePostExistsAsync(id);
            var expiredPost = _postFactory.CreateExpiredPost(post);
            return await _postRepository.UpdatePostAsync(expiredPost);
        }

        /// <summary>
        /// Marks a post as cancelled
        /// </summary>
        public async Task<Post> MarkPostAsCancelledAsync(int id)
        {
            var post = await ValidatePostExistsAsync(id);
            var cancelledPost = _postFactory.CreateCancelledPost(post);
            return await _postRepository.UpdatePostAsync(cancelledPost);
        }

        /// <summary>
        /// Marks a post as active
        /// </summary>
        public async Task<Post> MarkPostAsActiveAsync(int id)
        {
            var post = await ValidatePostExistsAsync(id);
            var activePost = _postFactory.CreateActivePost(post);
            return await _postRepository.UpdatePostAsync(activePost);
        }

        /// <summary>
        /// Checks if a user can change post status
        /// </summary>
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
