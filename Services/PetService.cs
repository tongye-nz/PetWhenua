using Microsoft.EntityFrameworkCore;

namespace PetWhenua.Services
{
    public class PetService : IPetService
    {
        private readonly AppDbContext _context;

        public PetService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pet>> GetPetsAsync(bool includeUser = false, int? userId = null)
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

            return await query.OrderBy(p => p.Name).ToListAsync();
        }

        public async Task<Pet?> GetPetByIdAsync(int id, bool includeUser = false)
        {
            var query = _context.Pets.AsQueryable();

            if (includeUser)
            {
                query = query.Include(p => p.User);
            }

            return await query.FirstOrDefaultAsync(p => p.PetId == id);
        }

        public async Task<Pet> CreatePetAsync(Pet pet)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserId == pet.UserId);
            if (!userExists)
            {
                throw new InvalidOperationException("Invalid UserId. User does not exist.");
            }

            pet.CreatedAt = DateTime.UtcNow;
            pet.UpdatedAt = DateTime.UtcNow;

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            return pet;
        }

        public async Task<Pet> UpdatePetAsync(Pet pet)
        {
            var existingPet = await _context.Pets.FindAsync(pet.PetId);
            if (existingPet == null)
            {
                throw new InvalidOperationException($"Pet with ID {pet.PetId} not found.");
            }

            // Validate user exists if UserId is being changed
            if (existingPet.UserId != pet.UserId)
            {
                var userExists = await _context.Users.AnyAsync(u => u.UserId == pet.UserId);
                if (!userExists)
                {
                    throw new InvalidOperationException("Invalid UserId. User does not exist.");
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

            await _context.SaveChangesAsync();
            return existingPet;
        }

        public async Task<bool> DeletePetAsync(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            if (pet == null)
            {
                return false;
            }

            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Pet>> GetPetsByUserAsync(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
            if (!userExists)
            {
                throw new InvalidOperationException($"User with ID {userId} not found.");
            }

            return await _context.Pets
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pet>> GetPetsBySpeciesAsync(string species)
        {
            return await _context.Pets
                .Include(p => p.User)
                .Where(p => p.Species != null && p.Species.ToLower() == species.ToLower())
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<bool> PetExistsAsync(int id)
        {
            return await _context.Pets.AnyAsync(p => p.PetId == id);
        }
    }
}
