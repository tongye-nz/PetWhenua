using Microsoft.EntityFrameworkCore;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Repositories.Concrete
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

            // Manual cleanup for NoAction foreign keys to avoid constraint violations
            
            // First, get all PetConnections that will be affected (both Pet1 and Pet2)
            var allRelatedConnections = await _context.PetConnections
                .Where(pc => pc.Pet1Id == id || pc.Pet2Id == id)
                .Select(pc => pc.PetConnectionId)
                .ToListAsync();

            // Remove Notifications that reference these PetConnections
            var relatedNotifications = await _context.Notifications
                .Where(n => n.RelatedConnectionId.HasValue && allRelatedConnections.Contains(n.RelatedConnectionId.Value))
                .ToListAsync();
            _context.Notifications.RemoveRange(relatedNotifications);

            // Remove PetConnections where this pet is Pet2 (Pet1 will be handled by CASCADE)
            var petConnectionsAsPet2 = await _context.PetConnections
                .Where(pc => pc.Pet2Id == id)
                .ToListAsync();
            _context.PetConnections.RemoveRange(petConnectionsAsPet2);

            // Remove PetWeddingParticipants where this pet is involved
            var petWeddingParticipants = await _context.PetWeddingParticipants
                .Where(pwp => pwp.PetId == id)
                .ToListAsync();
            _context.PetWeddingParticipants.RemoveRange(petWeddingParticipants);

            // Now safe to delete the pet (Pet1 connections will CASCADE automatically)
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
