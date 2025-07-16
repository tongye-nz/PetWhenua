using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserFollowController : ControllerBase
    {
        private readonly IUserFollowService _userFollowService;

        public UserFollowController(IUserFollowService userFollowService)
        {
            _userFollowService = userFollowService;
        }

        [HttpPost("follow/{userId}")]
        public async Task<IActionResult> FollowUser(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var follow = await _userFollowService.FollowUserAsync(currentUserId, userId);
                return Ok(new { message = "User followed successfully", follow });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("unfollow/{userId}")]
        public async Task<IActionResult> UnfollowUser(int userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var success = await _userFollowService.UnfollowUserAsync(currentUserId, userId);
                
                if (!success)
                    return NotFound("Follow relationship not found");

                return Ok(new { message = "User unfollowed successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("is-following/{userId}")]
        public async Task<IActionResult> IsFollowing(int userId)
        {
            var currentUserId = GetCurrentUserId();
            var isFollowing = await _userFollowService.IsFollowingAsync(currentUserId, userId);
            return Ok(new { isFollowing });
        }

        [HttpGet("followers")]
        public async Task<IActionResult> GetMyFollowers()
        {
            var currentUserId = GetCurrentUserId();
            var followers = await _userFollowService.GetFollowersAsync(currentUserId);
            return Ok(followers);
        }

        [HttpGet("following")]
        public async Task<IActionResult> GetMyFollowing()
        {
            var currentUserId = GetCurrentUserId();
            var following = await _userFollowService.GetFollowingAsync(currentUserId);
            return Ok(following);
        }

        [HttpGet("followers/{userId}")]
        public async Task<IActionResult> GetUserFollowers(int userId)
        {
            var followers = await _userFollowService.GetFollowersAsync(userId);
            return Ok(followers);
        }

        [HttpGet("following/{userId}")]
        public async Task<IActionResult> GetUserFollowing(int userId)
        {
            var following = await _userFollowService.GetFollowingAsync(userId);
            return Ok(following);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetMyFollowStats()
        {
            var currentUserId = GetCurrentUserId();
            var followerCount = await _userFollowService.GetFollowerCountAsync(currentUserId);
            var followingCount = await _userFollowService.GetFollowingCountAsync(currentUserId);
            
            return Ok(new { followerCount, followingCount });
        }

        [HttpGet("stats/{userId}")]
        public async Task<IActionResult> GetUserFollowStats(int userId)
        {
            var followerCount = await _userFollowService.GetFollowerCountAsync(userId);
            var followingCount = await _userFollowService.GetFollowingCountAsync(userId);
            
            return Ok(new { followerCount, followingCount });
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
}
