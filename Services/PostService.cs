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
        private readonly PostExpiryService _expiryService;
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;

        public PostService(
            IPostRepository postRepository,
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService,
            PostExpiryService expiryService,
            INotificationService notificationService,
            IUserService userService)
        {
            _postRepository = postRepository;
            _postFactory = postFactory;
            _authorizationService = authorizationService;
            _expiryService = expiryService;
            _notificationService = notificationService;
            _userService = userService;
        }

        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null, string? region = null, string? district = null)
        {
            var posts = await _postRepository.GetAllPostsAsync(postType, userId, region, district);
            return await ApplyDynamicExpiryAsync(posts);
        }

        public async Task<(IEnumerable<Post> posts, int totalCount)> GetPostsPagedAsync(PostType? postType = null, int? userId = null, string? region = null, string? district = null, int page = 1, int pageSize = 10)
        {
            var (posts, totalCount) = await _postRepository.GetAllPostsPagedAsync(postType, userId, region, district, page, pageSize);
            var processedPosts = await ApplyDynamicExpiryAsync(posts);
            return (processedPosts, totalCount);
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                await _expiryService.ExpirePostIfNeededAsync(post);
                // Reload the post to get the updated status
                post = await _postRepository.GetPostByIdAsync(id);
            }
            return post;
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

        public async Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string content, List<string>? images = null, string? location = null, string? address = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category, address);
            return await _postRepository.AddPostAsync(post);
        }

        public async Task<Post> CreatePostWithUserRoleAsync(int userId, string userRole, PostType postType, string title, string content, List<string>? images = null, string? location = null, string? address = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
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
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category, address);
            post.Status = initialStatus; // Override the default Active status with role-based status
            post.UpdatedAt = DateTime.UtcNow;

            var createdPost = await _postRepository.AddPostAsync(post);

            // Send notification to meetup admins if this is a pending meetup
            if (postType == PostType.Meetup && initialStatus == PostStatus.Pending)
            {
                try
                {
                    var creator = await _userService.GetUserByIdAsync(userId);
                    var creatorName = creator?.FirstName ?? creator?.Username ?? "Someone";
                    
                    await _notificationService.CreateMeetupPendingNotificationAsync(
                        createdPost.PostId, 
                        title, 
                        creatorName
                    );
                }
                catch (Exception ex)
                {
                    // Log error but don't fail post creation if notification fails
                    Console.WriteLine($"Failed to send meetup pending notification: {ex.Message}");
                }
            }

            return createdPost;
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

            var oldStatus = post.Status;
            post.Status = newStatus;
            post.UpdatedAt = DateTime.UtcNow;
            
            var updatedPost = await _postRepository.UpdatePostAsync(post);

            // Send notification to meetup creator if this is a meetup status change
            if (post.PostType == PostType.Meetup && oldStatus != newStatus)
            {
                try
                {
                    // Only notify if the status change is from Pending to Active/Inactive
                    if (oldStatus == PostStatus.Pending)
                    {
                        if (newStatus == PostStatus.Active)
                        {
                            // Meetup approved
                            await _notificationService.CreateMeetupApprovedNotificationAsync(
                                post.UserId, 
                                post.PostId, 
                                post.Title
                            );
                        }
                        else if (newStatus == PostStatus.Inactive)
                        {
                            // Meetup rejected
                            await _notificationService.CreateMeetupRejectedNotificationAsync(
                                post.UserId, 
                                post.PostId, 
                                post.Title
                            );
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't fail status change if notification fails
                    Console.WriteLine($"Failed to send meetup status change notification: {ex.Message}");
                }
            }

            return updatedPost;
        }

        public async Task<bool> DeletePostAsync(int id)
        {
            return await _postRepository.DeletePostAsync(id);
        }

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            var posts = await _postRepository.GetPostsByUserAsync(userId);
            return await ApplyDynamicExpiryAsync(posts);
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            var posts = await _postRepository.GetPostsByTypeAsync(postType);
            return await ApplyDynamicExpiryAsync(posts);
        }

        public async Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync()
        {
            var posts = await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Inactive);
            return await ApplyDynamicExpiryAsync(posts);
        }

        public async Task<IEnumerable<Post>> GetPendingMeetupPostsAsync()
        {
            var posts = await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Pending);
            return await ApplyDynamicExpiryAsync(posts);
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

        /// <summary>
        /// Applies dynamic expiry checking to a collection of posts
        /// </summary>
        private async Task<IEnumerable<Post>> ApplyDynamicExpiryAsync(IEnumerable<Post> posts)
        {
            var postList = posts.ToList();
            var expiredAny = false;

            foreach (var post in postList)
            {
                var wasExpired = await _expiryService.ExpirePostIfNeededAsync(post);
                if (wasExpired)
                {
                    expiredAny = true;
                }
            }

            // If any posts were expired, reload the collection to get updated statuses
            if (expiredAny)
            {
                // Re-fetch with the same filters to get updated statuses
                var postIds = postList.Select(p => p.PostId).ToList();
                var updatedPosts = new List<Post>();
                
                foreach (var id in postIds)
                {
                    var updatedPost = await _postRepository.GetPostByIdAsync(id);
                    if (updatedPost != null)
                    {
                        updatedPosts.Add(updatedPost);
                    }
                }
                
                return updatedPosts.OrderByDescending(p => p.CreatedAt);
            }

            return postList;
        }
    }
}
