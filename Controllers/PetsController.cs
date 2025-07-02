using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PetsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets([FromQuery] bool includeUser = false, [FromQuery] int? userId = null)
    {
        var query = _context.Pets.AsQueryable();

        if (includeUser)
        {
            query = query.Include(p => p.User);
        }

        if (userId.HasValue)
        {
            query = query.Where(p => p.UserId == userId.Value);
        }

        var pets = await query.OrderBy(p => p.Name).ToListAsync();
        return Ok(pets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPet(int id, [FromQuery] bool includeUser = false)
    {
        var query = _context.Pets.AsQueryable();

        if (includeUser)
        {
            query = query.Include(p => p.User);
        }

        var pet = await query.FirstOrDefaultAsync(p => p.PetId == id);

        if (pet == null)
        {
            return NotFound($"Pet with ID {id} not found.");
        }

        return Ok(pet);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePet(Pet pet)
    {
        // Validate user exists
        var userExists = await _context.Users.AnyAsync(u => u.UserId == pet.UserId);
        if (!userExists)
        {
            return BadRequest("Invalid UserId. User does not exist.");
        }

        pet.CreatedAt = DateTime.UtcNow;
        pet.UpdatedAt = DateTime.UtcNow;

        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPet), new { id = pet.PetId }, pet);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePet(int id, Pet pet)
    {
        if (id != pet.PetId)
        {
            return BadRequest("Pet ID mismatch.");
        }

        var existingPet = await _context.Pets.FindAsync(id);
        if (existingPet == null)
        {
            return NotFound($"Pet with ID {id} not found.");
        }

        // Validate user exists if UserId is being changed
        if (existingPet.UserId != pet.UserId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == pet.UserId);
            if (!userExists)
            {
                return BadRequest("Invalid UserId. User does not exist.");
            }
        }

        // Update properties
        existingPet.UserId = pet.UserId;
        existingPet.Name = pet.Name;
        existingPet.Species = pet.Species;
        existingPet.Breed = pet.Breed;
        existingPet.Age = pet.Age;
        existingPet.Gender = pet.Gender;
        existingPet.Description = pet.Description;
        existingPet.ProfilePicture = pet.ProfilePicture;
        existingPet.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await PetExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        var pet = await _context.Pets.FindAsync(id);
        if (pet == null)
        {
            return NotFound($"Pet with ID {id} not found.");
        }

        _context.Pets.Remove(pet);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPetsByUser(int userId)
    {
        var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
        if (!userExists)
        {
            return NotFound($"User with ID {userId} not found.");
        }

        var pets = await _context.Pets
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Ok(pets);
    }

    [HttpGet("species/{species}")]
    public async Task<IActionResult> GetPetsBySpecies(string species)
    {
        var pets = await _context.Pets
            .Include(p => p.User)
            .Where(p => p.Species != null && p.Species.ToLower() == species.ToLower())
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Ok(pets);
    }

    private async Task<bool> PetExists(int id)
    {
        return await _context.Pets.AnyAsync(e => e.PetId == id);
    }
}