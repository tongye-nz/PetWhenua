using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    public class PetService : IPetService
    {
        private readonly IPetRepository _petRepository;
        private readonly IPetFactory _petFactory;

        public PetService(IPetRepository petRepository, IPetFactory petFactory)
        {
            _petRepository = petRepository;
            _petFactory = petFactory;
        }

        public async Task<IEnumerable<Pet>> GetPetsAsync(bool includeUser = false, int? userId = null)
        {
            return await _petRepository.GetAllPetsAsync(includeUser, userId);
        }

        public async Task<Pet?> GetPetByIdAsync(int id, bool includeUser = false)
        {
            return await _petRepository.GetPetByIdAsync(id, includeUser);
        }

        public async Task<Pet> CreatePetAsync(Pet pet)
        {
            // Validate user exists
            if (!await _petRepository.UserExistsAsync(pet.UserId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Validate pet using factory
            _petFactory.ValidatePetForCreation(pet);

            // Set timestamps
            pet.CreatedAt = DateTime.UtcNow;
            pet.UpdatedAt = DateTime.UtcNow;

            return await _petRepository.AddPetAsync(pet);
        }

        public async Task<Pet> CreatePetAsync(int userId, string name, string? species = null, string? breed = null, int age = 0)
        {
            // Validate user exists
            if (!await _petRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Create pet using factory
            var pet = _petFactory.CreatePet(userId, name, species, breed, age);

            return await _petRepository.AddPetAsync(pet);
        }

        public async Task<Pet> CreatePetWithDetailsAsync(int userId, string name, string? species, string? breed, int age, string? gender, string? description, string? profilePicture)
        {
            // Validate user exists
            if (!await _petRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Create pet using factory
            var pet = _petFactory.CreatePetWithDetails(userId, name, species, breed, age, gender, description, profilePicture);

            return await _petRepository.AddPetAsync(pet);
        }

        public async Task<Pet> UpdatePetAsync(Pet pet)
        {
            var existingPet = await _petRepository.GetPetByIdAsync(pet.PetId);
            if (existingPet == null)
            {
                throw new InvalidOperationException($"Pet with ID {pet.PetId} not found.");
            }

            // Validate user exists if UserId is being changed
            if (existingPet.UserId != pet.UserId && !await _petRepository.UserExistsAsync(pet.UserId))
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            // Use factory to create updated pet
            var updatedPet = _petFactory.CreatePetFromExisting(existingPet, pet);

            return await _petRepository.UpdatePetAsync(updatedPet);
        }

        public async Task<bool> DeletePetAsync(int id)
        {
            return await _petRepository.DeletePetAsync(id);
        }

        public async Task<IEnumerable<Pet>> GetPetsByUserAsync(int userId)
        {
            if (!await _petRepository.UserExistsAsync(userId))
            {
                throw new InvalidOperationException($"User with ID {userId} not found.");
            }

            return await _petRepository.GetPetsByUserAsync(userId);
        }

        public async Task<IEnumerable<Pet>> GetPetsBySpeciesAsync(string species)
        {
            return await _petRepository.GetPetsBySpeciesAsync(species);
        }

        public async Task<bool> PetExistsAsync(int id)
        {
            return await _petRepository.PetExistsAsync(id);
        }
    }
}
