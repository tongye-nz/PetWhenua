using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    /// <summary>
    /// Service for handling automatic expiration of time-based posts
    /// </summary>
    public class PostExpiryService
    {
        private readonly IPostRepository _postRepository;
        private readonly ILogger<PostExpiryService> _logger;

        public PostExpiryService(IPostRepository postRepository, ILogger<PostExpiryService> logger)
        {
            _postRepository = postRepository;
            _logger = logger;
        }

        /// <summary>
        /// Checks and expires posts that have passed their event date
        /// </summary>
        /// <param name="currentDate">The current date to check against (defaults to UtcNow)</param>
        /// <returns>Number of posts that were expired</returns>
        public async Task<int> ExpirePostsByEventDateAsync(DateTime? currentDate = null)
        {
            var checkDate = currentDate ?? DateTime.UtcNow;
            
            _logger.LogInformation("Starting auto-expiry check for posts with event dates before {CheckDate}", checkDate);

            // Get all active Meetup and PetWedding posts with event dates in the past
            var expirablePosts = await _postRepository.GetExpirablePostsAsync(checkDate);

            if (!expirablePosts.Any())
            {
                _logger.LogInformation("No posts found that need to be expired");
                return 0;
            }

            var expiredCount = 0;

            foreach (var post in expirablePosts)
            {
                try
                {
                    post.Status = PostStatus.Expired;
                    post.UpdatedAt = DateTime.UtcNow;

                    await _postRepository.UpdatePostAsync(post);
                    expiredCount++;

                    _logger.LogInformation(
                        "Expired {PostType} post {PostId} '{Title}' with event date {EventDate}",
                        post.PostType, post.PostId, post.Title, post.EventDate);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to expire post {PostId} '{Title}'",
                        post.PostId, post.Title);
                }
            }

            _logger.LogInformation("Auto-expiry check completed. {ExpiredCount} posts expired", expiredCount);
            return expiredCount;
        }

        /// <summary>
        /// Checks if a specific post should be expired based on its event date
        /// </summary>
        /// <param name="post">The post to check</param>
        /// <param name="currentDate">The current date to check against (defaults to UtcNow)</param>
        /// <returns>True if the post should be expired</returns>
        public bool ShouldPostBeExpired(Post post, DateTime? currentDate = null)
        {
            var checkDate = currentDate ?? DateTime.UtcNow;

            // Only check time-based post types that can be expired
            if (!IsTimeBasedPost(post.PostType))
            {
                return false;
            }

            // Post must have an event date
            if (!post.EventDate.HasValue)
            {
                return false;
            }

            // Post must currently be active to be expired
            if (post.Status != PostStatus.Active)
            {
                return false;
            }

            // Check if event date has passed (compare dates only, ignore time)
            return post.EventDate.Value.Date < checkDate.Date;
        }

        /// <summary>
        /// Dynamically expires a single post if it should be expired
        /// </summary>
        /// <param name="post">The post to check and potentially expire</param>
        /// <param name="currentDate">The current date to check against (defaults to UtcNow)</param>
        /// <returns>True if the post was expired, false otherwise</returns>
        public async Task<bool> ExpirePostIfNeededAsync(Post post, DateTime? currentDate = null)
        {
            if (!ShouldPostBeExpired(post, currentDate))
            {
                return false;
            }

            try
            {
                post.Status = PostStatus.Expired;
                post.UpdatedAt = DateTime.UtcNow;
                await _postRepository.UpdatePostAsync(post);

                _logger.LogInformation(
                    "Dynamically expired {PostType} post {PostId} '{Title}' with event date {EventDate}",
                    post.PostType, post.PostId, post.Title, post.EventDate);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to dynamically expire post {PostId} '{Title}'",
                    post.PostId, post.Title);
                return false;
            }
        }

        /// <summary>
        /// Gets statistics about expirable posts
        /// </summary>
        /// <param name="currentDate">The current date to check against (defaults to UtcNow)</param>
        /// <returns>Expiry statistics</returns>
        public async Task<PostExpiryStats> GetExpiryStatsAsync(DateTime? currentDate = null)
        {
            var checkDate = currentDate ?? DateTime.UtcNow;
            
            var expirablePosts = await _postRepository.GetExpirablePostsAsync(checkDate);
            var activeTimeBasedPosts = await _postRepository.GetActiveTimeBasedPostsAsync();

            return new PostExpiryStats
            {
                TotalExpirablePosts = expirablePosts.Count(),
                ExpirableByType = expirablePosts.GroupBy(p => p.PostType)
                    .ToDictionary(g => g.Key, g => g.Count()),
                TotalActiveTimeBasedPosts = activeTimeBasedPosts.Count(),
                CheckDate = checkDate
            };
        }

        /// <summary>
        /// Determines if a post type is time-based and can be expired
        /// </summary>
        /// <param name="postType">The post type to check</param>
        /// <returns>True if the post type can be expired based on event date</returns>
        private static bool IsTimeBasedPost(PostType postType)
        {
            return postType == PostType.Meetup || postType == PostType.PetWedding;
        }
    }

    /// <summary>
    /// Statistics about post expiry operations
    /// </summary>
    public class PostExpiryStats
    {
        public int TotalExpirablePosts { get; set; }
        public Dictionary<PostType, int> ExpirableByType { get; set; } = new();
        public int TotalActiveTimeBasedPosts { get; set; }
        public DateTime CheckDate { get; set; }
    }
}
