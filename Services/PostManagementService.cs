using PetWhenua.Services.Abstract;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services
{
    /// <summary>
    /// Service for handling post update and delete operations
    /// </summary>
    public class PostManagementService : BasePostService
    {
        public PostManagementService(IPostRepository postRepository, IPostFactory postFactory) 
            : base(postRepository, postFactory)
        {
        }

        /// <summary>
        /// Updates an existing post
        /// </summary>
        public async Task<Post> UpdatePostAsync(Post post)
        {
            var existingPost = await ValidatePostExistsAsync(post.PostId);
            var updatedPost = _postFactory.CreatePostFromExisting(existingPost, post);
            return await _postRepository.UpdatePostAsync(updatedPost);
        }

        /// <summary>
        /// Deletes a post
        /// </summary>
        public async Task<bool> DeletePostAsync(int id)
        {
            return await _postRepository.DeletePostAsync(id);
        }
    }
}
