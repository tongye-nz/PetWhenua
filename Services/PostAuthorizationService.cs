namespace PetWhenua.Services
{
    public class PostAuthorizationService : IPostAuthorizationService
    {
        public PostStatus GetInitialPostStatus(string userRole, PostType postType)
        {
            // For Meetup posts, apply special role-based logic
            if (postType == PostType.Meetup)
            {
                // Members create inactive meetup posts that need admin approval
                if (userRole == UserRoles.Member)
                {
                    return PostStatus.Inactive;
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
            // For Meetup posts, only admins can change status
            if (postType == PostType.Meetup)
            {
                // Site Admins and Meetup Admins can always change meetup post status
                return UserRoles.IsAdmin(userRole) || UserRoles.IsMeetupAdmin(userRole);
            }

            // For other post types, owners can change their own post status, admins can change any
            return isOwner || UserRoles.IsAdmin(userRole);
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
            // Prevent invalid status transitions
            if (currentStatus == newStatus)
            {
                return false; // No change needed
            }

            // For meetup posts, certain transitions might be restricted
            if (postType == PostType.Meetup)
            {
                // Don't allow changing from Active to Inactive for meetups (should use Cancelled instead)
                if (currentStatus == PostStatus.Active && newStatus == PostStatus.Inactive)
                {
                    return false;
                }
            }

            // For BuySell posts, validate Sold status
            if (postType == PostType.BuySell)
            {
                // Only allow setting to Sold from Active
                if (newStatus == PostStatus.Sold && currentStatus != PostStatus.Active)
                {
                    return false;
                }
            }

            return true;
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
    }
}
