using Microsoft.AspNetCore.Mvc;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] PostType? postType = null, [FromQuery] int? userId = null)
    {
        var posts = await _postService.GetPostsAsync(postType, userId);
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
    public async Task<IActionResult> UpdatePost(int id, Post post)
    {
        if (id != post.PostId)
        {
            return BadRequest("Post ID mismatch.");
        }

        try
        {
            await _postService.UpdatePostAsync(post);
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
                request.Description, 
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
}