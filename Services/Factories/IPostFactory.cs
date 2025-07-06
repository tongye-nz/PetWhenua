namespace PetWhenua.Services.Factories
{
    public interface IPostFactory
    {
        Post CreatePost(int userId, PostType postType, string title, string description, string content);
        Post CreatePostWithDetails(int userId, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null);
        Post CreatePostFromExisting(Post existingPost, Post updatedPost);
        Post CreateExpiredPost(Post post);
        Post CreateSoldPost(Post post);
        Post CreateCancelledPost(Post post);
        Post CreateActivePost(Post post);
        bool ValidatePostForCreation(Post post);
        bool ValidatePostForUpdate(Post existingPost, Post updatedPost);
    }
}
