namespace PetWhenua.Services
{
    public interface IPostService
    {
        Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null);
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> CreatePostAsync(Post post);
        Task<Post> CreatePostAsync(int userId, PostType postType, string title, string description, string content);
        Task<Post> CreatePostWithDetailsAsync(int userId, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null);
        Task<Post> UpdatePostAsync(Post post);
        Task<Post> MarkPostAsSoldAsync(int id);
        Task<Post> MarkPostAsExpiredAsync(int id);
        Task<Post> MarkPostAsCancelledAsync(int id);
        Task<Post> MarkPostAsActiveAsync(int id);
        Task<bool> DeletePostAsync(int id);
        Task<IEnumerable<Post>> GetPostsByUserAsync(int userId);
        Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType);
        Task<bool> PostExistsAsync(int id);
    }
}
