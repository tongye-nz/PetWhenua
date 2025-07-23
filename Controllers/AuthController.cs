using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PetWhenua.Models.Dtos;
using PetWhenua.Services;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("verify-token")]
        [Authorize]
        public async Task<IActionResult> VerifyToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("Invalid token.");
            }

            var user = await _authService.GetUserByTokenAsync(userIdClaim);
            if (user == null)
            {
                return Unauthorized("User not found or inactive.");
            }

            var userDto = _authService.MapToUserDto(user);
            return Ok(userDto);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Get current user ID from token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Invalid user token.");
                }

                // Change password
                var success = await _authService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);

                if (success)
                {
                    var response = new ChangePasswordResponseDto
                    {
                        Success = true,
                        Message = "Password changed successfully.",
                        ChangedAt = DateTime.UtcNow
                    };
                    return Ok(response);
                }

                return BadRequest("Failed to change password.");
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "An unexpected error occurred. Please try again."
                });
            }
        }


    }
} 