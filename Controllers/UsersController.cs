using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] bool includePets = false, [FromQuery] bool includePosts = false)
    {
        var users = await _userService.GetUsersAsync(includePets, includePosts);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id, [FromQuery] bool includePets = false, [FromQuery] bool includePosts = false)
    {
        var user = await _userService.GetUserByIdAsync(id, includePets, includePosts);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        return Ok(user);
    }

    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetUserByUsername(string username)
    {
        var user = await _userService.GetUserByUsernameAsync(username);

        if (user == null)
        {
            return NotFound($"User with username '{username}' not found.");
        }

        return Ok(user);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        var user = await _userService.GetUserByEmailAsync(email);

        if (user == null)
        {
            return NotFound($"User with email '{email}' not found.");
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        try
        {
            var createdUser = await _userService.CreateUserAsync(user);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, createdUser);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.UserId)
        {
            return BadRequest("User ID mismatch.");
        }

        try
        {
            var updatedUser = await _userService.UpdateUserAsync(user);
            return Ok(updatedUser);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _userService.DeleteUserAsync(id);
        
        if (!deleted)
        {
            return NotFound($"User with ID {id} not found.");
        }

        return NoContent();
    }

    [HttpGet("{id}/pets")]
    public async Task<IActionResult> GetUserPets(int id)
    {
        var userExists = await _userService.UserExistsAsync(id);
        if (!userExists)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var user = await _userService.GetUserByIdAsync(id, includePets: true);
        return Ok(user?.Pets ?? new List<Pet>());
    }

    [HttpGet("{id}/posts")]
    public async Task<IActionResult> GetUserPosts(int id)
    {
        var userExists = await _userService.UserExistsAsync(id);
        if (!userExists)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var user = await _userService.GetUserByIdAsync(id, includePosts: true);
        return Ok(user?.Posts ?? new List<Post>());
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        try
        {
            var deactivatedUser = await _userService.DeactivateUserAsync(id);
            return Ok(deactivatedUser);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        try
        {
            var activatedUser = await _userService.ActivateUserAsync(id);
            return Ok(activatedUser);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q, [FromQuery] int limit = 10)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
        {
            return BadRequest("Search query must be at least 2 characters long.");
        }

        try
        {
            var users = await _userService.SearchUsersAsync(q, limit);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to search users", error = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(user);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserProfileDto updateDto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        try
        {
            // Get the existing user
            var existingUser = await _userService.GetUserByIdAsync(userId);
            if (existingUser == null)
            {
                return NotFound("User not found.");
            }

            // Update only the provided fields
            if (updateDto.FirstName != null) existingUser.FirstName = updateDto.FirstName;
            if (updateDto.LastName != null) existingUser.LastName = updateDto.LastName;
            if (updateDto.Email != null) existingUser.Email = updateDto.Email;
            if (updateDto.Bio != null) existingUser.Bio = updateDto.Bio;
            if (updateDto.Location != null) existingUser.Location = updateDto.Location;
            if (updateDto.PhoneNumber != null) existingUser.PhoneNumber = updateDto.PhoneNumber;
            if (updateDto.ProfilePicture != null) existingUser.ProfilePicture = updateDto.ProfilePicture;

            var user = await _userService.UpdateUserAsync(existingUser);
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Admin endpoints - require site admin authorization
    [HttpGet("admin")]
    [Authorize]
    public async Task<IActionResult> GetUsersForAdmin()
    {
        // Check if current user is a site admin
        var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userRoleClaim) || !UserRoles.IsAdmin(userRoleClaim))
        {
            return Forbid("Only site administrators can access user management.");
        }

        try
        {
            var users = await _userService.GetUsersForAdminAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve users for admin", error = ex.Message });
        }
    }

    [HttpPatch("admin/{id}/role")]
    [Authorize]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleRequest request)
    {
        // Check if current user is a site admin
        var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userRoleClaim) || !UserRoles.IsAdmin(userRoleClaim))
        {
            return Forbid("Only site administrators can update user roles.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _userService.UpdateUserRoleAsync(id, request.Role);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update user role", error = ex.Message });
        }
    }

    [HttpPatch("admin/{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        // Check if current user is a site admin
        var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userRoleClaim) || !UserRoles.IsAdmin(userRoleClaim))
        {
            return Forbid("Only site administrators can update user status.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var response = await _userService.UpdateUserStatusAsync(id, request.IsActive);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update user status", error = ex.Message });
        }
    }

    [HttpGet("admin/roles")]
    [Authorize]
    public IActionResult GetAvailableRoles()
    {
        // Check if current user is a site admin
        var userRoleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userRoleClaim) || !UserRoles.IsAdmin(userRoleClaim))
        {
            return Forbid("Only site administrators can access role information.");
        }

        var roles = UserRoles.AllRoles.Select(role => new
        {
            value = role,
            label = UserRoles.GetDisplayName(role),
            description = GetRoleDescription(role)
        }).ToList();

        return Ok(roles);
    }

    private static string GetRoleDescription(string role)
    {
        return role switch
        {
            UserRoles.Member => "Standard user with basic permissions",
            UserRoles.Vet => "Veterinarian with access to create Library posts",
            UserRoles.MeetupAdmin => "Administrator for meetup posts and events",
            UserRoles.SiteAdmin => "Full administrator with all permissions",
            _ => "Unknown role"
        };
    }
}