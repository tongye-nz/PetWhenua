namespace PetWhenua.Services.Repositories
{
    public interface IPetRepository
    {
        Task<IEnumerable<Pet>> GetAllPetsAsync(bool includeUser = false, int? userId = null);
        Task<Pet?> GetPetByIdAsync(int id, bool includeUser = false);
        Task<Pet> AddPetAsync(Pet pet);
        Task<Pet> UpdatePetAsync(Pet pet);
        Task<bool> DeletePetAsync(int id);
        Task<IEnumerable<Pet>> GetPetsByUserAsync(int userId);
        Task<IEnumerable<Pet>> GetPetsBySpeciesAsync(string species);
        Task<bool> PetExistsAsync(int id);
        Task<bool> UserExistsAsync(int userId);
    }
}
