using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Repositories.Abstract;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly IImageService _imageService;
    private readonly IPostAuthorizationService _authorizationService;

    public PostsController(IPostService postService, IImageService imageService, IPostAuthorizationService authorizationService)
    {
        _postService = postService;
        _imageService = imageService;
        _authorizationService = authorizationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts(
        [FromQuery] PostType? postType = null, 
        [FromQuery] int? userId = null, 
        [FromQuery] string? region = null, 
        [FromQuery] string? district = null)
    {
        var posts = await _postService.GetPostsAsync(postType, userId, region, district);
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await _postService.GetPostByIdAsync(id);

        if (post == null)
        {
            return NotFound($"Post with ID {id} not found.");
        }

        return Ok(post);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost(Post post)
    {
        try
        {
            var createdPost = await _postService.CreatePostAsync(post);
            return CreatedAtAction(nameof(GetPost), new { id = createdPost.PostId }, createdPost);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdatePost(int id, UpdatePostDto updateDto)
    {
        if (id != updateDto.PostId)
        {
            return BadRequest("Post ID mismatch.");
        }

        try
        {
            // Get current user info
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            if (string.IsNullOrEmpty(userRoleClaim))
            {
                return Unauthorized("User role not found.");
            }

            // Get the existing post to check authorization
            var existingPost = await _postService.GetPostByIdAsync(id);
            if (existingPost == null)
            {
                return NotFound($"Post with ID {id} not found.");
            }

            // Check if user can edit this post
            if (!_authorizationService.CanEditPost(userRoleClaim, existingPost, userId))
            {
                return Forbid("You do not have permission to edit this post. Posts can only be edited when they are Active, Inactive, or Pending.");
            }

            // Update the existing tracked entity instead of creating a new one
            // This avoids EF tracking conflicts
            existingPost.PostType = updateDto.PostType;
            existingPost.Title = updateDto.Title;
            existingPost.Content = updateDto.Content;
            existingPost.Status = updateDto.Status;
            existingPost.Images = updateDto.Images ?? new List<string>();
            existingPost.Location = updateDto.Location;
            existingPost.Address = updateDto.Address;
            existingPost.Price = updateDto.Price;
            existingPost.EventDate = updateDto.EventDate;
            existingPost.Category = updateDto.Category;
            existingPost.UpdatedAt = DateTime.UtcNow;
            // Note: Don't update CreatedAt or UserId for security

            await _postService.UpdatePostAsync(existingPost);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var deleted = await _postService.DeletePostAsync(id);
        
        if (!deleted)
        {
            return NotFound($"Post with ID {id} not found.");
        }

        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPostsByUser(int userId)
    {
        try
        {
            var posts = await _postService.GetPostsByUserAsync(userId);
            return Ok(posts);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("type/{postType}")]
    public async Task<IActionResult> GetPostsByType(PostType postType)
    {
        var posts = await _postService.GetPostsByTypeAsync(postType);
        return Ok(posts);
    }

    [HttpPost("with-role")]
    public async Task<IActionResult> CreatePostWithRole([FromBody] CreatePostWithRoleRequest request)
    {
        try
        {
            var createdPost = await _postService.CreatePostWithUserRoleAsync(
                request.UserId, 
                request.UserRole, 
                request.PostType, 
                request.Title, 
                request.Content, 
                request.Images, 
                request.Location, 
                request.Price, 
                request.EventDate, 
                request.Category
            );
            return CreatedAtAction(nameof(GetPost), new { id = createdPost.PostId }, createdPost);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangePostStatus(int id, [FromBody] ChangePostStatusRequest request)
    {
        try
        {
            var updatedPost = await _postService.ChangePostStatusAsync(id, request.NewStatus, request.RequestingUserId, request.RequestingUserRole);
            return Ok(updatedPost);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("meetups/inactive")]
    public async Task<IActionResult> GetInactiveMeetupPosts()
    {
        var posts = await _postService.GetInactiveMeetupPostsAsync();
        return Ok(posts);
    }

    [HttpGet("{id}/can-change-status")]
    public async Task<IActionResult> CanUserChangePostStatus(int id, [FromQuery] int userId, [FromQuery] string userRole)
    {
        var canChange = await _postService.CanUserChangePostStatusAsync(id, userId, userRole);
        return Ok(new { canChangeStatus = canChange });
    }

    [HttpGet("meetup/activation-info")]
    public IActionResult GetMeetupActivationInfo()
    {
        var info = new MeetupActivationInfo
        {
            AutoActiveRoles = PostAuthorizationService.GetAutoActiveMeetupRoles(),
            ActivationRoles = PostAuthorizationService.GetMeetupActivationRoles()
        };
        return Ok(info);
    }

    [HttpGet("creation-permissions")]
    public IActionResult GetPostCreationPermissions([FromQuery] string userRole)
    {
        if (string.IsNullOrEmpty(userRole))
        {
            return BadRequest("User role is required.");
        }

        if (!UserRoles.IsValidRole(userRole))
        {
            return BadRequest($"Invalid user role: {userRole}");
        }

        var authService = new PostAuthorizationService();
        var permissions = authService.GetPostCreationPermissions(userRole);
        
        var response = new PostCreationPermissionsResponse
        {
            UserRole = userRole,
            UserRoleDisplayName = UserRoles.GetDisplayName(userRole),
            Permissions = permissions.ToDictionary(
                kvp => kvp.Key.ToString(), 
                kvp => kvp.Value
            ),
            RestrictedPostTypes = permissions
                .Where(kvp => !kvp.Value)
                .Select(kvp => kvp.Key.ToString())
                .ToList(),
            AllowedPostTypes = permissions
                .Where(kvp => kvp.Value)
                .Select(kvp => kvp.Key.ToString())
                .ToList()
        };

        return Ok(response);
    }

    [HttpGet("creation-restrictions")]
    public IActionResult GetPostCreationRestrictions()
    {
        var restrictions = new PostCreationRestrictionsInfo
        {
            LibraryPostRoles = PostAuthorizationService.GetLibraryPostCreationRoles(),
            AnnouncementPostRoles = PostAuthorizationService.GetAnnouncementPostCreationRoles(),
            UnrestrictedPostRoles = PostAuthorizationService.GetUnrestrictedPostCreationRoles(),
            PostTypeRestrictions = new Dictionary<string, List<string>>
            {
                { "Library", PostAuthorizationService.GetLibraryPostCreationRoles() },
                { "Announcement", PostAuthorizationService.GetAnnouncementPostCreationRoles() },
                { "Moment", UserRoles.AllRoles },
                { "BuySell", UserRoles.AllRoles },
                { "PetWedding", UserRoles.AllRoles },
                { "Meetup", UserRoles.AllRoles }
            }
        };

        return Ok(restrictions);
    }

    [HttpGet("{id}/status-transitions")]
    public async Task<IActionResult> GetAvailableStatusTransitions(int id, [FromQuery] int userId, [FromQuery] string userRole)
    {
        try
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null)
            {
                return NotFound($"Post with ID {id} not found.");
            }

            var availableTransitions = await _postService.GetAvailableStatusTransitionsAsync(id, userId, userRole);
            var canChangeStatus = await _postService.CanUserChangePostStatusAsync(id, userId, userRole);

            var response = new PostStatusTransitionsResponse
            {
                PostId = id,
                PostType = post.PostType,
                CurrentStatus = post.Status,
                AvailableTransitions = availableTransitions,
                CanChangeStatus = canChangeStatus,
                Message = canChangeStatus 
                    ? $"You can change this {post.PostType} post to: {string.Join(", ", availableTransitions)}"
                    : $"You cannot change the status of this {post.PostType} post."
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdatePostStatus(int id, [FromBody] UpdatePostStatusRequest request)
    {
        try
        {
            var updatedPost = await _postService.ChangePostStatusAsync(id, request.Status, request.UserId, request.UserRole);
            return Ok(new { 
                postId = updatedPost.PostId,
                newStatus = updatedPost.Status,
                message = $"Post status successfully updated to {updatedPost.Status}",
                updatedAt = updatedPost.UpdatedAt
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An unexpected error occurred while updating post status." });
        }
    }

    [HttpGet("status-change-permissions")]
    public IActionResult GetStatusChangePermissions([FromQuery] string userRole)
    {
        try
        {
            if (string.IsNullOrEmpty(userRole))
            {
                return BadRequest("User role is required.");
            }

            if (!UserRoles.IsValidRole(userRole))
            {
                return BadRequest($"Invalid user role: {userRole}");
            }

            var permissions = _postService.GetStatusChangePermissions(userRole);
            
            var response = new StatusChangePermissionsResponse
            {
                UserRole = userRole,
                UserRoleDisplayName = UserRoles.GetDisplayName(userRole),
                AllowedTransitions = permissions.ToDictionary(
                    kvp => kvp.Key.ToString(),
                    kvp => kvp.Value.Select(s => s.ToString()).ToList()
                ),
                PostTypeRules = new Dictionary<string, string>
                {
                    { "BuySell", "Creator or site admin can update to: Sold, Inactive, Cancelled" },
                    { "PetWedding", "Creator or site admin can update to: Cancelled, Inactive" },
                    { "Library", "Vet creator or site admin can update to: Inactive" },
                    { "Announcement", "Only site admin can update to: Inactive, Expired" },
                    { "Meetup", "Meetup admin or site admin can update to: Active, Inactive, Cancelled" },
                    { "Moment", "No status updates allowed" }
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("expire-past-events")]
    public async Task<IActionResult> ExpirePastEvents([FromQuery] string? userRole = null)
    {
        try
        {
            // Only allow admins to manually trigger expiry
            if (!string.IsNullOrEmpty(userRole) && !UserRoles.IsAdmin(userRole))
            {
                return StatusCode(403, new { error = "Only site administrators can manually trigger post expiry." });
            }

            using var scope = HttpContext.RequestServices.CreateScope();
            var expiryService = scope.ServiceProvider.GetRequiredService<PostExpiryService>();
            
            var expiredCount = await expiryService.ExpirePostsByEventDateAsync();
            
            return Ok(new
            {
                message = $"Manual expiry check completed. {expiredCount} posts expired.",
                expiredCount = expiredCount,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while expiring posts.", details = ex.Message });
        }
    }

    [HttpGet("expiry-stats")]
    public async Task<IActionResult> GetExpiryStats()
    {
        try
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var expiryService = scope.ServiceProvider.GetRequiredService<PostExpiryService>();
            
            var stats = await expiryService.GetExpiryStatsAsync();
            
            return Ok(new
            {
                totalExpirablePosts = stats.TotalExpirablePosts,
                expirableByType = stats.ExpirableByType.ToDictionary(
                    kvp => kvp.Key.ToString(),
                    kvp => kvp.Value
                ),
                totalActiveTimeBasedPosts = stats.TotalActiveTimeBasedPosts,
                checkDate = stats.CheckDate,
                message = stats.TotalExpirablePosts > 0 
                    ? $"{stats.TotalExpirablePosts} posts are eligible for expiration"
                    : "No posts are currently eligible for expiration"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while getting expiry stats.", details = ex.Message });
        }
    }

    [HttpGet("past-events")]
    public async Task<IActionResult> GetPastEvents()
    {
        try
        {
            using var scope = HttpContext.RequestServices.CreateScope();
            var postRepository = scope.ServiceProvider.GetRequiredService<IPostRepository>();
            
            var expirablePosts = await postRepository.GetExpirablePostsAsync(DateTime.UtcNow);
            
            var result = expirablePosts.Select(p => new
            {
                postId = p.PostId,
                title = p.Title,
                postType = p.PostType.ToString(),
                eventDate = p.EventDate,
                status = p.Status.ToString(),
                daysPastEvent = p.EventDate.HasValue 
                    ? (DateTime.UtcNow.Date - p.EventDate.Value.Date).Days 
                    : 0
            });

            return Ok(new
            {
                posts = result,
                count = result.Count(),
                message = result.Any() 
                    ? $"Found {result.Count()} past events that should be expired"
                    : "No past events found that need expiration"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while getting past events.", details = ex.Message });
        }
    }

    [HttpPost("with-images")]
    public async Task<IActionResult> CreatePostWithImages([FromForm] CreatePostWithImagesRequest request)
    {
        try
        {
            // Validate image count
            if (request.Images != null && request.Images.Count > 9)
            {
                return BadRequest("Maximum 9 images allowed per post.");
            }

            // Create the post first
            var post = new Post
            {
                UserId = request.UserId,
                PostType = request.PostType,
                Title = request.Title,
                Content = request.Content,
                Location = request.Location,
                Address = request.Address,
                Price = request.Price,
                EventDate = request.EventDate,
                Category = request.Category
            };

            var createdPost = await _postService.CreatePostAsync(post);

            // Upload images if provided
            if (request.Images != null && request.Images.Any())
            {
                try
                {
                    var imageUrls = await _imageService.UploadImagesAsync(request.Images, request.UserId, createdPost.PostId);
                    
                    // Update post with image URLs
                    createdPost.Images = imageUrls;
                    await _postService.UpdatePostAsync(createdPost);
                }
                catch (Exception ex)
                {
                    // If image upload fails, clean up the created post
                    await _postService.DeletePostAsync(createdPost.PostId);
                    throw new InvalidOperationException($"Failed to upload images: {ex.Message}");
                }
            }

            return CreatedAtAction(nameof(GetPost), new { id = createdPost.PostId }, createdPost);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while creating the post with images.");
        }
    }
}