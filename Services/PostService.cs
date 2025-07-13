using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    /// <summary>
    /// Main post service that coordinates all post operations using specialized services
    /// </summary>
    public class PostService : IPostService
    {
        private readonly PostCreationService _creationService;
        private readonly PostRetrievalService _retrievalService;
        private readonly PostStatusService _statusService;
        private readonly PostManagementService _managementService;

        public PostService(
            IPostRepository postRepository,
            IPostFactory postFactory,
            IPostAuthorizationService authorizationService)
        {
            _creationService = new PostCreationService(postRepository, postFactory, authorizationService);
            _retrievalService = new PostRetrievalService(postRepository, postFactory);
            _statusService = new PostStatusService(postRepository, postFactory, authorizationService);
            _managementService = new PostManagementService(postRepository, postFactory);
        }

        // Delegation to specialized services
        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null)
            => await _retrievalService.GetPostsAsync(postType, userId);

        public async Task<Post?> GetPostByIdAsync(int id)
            => await _retrievalService.GetPostByIdAsync(id);

        public async Task<Post> CreatePostAsync(Post post)
            => await _creationService.CreatePostAsync(post);

        public async Task<Post> CreatePostAsync(int userId, PostType postType, string title, string description, string content)
            => await _creationService.CreatePostAsync(userId, postType, title, description, content);

        public async Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
            => await _creationService.CreatePostWithDetailsAsync(userId, postType, title, description, content, images, location, price, eventDate, category);

        public async Task<Post> CreatePostWithUserRoleAsync(int userId, string userRole, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
            => await _creationService.CreatePostWithUserRoleAsync(userId, userRole, postType, title, description, content, images, location, price, eventDate, category);

        public async Task<Post> UpdatePostAsync(Post post)
            => await _managementService.UpdatePostAsync(post);

        public async Task<Post> MarkPostAsSoldAsync(int id)
            => await _statusService.MarkPostAsSoldAsync(id);

        public async Task<Post> MarkPostAsExpiredAsync(int id)
            => await _statusService.MarkPostAsExpiredAsync(id);

        public async Task<Post> MarkPostAsCancelledAsync(int id)
            => await _statusService.MarkPostAsCancelledAsync(id);

        public async Task<Post> MarkPostAsActiveAsync(int id)
            => await _statusService.MarkPostAsActiveAsync(id);

        public async Task<Post> ChangePostStatusAsync(int postId, PostStatus newStatus, int requestingUserId, string requestingUserRole)
            => await _statusService.ChangePostStatusAsync(postId, newStatus, requestingUserId, requestingUserRole);

        public async Task<bool> DeletePostAsync(int id)
            => await _managementService.DeletePostAsync(id);

        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
            => await _retrievalService.GetPostsByUserAsync(userId);

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
            => await _retrievalService.GetPostsByTypeAsync(postType);

        public async Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync()
            => await _retrievalService.GetInactiveMeetupPostsAsync();

        public async Task<bool> PostExistsAsync(int id)
            => await _retrievalService.PostExistsAsync(id);

        public async Task<bool> CanUserChangePostStatusAsync(int postId, int userId, string userRole)
            => await _statusService.CanUserChangePostStatusAsync(postId, userId, userRole);

        public async Task<List<PostStatus>> GetAvailableStatusTransitionsAsync(int postId, int userId, string userRole)
            => await _statusService.GetAvailableStatusTransitionsAsync(postId, userId, userRole);

        public Dictionary<PostType, List<PostStatus>> GetStatusChangePermissions(string userRole)
            => _statusService.GetStatusChangePermissions(userRole);
    }
}
