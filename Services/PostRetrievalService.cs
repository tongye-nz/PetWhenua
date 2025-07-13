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
        private readonly PostExpiryService _expiryService;

        public PostRetrievalService(
            IPostRepository postRepository, 
            IPostFactory postFactory,
            PostExpiryService expiryService) 
            : base(postRepository, postFactory)
        {
            _expiryService = expiryService;
        }

        /// <summary>
        /// Gets posts with optional filtering and dynamic expiry checking
        /// </summary>
        public async Task<IEnumerable<Post>> GetPostsAsync(PostType? postType = null, int? userId = null)
        {
            var posts = await _postRepository.GetAllPostsAsync(postType, userId);
            return await ApplyDynamicExpiryAsync(posts);
        }

        /// <summary>
        /// Gets a specific post by ID with dynamic expiry checking
        /// </summary>
        public async Task<Post?> GetPostByIdAsync(int id)
        {
            var post = await _postRepository.GetPostByIdAsync(id);
            if (post != null)
            {
                await _expiryService.ExpirePostIfNeededAsync(post);
                // Reload the post to get the updated status
                post = await _postRepository.GetPostByIdAsync(id);
            }
            return post;
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

        /// <summary>
        /// Applies dynamic expiry checking to a collection of posts
        /// </summary>
        private async Task<IEnumerable<Post>> ApplyDynamicExpiryAsync(IEnumerable<Post> posts)
        {
            var postList = posts.ToList();
            var expiredAny = false;

            foreach (var post in postList)
            {
                var wasExpired = await _expiryService.ExpirePostIfNeededAsync(post);
                if (wasExpired)
                {
                    expiredAny = true;
                }
            }

            // If any posts were expired, reload the collection to get updated statuses
            if (expiredAny)
            {
                // Re-fetch with the same filters to get updated statuses
                var postIds = postList.Select(p => p.PostId).ToList();
                var updatedPosts = new List<Post>();
                
                foreach (var id in postIds)
                {
                    var updatedPost = await _postRepository.GetPostByIdAsync(id);
                    if (updatedPost != null)
                    {
                        updatedPosts.Add(updatedPost);
                    }
                }
                
                return updatedPosts.OrderByDescending(p => p.CreatedAt);
            }

            return postList;
        }
    }
}
