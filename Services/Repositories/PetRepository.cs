using Microsoft.EntityFrameworkCore;

namespace PetWhenua.Services.Repositories
{
    public class PetRepository : IPetRepository
    {
        private readonly AppDbContext _context;

        public PetRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pet>> GetAllPetsAsync(bool includeUser = false, int? userId = null)
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

        public async Task<Pet> AddPetAsync(Pet pet)
        {
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();
            return pet;
        }

        public async Task<Pet> UpdatePetAsync(Pet pet)
        {
            _context.Pets.Update(pet);
            await _context.SaveChangesAsync();
            return pet;
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

        public async Task<bool> UserExistsAsync(int userId)
        {
            return await _context.Users.AnyAsync(u => u.UserId == userId);
        }
    }
}
