using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using PetWhenua.Hubs;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LikesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IHubContext<NotificationHub> _hubContext;

    public LikesController(
        AppDbContext context,
        INotificationService notificationService,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _notificationService = notificationService;
        _hubContext = hubContext;
    }

    // GET: api/likes/post/{postId}
    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetLikesByPost(int postId)
    {
        var likes = await _context.Likes
            .Where(l => l.PostId == postId)
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new
            {
                l.LikeId,
                l.PostId,
                l.UserId,
                l.CreatedAt,
                User = new
                {
                    l.User.UserId,
                    l.User.Username,
                    l.User.FirstName,
                    l.User.LastName,
                    l.User.ProfilePicture
                }
            })
            .ToListAsync();

        return Ok(likes);
    }

    // GET: api/likes/count/{postId}
    [HttpGet("count/{postId}")]
    public async Task<IActionResult> GetLikeCount(int postId)
    {
        var count = await _context.Likes.CountAsync(l => l.PostId == postId);
        return Ok(new { count });
    }

    // GET: api/likes/user/{postId}
    [HttpGet("user/{postId}")]
    public async Task<IActionResult> HasUserLikedPost(int postId)
    {
        var userId = GetCurrentUserId();
        var hasLiked = await _context.Likes
            .AnyAsync(l => l.PostId == postId && l.UserId == userId);
        return Ok(new { hasLiked });
    }

    // GET: api/likes/post/{postId}/user/{userId}/status
    [HttpGet("post/{postId}/user/{userId}/status")]
    public async Task<IActionResult> GetLikeStatus(int postId, int userId)
    {
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == postId);
        var isLiked = await _context.Likes.AnyAsync(l => l.PostId == postId && l.UserId == userId);
        
        return Ok(new { 
            likeCount = likeCount,
            isLiked = isLiked 
        });
    }

    // POST: api/likes
    [HttpPost]
    public async Task<IActionResult> LikePost([FromBody] CreateLikeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        // Check if post exists
        var postExists = await _context.Posts.AnyAsync(p => p.PostId == request.PostId);
        if (!postExists)
        {
            return NotFound($"Post with ID {request.PostId} not found.");
        }

        // Check if user already liked this post
        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == userId);

        if (existingLike != null)
        {
            return BadRequest("You have already liked this post.");
        }

        var like = new Like
        {
            PostId = request.PostId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Likes.Add(like);
        await _context.SaveChangesAsync();

        // Send notification to post owner (if different from liker)
        try
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PostId == request.PostId);
                
            var liker = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (post?.UserId != userId && post?.User != null && liker != null)
            {
                // Create notification
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = post.UserId,
                    Type = NotificationType.PostLiked,
                    Title = "Post Liked",
                    Message = $"{liker.FirstName} {liker.LastName} liked your post: \"{post.Title}\"",
                    RelatedPostId = post.PostId,
                    RelatedUserId = userId
                });

                // Send real-time notification
                await _hubContext.Clients.User(post.UserId.ToString())
                    .SendAsync("NotificationReceived", new
                    {
                        type = NotificationType.PostLiked,
                        title = "Post Liked",
                        message = $"{liker.FirstName} {liker.LastName} liked your post",
                        postId = post.PostId,
                        postTitle = post.Title,
                        likerId = userId,
                        likerName = $"{liker.FirstName} {liker.LastName}"
                    });
            }
        }
        catch (Exception ex)
        {
            // Log notification failure but don't fail the like creation
            Console.WriteLine($"Failed to send like notification: {ex.Message}");
        }

        // Return the created like with user info
        var createdLike = await _context.Likes
            .Where(l => l.LikeId == like.LikeId)
            .Include(l => l.User)
            .Select(l => new
            {
                l.LikeId,
                l.PostId,
                l.UserId,
                l.CreatedAt,
                User = new
                {
                    l.User.UserId,
                    l.User.Username,
                    l.User.FirstName,
                    l.User.LastName,
                    l.User.ProfilePicture
                }
            })
            .FirstOrDefaultAsync();

        return CreatedAtAction(nameof(GetLikesByPost), new { postId = like.PostId }, createdLike);
    }

    // DELETE: api/likes/{postId}
    [HttpDelete("{postId}")]
    public async Task<IActionResult> UnlikePost(int postId)
    {
        var userId = GetCurrentUserId();

        var like = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (like == null)
        {
            return NotFound("Like not found.");
        }

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Post unliked successfully" });
    }

    // POST: api/likes/toggle
    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleLike([FromBody] CreateLikeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        // Check if post exists
        var postExists = await _context.Posts.AnyAsync(p => p.PostId == request.PostId);
        if (!postExists)
        {
            return NotFound("Post not found.");
        }

        // Check if user has already liked this post
        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == userId);

        bool isLiked;
        int? likeId = null;

        if (existingLike != null)
        {
            // Unlike the post
            _context.Likes.Remove(existingLike);
            isLiked = false;
        }
        else
        {
            // Like the post
            var like = new Like
            {
                PostId = request.PostId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Likes.Add(like);
            await _context.SaveChangesAsync();
            likeId = like.LikeId;
            isLiked = true;

            // Send notification to post owner (if different from liker)
            try
            {
                var post = await _context.Posts
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.PostId == request.PostId);
                    
                var liker = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserId == userId);

                if (post?.UserId != userId && post?.User != null && liker != null)
                {
                    await _notificationService.CreateAndSendNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = post.UserId,
                        Type = NotificationType.PostLiked,
                        Title = "Post Liked",
                        Message = $"{liker.FirstName} {liker.LastName} liked your post: \"{post.Title}\"",
                        RelatedPostId = post.PostId,
                        RelatedUserId = userId
                    });
                }
            }
            catch (Exception ex)
            {
                // Log notification failure but don't fail the like creation
                Console.WriteLine($"Failed to send like notification: {ex.Message}");
            }
        }

        if (existingLike != null)
        {
            await _context.SaveChangesAsync();
        }

        // Get updated like count
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == request.PostId);

        return Ok(new
        {
            likeId = likeId,
            postId = request.PostId,
            userId = userId,
            likeCount = likeCount,
            isLiked = isLiked
        });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user token");
        }
        return userId;
    }
}

public class CreateLikeRequest
{
    public int PostId { get; set; }
} 