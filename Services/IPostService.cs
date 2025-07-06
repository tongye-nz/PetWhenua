namespace PetWhenua.Services
{
    public interface IPostService
    {
        Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null);
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> CreatePostAsync(Post post);
        Task<Post> UpdatePostAsync(Post post);
        Task<bool> DeletePostAsync(int id);
        Task<IEnumerable<Post>> GetPostsByUserAsync(int userId);
        Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType);
        Task<bool> PostExistsAsync(int id);
    }
}
