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
}