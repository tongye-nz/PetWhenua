namespace PetWhenua.Repositories.Abstract
{
    public interface IPostRepository
    {
        Task<IEnumerable<Post>> GetAllPostsAsync(PostType? postType = null, int? userId = null);
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post> AddPostAsync(Post post);
        Task<Post> UpdatePostAsync(Post post);
        Task<bool> DeletePostAsync(int id);
        Task<IEnumerable<Post>> GetPostsByUserAsync(int userId);
        Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType);
        Task<bool> PostExistsAsync(int id);
        Task<bool> UserExistsAsync(int userId);
    }
}
