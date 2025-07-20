using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services
{
    /// <summary>
    /// Service for handling post creation operations
    /// </summary>
    public class PostCreationService : BasePostService
    {
        private readonly IPostAuthorizationService _authorizationService;
        private readonly INotificationService _notificationService;
        private readonly IUserService _userService;

        public PostCreationService(
            IPostRepository postRepository, 
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService,
            INotificationService notificationService,
            IUserService userService) 
            : base(postRepository, postFactory)
        {
            _authorizationService = authorizationService;
            _notificationService = notificationService;
            _userService = userService;
        }

        /// <summary>
        /// Creates a basic post
        /// </summary>
        public async Task<Post> CreatePostAsync(Post post)
        {
            await ValidateUserExistsAsync(post.UserId);
            _postFactory.ValidatePostForCreation(post);
            SetPostTimestamps(post, isCreating: true);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with basic information
        /// </summary>
        public async Task<Post> CreatePostAsync(int userId, PostType postType, string title, string content)
        {
            await ValidateUserExistsAsync(userId);
            var post = _postFactory.CreatePost(userId, postType, title, content);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with detailed information
        /// </summary>
        public async Task<Post> CreatePostWithDetailsAsync(
            int userId, 
            PostType postType, 
            string title, 
            string content, 
            List<string>? images = null, 
            string? location = null, 
            decimal? price = null, 
            DateTime? eventDate = null, 
            string? category = null)
        {
            await ValidateUserExistsAsync(userId);
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with role-based status assignment
        /// </summary>
        public async Task<Post> CreatePostWithUserRoleAsync(
            int userId, 
            string userRole, 
            PostType postType, 
            string title, 
            string content, 
            List<string>? images = null, 
            string? location = null, 
            decimal? price = null, 
            DateTime? eventDate = null, 
            string? category = null)
        {
            await ValidateUserExistsAsync(userId);

            if (!_authorizationService.CanCreatePost(userRole, postType))
            {
                var errorMessage = _authorizationService.GetPostCreationErrorMessage(userRole, postType);
                throw new InvalidOperationException(errorMessage);
            }

            var initialStatus = _authorizationService.GetInitialPostStatus(userRole, postType);
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            post.Status = initialStatus;

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

        /// <summary>
        /// Creates a basic post with role validation
        /// </summary>
        public async Task<Post> CreatePostAsync(Post post, string userRole)
        {
            await ValidateUserExistsAsync(post.UserId);
            
            if (!_authorizationService.CanCreatePost(userRole, post.PostType))
            {
                var errorMessage = _authorizationService.GetPostCreationErrorMessage(userRole, post.PostType);
                throw new InvalidOperationException(errorMessage);
            }
            
            _postFactory.ValidatePostForCreation(post);
            SetPostTimestamps(post, isCreating: true);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with basic information and role validation
        /// </summary>
        public async Task<Post> CreatePostAsync(int userId, string userRole, PostType postType, string title, string content)
        {
            await ValidateUserExistsAsync(userId);
            
            if (!_authorizationService.CanCreatePost(userRole, postType))
            {
                var errorMessage = _authorizationService.GetPostCreationErrorMessage(userRole, postType);
                throw new InvalidOperationException(errorMessage);
            }
            
            var post = _postFactory.CreatePost(userId, postType, title, content);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with detailed information and role validation
        /// </summary>
        public async Task<Post> CreatePostWithDetailsAsync(
            int userId,
            string userRole,
            PostType postType, 
            string title, 
            string content, 
            List<string>? images = null, 
            string? location = null, 
            decimal? price = null, 
            DateTime? eventDate = null, 
            string? category = null)
        {
            await ValidateUserExistsAsync(userId);
            
            if (!_authorizationService.CanCreatePost(userRole, postType))
            {
                var errorMessage = _authorizationService.GetPostCreationErrorMessage(userRole, postType);
                throw new InvalidOperationException(errorMessage);
            }
            
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, content, images, location, price, eventDate, category);
            return await _postRepository.AddPostAsync(post);
        }
    }
}
