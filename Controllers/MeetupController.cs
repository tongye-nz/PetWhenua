using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Utils;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/meetups")]
    public class MeetupController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ILogger<MeetupController> _logger;

        public MeetupController(IPostService postService, ILogger<MeetupController> logger)
        {
            _postService = postService;
            _logger = logger;
        }

        [HttpGet("inactive")]
        public async Task<IActionResult> GetInactiveMeetupPosts()
        {
            try
            {
                var posts = await _postService.GetInactiveMeetupPostsAsync();
                return Ok(posts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inactive meetup posts");
                return StatusCode(500, new { message = "Failed to retrieve inactive meetup posts", error = ex.Message });
            }
        }

        [HttpGet("pending")]
        [Authorize]
        public async Task<IActionResult> GetPendingMeetupPosts()
        {
            // Check if current user is a meetup admin or site admin
            var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(userRoleClaim) || !UserRoles.IsMeetupAdmin(userRoleClaim))
            {
                return Forbid("Only meetup administrators and site administrators can access pending meetup posts.");
            }

            try
            {
                var posts = await _postService.GetPendingMeetupPostsAsync();
                return Ok(posts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending meetup posts");
                return StatusCode(500, new { message = "Failed to retrieve pending meetup posts", error = ex.Message });
            }
        }

        [HttpGet("activation-info")]
        public IActionResult GetMeetupActivationInfo()
        {
            try
            {
                var info = new MeetupActivationInfo
                {
                    AutoActiveRoles = PostAuthorizationService.GetAutoActiveMeetupRoles(),
                    ActivationRoles = PostAuthorizationService.GetMeetupActivationRoles()
                };
                return Ok(info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting meetup activation info");
                return StatusCode(500, new { message = "Failed to retrieve meetup activation info", error = ex.Message });
            }
        }
    }
} 