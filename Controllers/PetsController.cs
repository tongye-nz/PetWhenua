using Microsoft.AspNetCore.Mvc;
using PetWhenua.Services;

[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets([FromQuery] bool includeUser = false, [FromQuery] int? userId = null)
    {
        var pets = await _petService.GetPetsAsync(includeUser, userId);
        return Ok(pets);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPet(int id, [FromQuery] bool includeUser = false)
    {
        var pet = await _petService.GetPetByIdAsync(id, includeUser);

        if (pet == null)
        {
            return NotFound($"Pet with ID {id} not found.");
        }

        return Ok(pet);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePet(Pet pet)
    {
        try
        {
            var createdPet = await _petService.CreatePetAsync(pet);
            return CreatedAtAction(nameof(GetPet), new { id = createdPet.PetId }, createdPet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePet(int id, Pet pet)
    {
        if (id != pet.PetId)
        {
            return BadRequest("Pet ID mismatch.");
        }

        try
        {
            await _petService.UpdatePetAsync(pet);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        var deleted = await _petService.DeletePetAsync(id);
        
        if (!deleted)
        {
            return NotFound($"Pet with ID {id} not found.");
        }

        return NoContent();
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetPetsByUser(int userId)
    {
        try
        {
            var pets = await _petService.GetPetsByUserAsync(userId);
            return Ok(pets);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("species/{species}")]
    public async Task<IActionResult> GetPetsBySpecies(string species)
    {
        var pets = await _petService.GetPetsBySpeciesAsync(species);
        return Ok(pets);
    }
}