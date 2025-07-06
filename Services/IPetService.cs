namespace PetWhenua.Services
{
    public interface IPetService
    {
        Task<IEnumerable<Pet>> GetPetsAsync(bool includeUser = false, int? userId = null);
        Task<Pet?> GetPetByIdAsync(int id, bool includeUser = false);
        Task<Pet> CreatePetAsync(Pet pet);
        Task<Pet> CreatePetAsync(int userId, string name, string? species = null, string? breed = null, int age = 0);
        Task<Pet> CreatePetWithDetailsAsync(int userId, string name, string? species, string? breed, int age, string? gender, string? description, string? profilePicture);
        Task<Pet> UpdatePetAsync(Pet pet);
        Task<bool> DeletePetAsync(int id);
        Task<IEnumerable<Pet>> GetPetsByUserAsync(int userId);
        Task<IEnumerable<Pet>> GetPetsBySpeciesAsync(string species);
        Task<bool> PetExistsAsync(int id);
    }
}
