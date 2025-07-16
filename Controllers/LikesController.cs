using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class LikesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LikesController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/likes
    [HttpPost]
    public async Task<IActionResult> LikePost([FromBody] LikeRequest request)
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

        // Check if already liked
        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == request.UserId);

        if (existingLike != null)
        {
            return Conflict("Post is already liked by this user.");
        }

        var like = new Like
        {
            PostId = request.PostId,
            UserId = request.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Likes.Add(like);
        await _context.SaveChangesAsync();

        // Return updated like count
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == request.PostId);
        
        return Ok(new { 
            likeId = like.LikeId,
            postId = like.PostId,
            userId = like.UserId,
            likeCount = likeCount,
            isLiked = true
        });
    }

    // DELETE: api/likes/post/{postId}/user/{userId}
    [HttpDelete("post/{postId}/user/{userId}")]
    public async Task<IActionResult> UnlikePost(int postId, int userId)
    {
        var like = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        if (like == null)
        {
            return NotFound("Like not found.");
        }

        _context.Likes.Remove(like);
        await _context.SaveChangesAsync();

        // Return updated like count
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == postId);
        
        return Ok(new { 
            postId = postId,
            userId = userId,
            likeCount = likeCount,
            isLiked = false
        });
    }

    // GET: api/likes/post/{postId}/count
    [HttpGet("post/{postId}/count")]
    public async Task<IActionResult> GetLikeCount(int postId)
    {
        var count = await _context.Likes.CountAsync(l => l.PostId == postId);
        return Ok(new { postId, count });
    }

    // GET: api/likes/post/{postId}/user/{userId}/status
    [HttpGet("post/{postId}/user/{userId}/status")]
    public async Task<IActionResult> GetLikeStatus(int postId, int userId)
    {
        var isLiked = await _context.Likes
            .AnyAsync(l => l.PostId == postId && l.UserId == userId);
        
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == postId);

        return Ok(new { 
            postId,
            userId,
            isLiked,
            likeCount
        });
    }

    // GET: api/likes/post/{postId}/users
    [HttpGet("post/{postId}/users")]
    public async Task<IActionResult> GetUsersWhoLikedPost(int postId)
    {
        var users = await _context.Likes
            .Where(l => l.PostId == postId)
            .Include(l => l.User)
            .Select(l => new
            {
                l.User.UserId,
                l.User.Username,
                l.User.FirstName,
                l.User.LastName,
                l.User.ProfilePicture,
                l.CreatedAt
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users);
    }

    // POST: api/likes/toggle
    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleLike([FromBody] LikeRequest request)
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

        // Check if already liked
        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == request.PostId && l.UserId == request.UserId);

        bool isLiked;
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
                UserId = request.UserId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Likes.Add(like);
            isLiked = true;
        }

        await _context.SaveChangesAsync();

        // Return updated like count
        var likeCount = await _context.Likes.CountAsync(l => l.PostId == request.PostId);
        
        return Ok(new { 
            postId = request.PostId,
            userId = request.UserId,
            likeCount = likeCount,
            isLiked = isLiked
        });
    }
}

// DTO for request
public class LikeRequest
{
    public int PostId { get; set; }
    public int UserId { get; set; }
} 