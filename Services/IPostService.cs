namespace PetWhenua.Services
{
    public interface IPostService
    {
        Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null, string? region = null, string? district = null);
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> CreatePostAsync(Post post);
        Task<Post> CreatePostAsync(int userId, PostType postType, string title, string content);
        Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null);
        Task<Post> CreatePostWithUserRoleAsync(int userId, string userRole, PostType postType, string title, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null);
        Task<Post> UpdatePostAsync(Post post);
        Task<Post> MarkPostAsSoldAsync(int id);
        Task<Post> MarkPostAsExpiredAsync(int id);
        Task<Post> MarkPostAsCancelledAsync(int id);
        Task<Post> MarkPostAsActiveAsync(int id);
        Task<Post> ChangePostStatusAsync(int postId, PostStatus newStatus, int requestingUserId, string requestingUserRole);
        Task<bool> DeletePostAsync(int id);
        Task<IEnumerable<Post>> GetPostsByUserAsync(int userId);
        Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType);
        Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync();
        Task<IEnumerable<Post>> GetPendingMeetupPostsAsync();
        Task<bool> PostExistsAsync(int id);
        Task<bool> CanUserChangePostStatusAsync(int postId, int userId, string userRole);
        Task<List<PostStatus>> GetAvailableStatusTransitionsAsync(int postId, int userId, string userRole);
        Dictionary<PostType, List<PostStatus>> GetStatusChangePermissions(string userRole);
    }
}
