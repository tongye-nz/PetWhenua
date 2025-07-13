using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services.Abstract
{
    /// <summary>
    /// Base service for common post operations
    /// </summary>
    public abstract class BasePostService
    {
        protected readonly IPostRepository _postRepository;
        protected readonly IPostFactory _postFactory;

        protected BasePostService(IPostRepository postRepository, IPostFactory postFactory)
        {
            _postRepository = postRepository;
            _postFactory = postFactory;
        }

        /// <summary>
        /// Validates that a user exists
        /// </summary>
        protected async Task ValidateUserExistsAsync(int userId)
        {
            if (!await _postRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }
        }

        /// <summary>
        /// Validates that a post exists and returns it
        /// </summary>
        protected async Task<Post> ValidatePostExistsAsync(int postId)
        {
            var post = await _postRepository.GetPostByIdAsync(postId);
            if (post == null)
            {
                throw new InvalidOperationException($"Post with ID {postId} not found.");
            }
            return post;
        }

        /// <summary>
        /// Sets common post timestamps
        /// </summary>
        protected void SetPostTimestamps(Post post, bool isCreating = false)
        {
            if (isCreating)
            {
                post.CreatedAt = DateTime.UtcNow;
            }
            post.UpdatedAt = DateTime.UtcNow;
        }
    }
}
