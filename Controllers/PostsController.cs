using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Hubs;
using PetWhenua.Utils;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly IImageService _imageService;
    private readonly IPostAuthorizationService _authorizationService;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly AppDbContext _context;
    private readonly ILogger<PostsController> _logger;

    public PostsController(
        IPostService postService, 
        IImageService imageService, 
        IPostAuthorizationService authorizationService, 
        IHubContext<NotificationHub> hubContext, 
        AppDbContext context,
        ILogger<PostsController> logger)
    {
        _postService = postService;
        _imageService = imageService;
        _authorizationService = authorizationService;
        _hubContext = hubContext;
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts(
        [FromQuery] string? postType = null, 
        [FromQuery] int? userId = null, 
        [FromQuery] string? region = null, 
        [FromQuery] string? district = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10; // Limit max page size

            PostType? parsedPostType = null;
            
            // Parse postType if provided - handle both numeric and string values
            if (!string.IsNullOrEmpty(postType))
            {
                // Try parsing as integer first (for numeric values like "5")
                if (int.TryParse(postType, out var numericValue) && Enum.IsDefined(typeof(PostType), numericValue))
                {
                    parsedPostType = (PostType)numericValue;
                }
                // Fallback to string parsing (for string values like "Moment")
                else if (Enum.TryParse<PostType>(postType, true, out var result))
                {
                    parsedPostType = result;
                }
                else
                {
                    return BadRequest($"Invalid postType: {postType}. Valid values are: {string.Join(", ", Enum.GetNames<PostType>())} or their numeric equivalents (0-5)");
                }
            }

            var (posts, totalCount) = await _postService.GetPostsPagedAsync(parsedPostType, userId, region, district, page, pageSize);
            
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            
            return Ok(new
            {
                posts = posts,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalCount = totalCount,
                    totalPages = totalPages,
                    hasNextPage = page < totalPages,
                    hasPreviousPage = page > 1
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPosts");
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        try
        {
            var post = await _postService.GetPostByIdAsync(id);

            if (post == null)
            {
                return NotFound($"Post with ID {id} not found.");
            }

            return Ok(post);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPost(id={PostId})", id);
            return StatusCode(500, new { message = "Internal server error", details = ex.Message, postId = id });
        }
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post");
            return StatusCode(500, new { message = "An error occurred while creating the post." });
        }
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
                request.Address, 
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post with role");
            return StatusCode(500, new { message = "An error occurred while creating the post." });
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post with images");
            return StatusCode(500, "An error occurred while creating the post with images.");
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
                return Forbid("You do not have permission to edit this post. Posts can only be edited when they are Active or Pending. Inactive posts can only be deleted.");
            }

            // Check if content has changed for active meetups (requires re-approval)
            bool contentChanged = false;
            bool requiresPendingStatus = false;
            
            if (existingPost.PostType == PostType.Meetup)
            {
                // Check if any meaningful content has been modified
                contentChanged = existingPost.Title != updateDto.Title ||
                               existingPost.Content != updateDto.Content ||
                               existingPost.Location != updateDto.Location ||
                               existingPost.Address != updateDto.Address ||
                               existingPost.EventDate != updateDto.EventDate ||
                               existingPost.Category != updateDto.Category ||
                               !existingPost.Images.SequenceEqual(updateDto.Images ?? new List<string>());
                
                // Require pending status if:
                // 1. This was an active meetup and content changed, OR
                // 2. This is already pending (don't allow frontend to override back to active)
                requiresPendingStatus = (existingPost.Status == PostStatus.Active && contentChanged) || 
                                      existingPost.Status == PostStatus.Pending;
            }

            // Update the existing tracked entity instead of creating a new one
            // This avoids EF tracking conflicts
            existingPost.PostType = updateDto.PostType;
            existingPost.Title = updateDto.Title;
            existingPost.Content = updateDto.Content;
            existingPost.Images = updateDto.Images ?? new List<string>();
            existingPost.Location = updateDto.Location;
            existingPost.Address = updateDto.Address;
            existingPost.Price = updateDto.Price;
            existingPost.EventDate = updateDto.EventDate;
            existingPost.Category = updateDto.Category;
            existingPost.UpdatedAt = DateTime.UtcNow;
            
            // Set status: For meetups that require pending status, force to pending
            // Otherwise, use the status from the frontend request
            if (requiresPendingStatus)
            {
                existingPost.Status = PostStatus.Pending;
            }
            else
            {
                existingPost.Status = updateDto.Status;
            }
            
            // Note: Don't update CreatedAt or UserId for security

            await _postService.UpdatePostAsync(existingPost);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating post {PostId}", id);
            return StatusCode(500, new { message = "An error occurred while updating the post." });
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(int id)
    {
        try
        {
            // Get current user info
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user token.");
            }

            if (string.IsNullOrEmpty(userRoleClaim))
            {
                return Unauthorized("User role not found.");
            }

            // Get the post to check ownership
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null)
            {
                return NotFound($"Post with ID {id} not found.");
            }

            // Check if user can delete this post (owner or admin)
            bool canDelete = post.UserId == userId || UserRoles.IsAdmin(userRoleClaim);
            
            if (!canDelete)
            {
                return Forbid("You can only delete your own posts.");
            }

            // Handle pet wedding deletion notifications before deleting
            if (post.PostType == PostType.PetWedding)
            {
                try
                {
                    // Get participants before deleting the post
                    var participants = await _context.PetWeddingParticipants
                        .Where(pwp => pwp.PostId == id)
                        .ToListAsync();

                    // Get unique owner IDs (excluding the post creator)
                    var participantOwnerIds = participants
                        .Where(p => p.OwnerId != userId) // Exclude post creator
                        .Select(p => p.OwnerId)
                        .Distinct()
                        .ToList();

                    // Notify participants about the deletion via SignalR
                    if (participantOwnerIds.Any())
                    {
                        await _hubContext.Clients.Groups(
                            participantOwnerIds.Select(ownerId => $"user_{ownerId}")
                        ).SendAsync("PetWeddingPostDeleted", new { postId = id });
                    }
                }
                catch (Exception notificationEx)
                {
                    // Log notification error but don't fail the deletion
                    _logger.LogError(notificationEx, "Failed to send pet wedding deletion notifications for post {PostId}", id);
                }
            }

            var deleted = await _postService.DeletePostAsync(id);
            
            if (!deleted)
            {
                return StatusCode(500, "Failed to delete post. Please try again.");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting post {PostId}", id);
            return StatusCode(500, "An error occurred while deleting the post.");
        }
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting posts for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while getting user posts." });
        }
    }

    [HttpGet("type/{postType}")]
    public async Task<IActionResult> GetPostsByType(PostType postType)
    {
        try
        {
            var posts = await _postService.GetPostsByTypeAsync(postType);
            return Ok(posts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetPostsByType for {PostType}", postType);
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }
}