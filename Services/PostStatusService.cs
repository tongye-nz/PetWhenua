using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;
using System.Linq;

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

        /// <summary>
        /// Gets available status transitions for a post
        /// </summary>
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

        /// <summary>
        /// Gets status change permissions and restrictions for a user
        /// </summary>
        public Dictionary<PostType, List<PostStatus>> GetStatusChangePermissions(string userRole)
        {
            var permissions = new Dictionary<PostType, List<PostStatus>>();
            
            foreach (PostType postType in Enum.GetValues<PostType>())
            {
                permissions[postType] = _authorizationService.GetAllowedStatusTransitions(postType);
            }
            
            return permissions;
        }
    }
}
