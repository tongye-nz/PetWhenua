namespace PetWhenua.Services.Factories
{
    public class PostFactory : IPostFactory
    {
        public Post CreatePost(int userId, PostType postType, string title, string description, string content)
        {
            var post = new Post
            {
                UserId = userId,
                PostType = postType,
                Title = title,
                Description = description,
                Content = content,
                Status = PostStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Images = new List<string>()
            };

            ValidatePostForCreation(post);
            return post;
        }

        public Post CreatePostWithDetails(int userId, PostType postType, string title, string description, string content, List<string>? images = null, string? location = null, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            var post = new Post
            {
                UserId = userId,
                PostType = postType,
                Title = title,
                Description = description,
                Content = content,
                Images = images ?? new List<string>(),
                Location = location,
                Price = price,
                EventDate = eventDate,
                Category = category,
                Status = PostStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            ValidatePostForCreation(post);
            return post;
        }

        public Post CreatePostFromExisting(Post existingPost, Post updatedPost)
        {
            if (!ValidatePostForUpdate(existingPost, updatedPost))
            {
                throw new InvalidOperationException("Invalid post update data.");
            }

            // Update properties while preserving certain fields
            existingPost.PostType = updatedPost.PostType;
            existingPost.Title = updatedPost.Title;
            existingPost.Description = updatedPost.Description;
            existingPost.Content = updatedPost.Content;
            existingPost.Images = updatedPost.Images;
            existingPost.Location = updatedPost.Location;
            existingPost.Price = updatedPost.Price;
            existingPost.EventDate = updatedPost.EventDate;
            existingPost.Category = updatedPost.Category;
            existingPost.Status = updatedPost.Status;
            existingPost.UpdatedAt = DateTime.UtcNow;

            // Don't update: PostId, UserId, CreatedAt, User navigation property

            return existingPost;
        }

        public Post CreateExpiredPost(Post post)
        {
            if (post == null)
                throw new ArgumentNullException(nameof(post));

            post.Status = PostStatus.Expired;
            post.UpdatedAt = DateTime.UtcNow;
            return post;
        }

        public Post CreateSoldPost(Post post)
        {
            if (post == null)
                throw new ArgumentNullException(nameof(post));

            post.Status = PostStatus.Sold;
            post.UpdatedAt = DateTime.UtcNow;
            return post;
        }

        public Post CreateCancelledPost(Post post)
        {
            if (post == null)
                throw new ArgumentNullException(nameof(post));

            post.Status = PostStatus.Cancelled;
            post.UpdatedAt = DateTime.UtcNow;
            return post;
        }

        public Post CreateActivePost(Post post)
        {
            if (post == null)
                throw new ArgumentNullException(nameof(post));

            post.Status = PostStatus.Active;
            post.UpdatedAt = DateTime.UtcNow;
            return post;
        }

        public bool ValidatePostForCreation(Post post)
        {
            if (post == null)
                throw new ArgumentNullException(nameof(post));

            if (string.IsNullOrWhiteSpace(post.Title))
                throw new ArgumentException("Post title cannot be empty.", nameof(post.Title));

            if (post.Title.Length > 200)
                throw new ArgumentException("Post title cannot exceed 200 characters.", nameof(post.Title));

            if (string.IsNullOrWhiteSpace(post.Description))
                throw new ArgumentException("Post description cannot be empty.", nameof(post.Description));

            if (post.Description.Length > 500)
                throw new ArgumentException("Post description cannot exceed 500 characters.", nameof(post.Description));

            if (string.IsNullOrWhiteSpace(post.Content))
                throw new ArgumentException("Post content cannot be empty.", nameof(post.Content));

            if (post.UserId <= 0)
                throw new ArgumentException("Invalid UserId.", nameof(post.UserId));

            if (!Enum.IsDefined(typeof(PostType), post.PostType))
                throw new ArgumentException("Invalid post type.", nameof(post.PostType));

            if (!Enum.IsDefined(typeof(PostStatus), post.Status))
                throw new ArgumentException("Invalid post status.", nameof(post.Status));

            if (!string.IsNullOrEmpty(post.Location) && post.Location.Length > 200)
                throw new ArgumentException("Location cannot exceed 200 characters.", nameof(post.Location));

            if (!string.IsNullOrEmpty(post.Category) && post.Category.Length > 100)
                throw new ArgumentException("Category cannot exceed 100 characters.", nameof(post.Category));

            if (post.Price.HasValue && post.Price.Value < 0)
                throw new ArgumentException("Price cannot be negative.", nameof(post.Price));

            if (post.EventDate.HasValue && post.EventDate.Value < DateTime.Now.Date)
                throw new ArgumentException("Event date cannot be in the past.", nameof(post.EventDate));

            // Validate post type specific rules
            ValidatePostTypeSpecificRules(post);

            return true;
        }

        public bool ValidatePostForUpdate(Post existingPost, Post updatedPost)
        {
            if (existingPost == null)
                throw new ArgumentNullException(nameof(existingPost));

            if (updatedPost == null)
                throw new ArgumentNullException(nameof(updatedPost));

            // Ensure PostId matches
            if (existingPost.PostId != updatedPost.PostId)
                throw new ArgumentException("Post IDs do not match.", nameof(updatedPost.PostId));

            // UserId should not change in updates
            if (existingPost.UserId != updatedPost.UserId)
                throw new ArgumentException("Cannot change post owner.", nameof(updatedPost.UserId));

            // Validate updated post data
            return ValidatePostForCreation(updatedPost);
        }

        private void ValidatePostTypeSpecificRules(Post post)
        {
            switch (post.PostType)
            {
                case PostType.BuySell:
                    if (!post.Price.HasValue)
                        throw new ArgumentException("BuySell posts must have a price.", nameof(post.Price));
                    break;

                case PostType.Meetup:
                case PostType.PetWedding:
                    if (!post.EventDate.HasValue)
                        throw new ArgumentException($"{post.PostType} posts must have an event date.", nameof(post.EventDate));
                    if (string.IsNullOrEmpty(post.Location))
                        throw new ArgumentException($"{post.PostType} posts must have a location.", nameof(post.Location));
                    break;

                case PostType.Library:
                    if (string.IsNullOrEmpty(post.Category))
                        throw new ArgumentException("Library posts must have a category.", nameof(post.Category));
                    break;

                case PostType.Moment:
                    // No additional validation required for moment posts
                    // They just need the basic fields: title, description, content
                    break;

                case PostType.Announcement:
                    // No additional validation required for announcements
                    break;
            }
        }
    }
}
