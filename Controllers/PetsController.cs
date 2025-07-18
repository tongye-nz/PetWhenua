using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;
    private readonly IImageService _imageService;

    public PetsController(IPetService petService, IImageService imageService)
    {
        _petService = petService;
        _imageService = imageService;
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

    [HttpPost("{id}/profile-picture")]
    [Authorize]
    public async Task<IActionResult> UploadPetProfilePicture(int id, [FromForm] IFormFile file)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("Invalid user token.");
        }

        try
        {
            // Verify the pet belongs to the current user
            var pet = await _petService.GetPetByIdAsync(id);
            if (pet == null)
            {
                return NotFound($"Pet with ID {id} not found.");
            }

            if (pet.UserId != userId)
            {
                return Forbid("You can only upload profile pictures for your own pets.");
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided.");
            }

            var imageUrl = await _imageService.UploadPetProfilePictureAsync(file, userId, id);
            
            // Update pet's profile picture in database
            pet.ProfilePicture = imageUrl;
            await _petService.UpdatePetAsync(pet);

            return Ok(new { profilePicture = imageUrl });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to upload pet profile picture: {ex.Message}");
        }
    }
}