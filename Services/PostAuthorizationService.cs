namespace PetWhenua.Services
{
    public class PostAuthorizationService : IPostAuthorizationService
    {
        public PostStatus GetInitialPostStatus(string userRole, PostType postType)
        {
            // For Meetup posts, apply special role-based logic
            if (postType == PostType.Meetup)
            {
                // Members create pending meetup posts that need admin approval
                if (userRole == UserRoles.Member)
                {
                    return PostStatus.Pending;
                }
                
                // Meetup Admins, Site Admins, and Vets can create active meetup posts immediately
                if (UserRoles.IsMeetupAdmin(userRole) || UserRoles.IsVet(userRole))
                {
                    return PostStatus.Active;
                }
            }

            // For all other post types, default to Active regardless of role
            return PostStatus.Active;
        }

        public bool CanChangePostStatus(string userRole, PostType postType, bool isOwner = false)
        {
            // Site admin can always change any post status
            if (UserRoles.IsAdmin(userRole))
            {
                return true;
            }

            // Apply specific rules based on post type
            switch (postType)
            {
                case PostType.BuySell:
                    // BuySell posts: creator or site admin can update status
                    return isOwner;

                case PostType.PetWedding:
                    // PetWedding posts: creator or site admin can update status
                    return isOwner;

                case PostType.Library:
                    // Library posts: only vet creator or site admin can update status
                    return isOwner && UserRoles.IsVet(userRole);

                case PostType.Announcement:
                    // Announcement posts: only site admin can update status
                    return false; // Only site admin (handled above)

                case PostType.Meetup:
                    // Meetup posts: only admins can change status
                    return UserRoles.IsMeetupAdmin(userRole);

                case PostType.Moment:
                    // Moment posts: no status updates needed per requirements
                    return false;

                default:
                    return false;
            }
        }

        public bool CanCreatePost(string userRole, PostType postType)
        {
            // Validate user role
            if (string.IsNullOrEmpty(userRole) || !UserRoles.IsValidRole(userRole))
            {
                return false;
            }

            // Apply role-based restrictions for specific post types
            switch (postType)
            {
                case PostType.Library:
                    // Only vets can create Library posts
                    return UserRoles.IsVet(userRole) || UserRoles.IsAdmin(userRole);

                case PostType.Announcement:
                    // Only site admins can create Announcement posts
                    return UserRoles.IsAdmin(userRole);

                case PostType.Moment:
                case PostType.BuySell:
                case PostType.PetWedding:
                case PostType.Meetup:
                    // All authenticated users can create these post types
                    return true;

                default:
                    // For any new post types, default to admin-only access for security
                    return UserRoles.IsAdmin(userRole);
            }
        }

        public bool CanEditPost(string userRole, int postOwnerId, int userId)
        {
            // Site admins can edit any post
            if (UserRoles.IsAdmin(userRole))
            {
                return true;
            }

            // Users can edit their own posts
            if (postOwnerId == userId)
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Checks if a user can edit a specific post (overload that considers post status)
        /// </summary>
        /// <param name="userRole">The role of the user</param>
        /// <param name="post">The post to check</param>
        /// <param name="userId">The ID of the current user</param>
        /// <returns>True if the user can edit the post</returns>
        public bool CanEditPost(string userRole, Post post, int userId)
        {
            // Site admins can edit any post regardless of status
            if (UserRoles.IsAdmin(userRole))
            {
                return true;
            }

            // Users can only edit their own posts
            if (post.UserId != userId)
            {
                return false;
            }

            // Users can edit their own posts only if status is Active, Inactive, or Pending
            // Cannot edit if status is Sold, Expired, or Cancelled
            return post.Status == PostStatus.Active || 
                   post.Status == PostStatus.Inactive || 
                   post.Status == PostStatus.Pending;
        }

        /// <summary>
        /// Gets the roles that can activate meetup posts
        /// </summary>
        /// <returns>List of roles that can activate meetup posts</returns>
        public static List<string> GetMeetupActivationRoles()
        {
            return new List<string>
            {
                UserRoles.SiteAdmin,
                UserRoles.MeetupAdmin
            };
        }

        /// <summary>
        /// Gets the roles that create active meetup posts immediately
        /// </summary>
        /// <returns>List of roles that create active meetup posts</returns>
        public static List<string> GetAutoActiveMeetupRoles()
        {
            return new List<string>
            {
                UserRoles.SiteAdmin,
                UserRoles.MeetupAdmin,
                UserRoles.Vet
            };
        }

        /// <summary>
        /// Validates if a status change is allowed for a specific post type
        /// </summary>
        /// <param name="postType">The type of post</param>
        /// <param name="currentStatus">Current status of the post</param>
        /// <param name="newStatus">Desired new status</param>
        /// <returns>True if the status change is valid</returns>
        public bool IsValidStatusChange(PostType postType, PostStatus currentStatus, PostStatus newStatus)
        {
            // Prevent no-change operations
            if (currentStatus == newStatus)
            {
                return false;
            }

            // Apply specific rules based on post type
            switch (postType)
            {
                case PostType.BuySell:
                    // BuySell posts: can be updated to Sold, Inactive, or Cancelled
                    return newStatus == PostStatus.Sold || 
                           newStatus == PostStatus.Inactive || 
                           newStatus == PostStatus.Cancelled;

                case PostType.PetWedding:
                    // PetWedding posts: can be marked as Cancelled or Inactive
                    return newStatus == PostStatus.Cancelled || 
                           newStatus == PostStatus.Inactive;

                case PostType.Library:
                    // Library posts: can only be set to Inactive
                    return newStatus == PostStatus.Inactive;

                case PostType.Announcement:
                    // Announcement posts: can be set to Inactive or Expired
                    return newStatus == PostStatus.Inactive || 
                           newStatus == PostStatus.Expired;

                case PostType.Meetup:
                    // Meetup posts: can transition between Active/Inactive/Cancelled/Pending
                    return newStatus == PostStatus.Active || 
                           newStatus == PostStatus.Inactive || 
                           newStatus == PostStatus.Cancelled ||
                           newStatus == PostStatus.Pending;

                case PostType.Moment:
                    // Moment posts: no status transitions allowed per requirements
                    return false;

                default:
                    return false;
            }
        }

        /// <summary>
        /// Gets the roles that can create Library posts
        /// </summary>
        /// <returns>List of roles that can create Library posts</returns>
        public static List<string> GetLibraryPostCreationRoles()
        {
            return new List<string>
            {
                UserRoles.SiteAdmin,
                UserRoles.Vet
            };
        }

        /// <summary>
        /// Gets the roles that can create Announcement posts
        /// </summary>
        /// <returns>List of roles that can create Announcement posts</returns>
        public static List<string> GetAnnouncementPostCreationRoles()
        {
            return new List<string>
            {
                UserRoles.SiteAdmin
            };
        }

        /// <summary>
        /// Gets the roles that can create unrestricted post types
        /// </summary>
        /// <returns>List of roles that can create Moment, BuySell, PetWedding, and Meetup posts</returns>
        public static List<string> GetUnrestrictedPostCreationRoles()
        {
            return UserRoles.AllRoles;
        }

        /// <summary>
        /// Gets detailed information about post creation restrictions by role
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <returns>Dictionary of post types and whether the user can create them</returns>
        public Dictionary<PostType, bool> GetPostCreationPermissions(string userRole)
        {
            var permissions = new Dictionary<PostType, bool>();
            
            foreach (PostType postType in Enum.GetValues<PostType>())
            {
                permissions[postType] = CanCreatePost(userRole, postType);
            }
            
            return permissions;
        }

        /// <summary>
        /// Gets a user-friendly error message for unauthorized post creation attempts
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <param name="postType">The post type they tried to create</param>
        /// <returns>Descriptive error message</returns>
        public string GetPostCreationErrorMessage(string userRole, PostType postType)
        {
            var roleDisplayName = UserRoles.GetDisplayName(userRole);
            
            switch (postType)
            {
                case PostType.Library:
                    return $"Only veterinarians and site administrators can create Library posts. Your current role ({roleDisplayName}) does not have permission to create this type of post.";
                
                case PostType.Announcement:
                    return $"Only site administrators can create Announcement posts. Your current role ({roleDisplayName}) does not have permission to create this type of post.";
                
                default:
                    return $"Your role ({roleDisplayName}) does not have permission to create {postType} posts.";
            }
        }

        /// <summary>
        /// Gets the allowed status transitions for a specific post type
        /// </summary>
        /// <param name="postType">The type of post</param>
        /// <returns>List of allowed status values</returns>
        public List<PostStatus> GetAllowedStatusTransitions(PostType postType)
        {
            switch (postType)
            {
                case PostType.BuySell:
                    return new List<PostStatus> { PostStatus.Sold, PostStatus.Inactive, PostStatus.Cancelled };

                case PostType.PetWedding:
                    return new List<PostStatus> { PostStatus.Cancelled, PostStatus.Inactive };

                case PostType.Library:
                    return new List<PostStatus> { PostStatus.Inactive };

                case PostType.Announcement:
                    return new List<PostStatus> { PostStatus.Inactive, PostStatus.Expired };

                case PostType.Meetup:
                    return new List<PostStatus> { PostStatus.Active, PostStatus.Inactive, PostStatus.Cancelled, PostStatus.Pending };

                case PostType.Moment:
                    return new List<PostStatus>(); // No status transitions allowed

                default:
                    return new List<PostStatus>();
            }
        }

        /// <summary>
        /// Gets error message for unauthorized status change attempts
        /// </summary>
        /// <param name="userRole">The user's role</param>
        /// <param name="postType">The post type</param>
        /// <param name="isOwner">Whether the user owns the post</param>
        /// <returns>Descriptive error message</returns>
        public string GetStatusChangeErrorMessage(string userRole, PostType postType, bool isOwner)
        {
            var roleDisplayName = UserRoles.GetDisplayName(userRole);
            
            switch (postType)
            {
                case PostType.BuySell:
                    return isOwner 
                        ? "You can update the status of your BuySell posts." 
                        : $"Only the creator or site administrators can update BuySell post status. Your role ({roleDisplayName}) does not have permission.";

                case PostType.PetWedding:
                    return isOwner 
                        ? "You can update the status of your PetWedding posts." 
                        : $"Only the creator or site administrators can update PetWedding post status. Your role ({roleDisplayName}) does not have permission.";

                case PostType.Library:
                    if (!isOwner)
                        return $"Only the veterinarian creator or site administrators can update Library post status. Your role ({roleDisplayName}) does not have permission.";
                    if (!UserRoles.IsVet(userRole) && !UserRoles.IsAdmin(userRole))
                        return $"Only veterinarians can update their own Library posts. Your role ({roleDisplayName}) does not have permission.";
                    return "You can update the status of your Library posts.";

                case PostType.Announcement:
                    return $"Only site administrators can update Announcement post status. Your role ({roleDisplayName}) does not have permission.";

                case PostType.Meetup:
                    return $"Only meetup administrators and site administrators can update Meetup post status. Your role ({roleDisplayName}) does not have permission.";

                case PostType.Moment:
                    return "Moment posts do not support status updates.";

                default:
                    return $"Your role ({roleDisplayName}) does not have permission to update {postType} post status.";
            }
        }
    }
}
