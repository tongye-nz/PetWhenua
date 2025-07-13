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
            // All authenticated users can create posts of any type
            // The status will be determined by GetInitialPostStatus
            return !string.IsNullOrEmpty(userRole) && UserRoles.IsValidRole(userRole);
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
    }
}
