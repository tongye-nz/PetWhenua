using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public interface IPostAuthorizationService
    {
        /// <summary>
        /// Determines the initial status for a new post based on user role and post type
        /// </summary>
        /// <param name="userRole">The role of the user creating the post</param>
        /// <param name="postType">The type of post being created</param>
        /// <returns>The appropriate initial status for the post</returns>
        PostStatus GetInitialPostStatus(string userRole, PostType postType);

        /// <summary>
        /// Checks if a user can activate/deactivate a post
        /// </summary>
        /// <param name="userRole">The role of the user trying to change status</param>
        /// <param name="postType">The type of post</param>
        /// <param name="isOwner">Whether the user is the owner of the post</param>
        /// <returns>True if the user can change the post status</returns>
        bool CanChangePostStatus(string userRole, PostType postType, bool isOwner = false);

        /// <summary>
        /// Checks if a user can create posts of a specific type
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="postType">The type of post</param>
        /// <returns>True if the user can create posts of this type</returns>
        bool CanCreatePost(string userRole, PostType postType);

        /// <summary>
        /// Checks if a user can edit a specific post
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="postOwnerId">The ID of the post owner</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>True if the user can edit the post</returns>
        bool CanEditPost(string userRole, int postOwnerId, int userId);

        /// <summary>
        /// Checks if a user can edit a specific post (overload that considers post status)
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="post">The post to check</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>True if the user can edit the post</returns>
        bool CanEditPost(string userRole, Post post, int userId);

        /// <summary>
        /// Validates if a status change is allowed for a specific post type
        /// </summary>
        /// <param name="postType">The type of post</param>
        /// <param name="currentStatus">Current status of the post</param>
        /// <param name="newStatus">Desired new status</param>
        /// <returns>True if the status change is valid</returns>
        bool IsValidStatusChange(PostType postType, PostStatus currentStatus, PostStatus newStatus);

        /// <summary>
        /// Gets detailed information about post creation restrictions by role
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <returns>Dictionary of post types and whether the user can create them</returns>
        Dictionary<PostType, bool> GetPostCreationPermissions(string userRole);

        /// <summary>
        /// Gets a user-friendly error message for unauthorized post creation attempts
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <param name="postType">The post type they tried to create</param>
        /// <returns>Descriptive error message</returns>
        string GetPostCreationErrorMessage(string userRole, PostType postType);

        /// <summary>
        /// Gets the allowed status transitions for a specific post type
        /// </summary>
        /// <param name="postType">The type of post</param>
        /// <returns>List of allowed status values</returns>
        List<PostStatus> GetAllowedStatusTransitions(PostType postType);

        /// <summary>
        /// Gets error message for unauthorized status change attempts
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <param name="postType">The post type</param>
        /// <param name="isOwner">Whether the user owns the post</param>
        /// <returns>Descriptive error message</returns>
        string GetStatusChangeErrorMessage(string userRole, PostType postType, bool isOwner);

        /// <summary>
        /// Checks if a user can delete a specific post
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="post">The post to check</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>True if the user can delete the post</returns>
        bool CanDeletePost(string userRole, Post post, int userId);

        /// <summary>
        /// Gets detailed edit permissions for a post including reasons why editing might be disabled
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="post">The post to check</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>Detailed edit permission information</returns>
        PostEditPermissions GetEditPermissions(string userRole, Post post, int userId);

        /// <summary>
        /// Gets detailed delete permissions for a post including reasons why deletion might be disabled
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="post">The post to check</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>Detailed delete permission information</returns>
        PostDeletePermissions GetDeletePermissions(string userRole, Post post, int userId);
    }
}
