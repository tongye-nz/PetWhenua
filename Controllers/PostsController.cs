using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] PostType? postType = null, [FromQuery] int? userId = null)
    {
        var query = _context.Posts.Include(p => p.User).AsQueryable();

        if (postType.HasValue)
        {
            query = query.Where(p => p.PostType == postType.Value);
        }

        if (userId.HasValue)
        {
            query = query.Where(p => p.UserId == userId.Value);
        }

        var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PostId == id);

        if (post == null)
        {
            return NotFound($"Post with ID {id} not found.");
        }

        return Ok(post);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost(Post post)
    {
        // Validate user exists
        var userExists = await _context.Users.AnyAsync(u => u.UserId == post.UserId);
        if (!userExists)
        {
            return BadRequest("Invalid UserId. User does not exist.");
        }

        post.CreatedAt = DateTime.UtcNow;
        post.UpdatedAt = DateTime.UtcNow;

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPost), new { id = post.PostId }, post);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(int id, Post post)
    {
        if (id != post.PostId)
        {
            return BadRequest("Post ID mismatch.");
        }

        var existingPost = await _context.Posts.FindAsync(id);
        if (existingPost == null)
        {
            return NotFound($"Post with ID {id} not found.");
        }

        // Update properties
        existingPost.PostType = post.PostType;
        existingPost.Title = post.Title;
        existingPost.Description = post.Description;
        existingPost.Content = post.Content;
        existingPost.Images = post.Images;
        existingPost.Location = post.Location;
        existingPost.Price = post.Price;
        existingPost.EventDate = post.EventDate;
        existingPost.Category = post.Category;
        existingPost.Status = post.Status;
        existingPost.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await PostExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var post = await _context.Posts.FindAsync(id);
        if (post == null)
        {
            return NotFound($"Post with ID {id} not found.");
        }

        _context.Posts.Remove(post);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPostsByUser(int userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
        if (!userExists)
        {
            return NotFound($"User with ID {userId} not found.");
        }

        var posts = await _context.Posts
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("type/{postType}")]
    public async Task<IActionResult> GetPostsByType(PostType postType)
    {
        var posts = await _context.Posts
            .Include(p => p.User)
            .Where(p => p.PostType == postType)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts);
    }

    private async Task<bool> PostExists(int id)
    {
        return await _context.Posts.AnyAsync(e => e.PostId == id);
    }
} 