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
    public async Task<IActionResult> GetPets()
    {
        var pets = await _context.Pets.ToListAsync();
        return Ok(pets);
    }

    [HttpPost]
    public async Task<IActionResult> AddPet(Pet pet)
    {
        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPets), new { id = pet.Id }, pet);
    }
}