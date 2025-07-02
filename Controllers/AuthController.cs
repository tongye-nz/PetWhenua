using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetWhenua.Models.Dtos;
using PetWhenua.Services;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;

        public AuthController(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if username already exists
            var existingUsername = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == request.Username.ToLower());
            if (existingUsername)
            {
                return BadRequest("Username already exists.");
            }

            // Check if email already exists
            var existingEmail = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (existingEmail)
            {
                return BadRequest("Email already exists.");
            }

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _authService.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Location = request.Location,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Role = "member"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            var userDto = _authService.MapToUserDto(user);

            var response = new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddDays(1), // 24 hours
                User = userDto
            };

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find user by username or email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => 
                    u.Username.ToLower() == request.UsernameOrEmail.ToLower() ||
                    u.Email.ToLower() == request.UsernameOrEmail.ToLower());

            if (user == null)
            {
                return Unauthorized("Invalid username/email or password.");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized("Account is deactivated. Please contact support.");
            }

            // Verify password
            if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid username/email or password.");
            }

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);
            var userDto = _authService.MapToUserDto(user);

            var response = new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddDays(1), // 24 hours
                User = userDto
            };

            return Ok(response);
        }

        [HttpPost("verify-token")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> VerifyToken()
        {
            // This endpoint can be used to verify if the current token is valid
            // The JWT middleware will handle token validation
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid token.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
            {
                return Unauthorized("User not found or inactive.");
            }

            var userDto = _authService.MapToUserDto(user);
            return Ok(userDto);
        }
    }
} 