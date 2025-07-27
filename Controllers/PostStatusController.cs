using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Utils;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/posts/{postId}/status")]
    public class PostStatusController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ILogger<PostStatusController> _logger;

        public PostStatusController(IPostService postService, ILogger<PostStatusController> logger)
        {
            _postService = postService;
            _logger = logger;
        }

        [HttpPatch]
        public async Task<IActionResult> ChangePostStatus(int postId, [FromBody] ChangePostStatusRequest request)
        {
            try
            {
                var updatedPost = await _postService.ChangePostStatusAsync(postId, request.NewStatus, request.RequestingUserId, request.RequestingUserRole);
                return Ok(updatedPost);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePostStatus(int postId, [FromBody] UpdatePostStatusRequest request)
        {
            try
            {
                var updatedPost = await _postService.ChangePostStatusAsync(postId, request.Status, request.UserId, request.UserRole);
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

        [HttpGet("can-change")]
        public async Task<IActionResult> CanUserChangePostStatus(int postId, [FromQuery] int userId, [FromQuery] string userRole)
        {
            var canChange = await _postService.CanUserChangePostStatusAsync(postId, userId, userRole);
            return Ok(new { canChangeStatus = canChange });
        }

        [HttpGet("transitions")]
        public async Task<IActionResult> GetAvailableStatusTransitions(int postId, [FromQuery] int userId, [FromQuery] string userRole)
        {
            try
            {
                var post = await _postService.GetPostByIdAsync(postId);
                if (post == null)
                {
                    return NotFound($"Post with ID {postId} not found.");
                }

                var availableTransitions = await _postService.GetAvailableStatusTransitionsAsync(postId, userId, userRole);
                var canChangeStatus = await _postService.CanUserChangePostStatusAsync(postId, userId, userRole);

                var response = new PostStatusTransitionsResponse
                {
                    PostId = postId,
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
    }

    [ApiController]
    [Route("api/posts/status")]
    public class PostStatusInfoController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostStatusInfoController(IPostService postService)
        {
            _postService = postService;
        }

        [HttpGet("permissions")]
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
} 