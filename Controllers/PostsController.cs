using Microsoft.AspNetCore.Mvc;
using PetWhenua.Services;

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
} 