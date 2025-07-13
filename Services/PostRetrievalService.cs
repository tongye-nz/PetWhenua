using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services
{
    /// <summary>
    /// Service for handling post retrieval operations
    /// </summary>
    public class PostRetrievalService : BasePostService
    {
        public PostRetrievalService(IPostRepository postRepository, IPostFactory postFactory) 
            : base(postRepository, postFactory)
        {
        }

        /// <summary>
        /// Gets posts with optional filtering
        /// </summary>
        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null)
        {
            return await _postRepository.GetAllPostsAsync(postType, userId);
        }

        /// <summary>
        /// Gets a specific post by ID
        /// </summary>
        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await _postRepository.GetPostByIdAsync(id);
        }

        /// <summary>
        /// Gets posts by user with validation
        /// </summary>
        public async Task<IEnumerable<Post>> GetPostsByUserAsync(int userId)
        {
            await ValidateUserExistsAsync(userId);
            return await _postRepository.GetPostsByUserAsync(userId);
        }

        /// <summary>
        /// Gets posts by type
        /// </summary>
        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(PostType postType)
        {
            return await _postRepository.GetPostsByTypeAsync(postType);
        }

        /// <summary>
        /// Gets inactive meetup posts for admin review
        /// </summary>
        public async Task<IEnumerable<Post>> GetInactiveMeetupPostsAsync()
        {
            return await _postRepository.GetPostsByTypeAndStatusAsync(PostType.Meetup, PostStatus.Inactive);
        }

        /// <summary>
        /// Checks if a post exists
        /// </summary>
        public async Task<bool> PostExistsAsync(int id)
        {
            return await _postRepository.PostExistsAsync(id);
        }
    }
}
