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

        public PostCreationService(
            IPostRepository postRepository, 
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService) 
            : base(postRepository, postFactory)
        {
            _authorizationService = authorizationService;
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
        public async Task<Post> CreatePostAsync(int userId, PostType postType, string title, string description, string content)
        {
            await ValidateUserExistsAsync(userId);
            var post = _postFactory.CreatePost(userId, postType, title, description, content);
            return await _postRepository.AddPostAsync(post);
        }

        /// <summary>
        /// Creates a post with detailed information
        /// </summary>
        public async Task<Post> CreatePostWithDetailsAsync(
            int userId, 
            PostType postType, 
            string title, 
            string description, 
            string content, 
            List<string>? images = null, 
            string? location = null, 
            decimal? price = null, 
            DateTime? eventDate = null, 
            string? category = null)
        {
            await ValidateUserExistsAsync(userId);
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, description, content, images, location, price, eventDate, category);
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
            string description, 
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
                throw new InvalidOperationException($"User with role '{userRole}' cannot create posts of type '{postType}'.");
            }

            var initialStatus = _authorizationService.GetInitialPostStatus(userRole, postType);
            var post = _postFactory.CreatePostWithDetails(userId, postType, title, description, content, images, location, price, eventDate, category);
            post.Status = initialStatus;

            return await _postRepository.AddPostAsync(post);
        }
    }
}
