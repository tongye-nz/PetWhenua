using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using PetWhenua.Services;
using PetWhenua.Hubs;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IHubContext<NotificationHub> _hubContext;

    public CommentsController(
        AppDbContext context,
        INotificationService notificationService,
        IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _notificationService = notificationService;
        _hubContext = hubContext;
    }

    // GET: api/comments/post/{postId}
    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetCommentsByPost(int postId)
    {
        var comments = await _context.Comments
            .Where(c => c.PostId == postId)
            .Include(c => c.User)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.CommentId,
                c.PostId,
                c.UserId,
                c.Content,
                c.CreatedAt,
                c.UpdatedAt,
                User = new
                {
                    c.User.UserId,
                    c.User.Username,
                    c.User.FirstName,
                    c.User.LastName,
                    c.User.ProfilePicture
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    // POST: api/comments
    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Verify post exists
        var postExists = await _context.Posts.AnyAsync(p => p.PostId == request.PostId);
        if (!postExists)
        {
            return NotFound($"Post with ID {request.PostId} not found.");
        }

        // Verify user exists
        var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId);
        if (!userExists)
        {
            return NotFound($"User with ID {request.UserId} not found.");
        }

        var comment = new Comment
        {
            PostId = request.PostId,
            UserId = request.UserId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        // Send notification to post owner (if different from commenter)
        try
        {
            var post = await _context.Posts
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PostId == request.PostId);
                
            var commenter = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == request.UserId);

            if (post?.UserId != request.UserId && post?.User != null && commenter != null)
            {
                // Create notification
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = post.UserId,
                    Type = NotificationType.PostCommented,
                    Title = "New Comment",
                    Message = $"{commenter.FirstName} {commenter.LastName} commented on your post: \"{post.Title}\"",
                    RelatedPostId = post.PostId,
                    RelatedUserId = request.UserId
                });

                // Send real-time notification
                await _hubContext.Clients.User(post.UserId.ToString())
                    .SendAsync("NotificationReceived", new
                    {
                        type = NotificationType.PostCommented,
                        title = "New Comment",
                        message = $"{commenter.FirstName} {commenter.LastName} commented on your post",
                        postId = post.PostId,
                        postTitle = post.Title,
                        commenterId = request.UserId,
                        commenterName = $"{commenter.FirstName} {commenter.LastName}"
                    });
            }
        }
        catch (Exception ex)
        {
            // Log notification failure but don't fail the comment creation
            Console.WriteLine($"Failed to send comment notification: {ex.Message}");
        }

        // Return the created comment with user info
        var createdComment = await _context.Comments
            .Where(c => c.CommentId == comment.CommentId)
            .Include(c => c.User)
            .Select(c => new
            {
                c.CommentId,
                c.PostId,
                c.UserId,
                c.Content,
                c.CreatedAt,
                c.UpdatedAt,
                User = new
                {
                    c.User.UserId,
                    c.User.Username,
                    c.User.FirstName,
                    c.User.LastName,
                    c.User.ProfilePicture
                }
            })
            .FirstOrDefaultAsync();

        return CreatedAtAction(nameof(GetCommentsByPost), new { postId = comment.PostId }, createdComment);
    }

    // PUT: api/comments/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound($"Comment with ID {id} not found.");
        }

        // Only allow the comment author to update
        if (comment.UserId != request.UserId)
        {
            return Forbid("You can only edit your own comments.");
        }

        comment.Content = request.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/comments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id, [FromQuery] int userId)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null)
        {
            return NotFound($"Comment with ID {id} not found.");
        }

        // Allow comment deletion by the author or post owner
        var post = await _context.Posts.FindAsync(comment.PostId);
        if (comment.UserId != userId && post?.UserId != userId)
        {
            return Forbid("You can only delete your own comments or comments on your posts.");
        }

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/comments/count/{postId}
    [HttpGet("count/{postId}")]
    public async Task<IActionResult> GetCommentCount(int postId)
    {
        var count = await _context.Comments.CountAsync(c => c.PostId == postId);
        return Ok(new { count });
    }
}

// DTOs for request/response
public class CreateCommentRequest
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class UpdateCommentRequest
{
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
} 