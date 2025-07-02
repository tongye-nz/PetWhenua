using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] bool includePets = false, [FromQuery] bool includePosts = false)
    {
        var query = _context.Users.AsQueryable();

        if (includePets)
        {
            query = query.Include(u => u.Pets);
        }

        if (includePosts)
        {
            query = query.Include(u => u.Posts);
        }

        var users = await query.OrderBy(u => u.Username).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id, [FromQuery] bool includePets = false, [FromQuery] bool includePosts = false)
    {
        var query = _context.Users.AsQueryable();

        if (includePets)
        {
            query = query.Include(u => u.Pets);
        }

        if (includePosts)
        {
            query = query.Include(u => u.Posts);
        }

        var user = await query.FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        return Ok(user);
    }

    [HttpGet("username/{username}")]
    public async Task<IActionResult> GetUserByUsername(string username)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
        {
            return NotFound($"User with username '{username}' not found.");
        }

        return Ok(user);
    }

    [HttpGet("email/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return NotFound($"User with email '{email}' not found.");
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(User user)
    {
        // Check if username already exists
        var existingUsername = await _context.Users
            .AnyAsync(u => u.Username == user.Username);
        if (existingUsername)
        {
            return BadRequest("Username already exists.");
        }

        // Check if email already exists
        var existingEmail = await _context.Users
            .AnyAsync(u => u.Email == user.Email);
        if (existingEmail)
        {
            return BadRequest("Email already exists.");
        }

        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.UserId)
        {
            return BadRequest("User ID mismatch.");
        }

        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        // Check if username is being changed and if it already exists
        if (existingUser.Username != user.Username)
        {
            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username == user.Username && u.UserId != id);
            if (usernameExists)
            {
                return BadRequest("Username already exists.");
            }
        }

        // Check if email is being changed and if it already exists
        if (existingUser.Email != user.Email)
        {
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == user.Email && u.UserId != id);
            if (emailExists)
            {
                return BadRequest("Email already exists.");
            }
        }

        // Update properties
        existingUser.Username = user.Username;
        existingUser.Email = user.Email;
        existingUser.PasswordHash = user.PasswordHash;
        existingUser.FirstName = user.FirstName;
        existingUser.LastName = user.LastName;
        existingUser.ProfilePicture = user.ProfilePicture;
        existingUser.Bio = user.Bio;
        existingUser.Location = user.Location;
        existingUser.PhoneNumber = user.PhoneNumber;
        existingUser.IsActive = user.IsActive;
        existingUser.Role = user.Role;
        existingUser.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await UserExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id}/pets")]
    public async Task<IActionResult> GetUserPets(int id)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == id);
        if (!userExists)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var pets = await _context.Pets
            .Where(p => p.UserId == id)
            .ToListAsync();

        return Ok(pets);
    }

    [HttpGet("{id}/posts")]
    public async Task<IActionResult> GetUserPosts(int id)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == id);
        if (!userExists)
        {
            return NotFound($"User with ID {id} not found.");
        }

        var posts = await _context.Posts
            .Where(p => p.UserId == id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(posts);
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound($"User with ID {id} not found.");
        }

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> UserExists(int id)
    {
        return await _context.Users.AnyAsync(e => e.UserId == id);
    }
} 