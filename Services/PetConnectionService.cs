using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Abstract;

namespace PetWhenua.Services
{
    public class PetConnectionService : IPetConnectionService
    {
        private readonly AppDbContext _context;

        public PetConnectionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PetConnection> RequestConnectionAsync(int requesterId, int pet1Id, int pet2Id, string? message = null)
        {
            if (pet1Id == pet2Id)
                throw new InvalidOperationException("Pets cannot connect to themselves");

            // Ensure both pets exist
            var pet1 = await _context.Pets.FindAsync(pet1Id);
            var pet2 = await _context.Pets.FindAsync(pet2Id);

            if (pet1 == null || pet2 == null)
                throw new InvalidOperationException("One or both pets not found");

            // Check if requester owns at least one of the pets
            if (pet1.UserId != requesterId && pet2.UserId != requesterId)
                throw new InvalidOperationException("You can only request connections for your own pets");

            // Normalize pet order (smaller ID first)
            var (firstPetId, secondPetId) = pet1Id < pet2Id ? (pet1Id, pet2Id) : (pet2Id, pet1Id);

            // Check for existing connection
            var existingConnection = await _context.PetConnections
                .FirstOrDefaultAsync(pc => pc.Pet1Id == firstPetId && pc.Pet2Id == secondPetId);

            if (existingConnection != null)
            {
                // Only prevent new requests if connection is Pending or Accepted
                // Allow new requests if previous was Rejected or Blocked
                if (existingConnection.Status == PetConnectionStatus.Pending)
                {
                    throw new InvalidOperationException("A connection request is already pending between these pets");
                }
                else if (existingConnection.Status == PetConnectionStatus.Accepted)
                {
                    throw new InvalidOperationException("These pets are already connected");
                }
                
                // If existing connection was Rejected or Blocked, delete it and allow new request
                _context.PetConnections.Remove(existingConnection);
            }

            var connection = new PetConnection
            {
                Pet1Id = firstPetId,
                Pet2Id = secondPetId,
                RequestedById = requesterId,
                Status = PetConnectionStatus.Pending,
                RequestMessage = message,
                RequestedAt = DateTime.UtcNow
            };

            _context.PetConnections.Add(connection);
            await _context.SaveChangesAsync();

            return connection;
        }

        public async Task<PetConnection> RespondToConnectionAsync(int connectionId, int responderId, PetConnectionStatus response, string? message = null)
        {
            var connection = await _context.PetConnections
                .Include(pc => pc.Pet1)
                .Include(pc => pc.Pet2)
                .FirstOrDefaultAsync(pc => pc.PetConnectionId == connectionId);

            if (connection == null)
                throw new InvalidOperationException("Connection not found");

            if (connection.Status != PetConnectionStatus.Pending)
                throw new InvalidOperationException($"Connection is already {connection.Status}");

            // Check if responder owns the other pet
            var otherPetOwnerId = connection.Pet1.UserId == connection.RequestedById 
                ? connection.Pet2.UserId 
                : connection.Pet1.UserId;

            if (otherPetOwnerId != responderId)
                throw new InvalidOperationException("You can only respond to connections involving your pets");

            connection.Status = response;
            connection.RespondedAt = DateTime.UtcNow;
            connection.ResponseMessage = message;

            await _context.SaveChangesAsync();

            return connection;
        }

        public async Task<IEnumerable<PetConnection>> GetPendingConnectionsForUserAsync(int userId)
        {
            return await _context.PetConnections
                .Include(pc => pc.Pet1)
                .Include(pc => pc.Pet2)
                .Include(pc => pc.RequestedBy)
                .Where(pc => pc.Status == PetConnectionStatus.Pending &&
                           (pc.Pet1.UserId == userId || pc.Pet2.UserId == userId) &&
                           pc.RequestedById != userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Pet>> GetConnectedPetsAsync(int petId)
        {
            var connections = await _context.PetConnections
                .Include(pc => pc.Pet1)
                .Include(pc => pc.Pet2)
                .Where(pc => pc.Status == PetConnectionStatus.Accepted &&
                           (pc.Pet1Id == petId || pc.Pet2Id == petId))
                .ToListAsync();

            return connections.Select(pc => pc.Pet1Id == petId ? pc.Pet2 : pc.Pet1).ToList();
        }

        public async Task<IEnumerable<Pet>> GetAvailablePetsForConnectionAsync(int userId, int petId)
        {
            // Get user's following list
            var followingUserIds = await _context.UserFollows
                .Where(uf => uf.FollowerId == userId)
                .Select(uf => uf.FollowingId)
                .ToListAsync();

            // Get pets from followed users that are not already connected
            var connectedPetIds = await _context.PetConnections
                .Where(pc => pc.Status == PetConnectionStatus.Accepted &&
                           (pc.Pet1Id == petId || pc.Pet2Id == petId))
                .Select(pc => pc.Pet1Id == petId ? pc.Pet2Id : pc.Pet1Id)
                .ToListAsync();

            return await _context.Pets
                .Where(p => followingUserIds.Contains(p.UserId) &&
                           p.PetId != petId &&
                           !connectedPetIds.Contains(p.PetId))
                .Include(p => p.User)
                .ToListAsync();
        }

        public async Task<bool> ArePetsConnectedAsync(int pet1Id, int pet2Id)
        {
            var (firstPetId, secondPetId) = pet1Id < pet2Id ? (pet1Id, pet2Id) : (pet2Id, pet1Id);

            return await _context.PetConnections
                .AnyAsync(pc => pc.Pet1Id == firstPetId && 
                               pc.Pet2Id == secondPetId && 
                               pc.Status == PetConnectionStatus.Accepted);
        }

        public async Task<PetConnection?> GetConnectionAsync(int pet1Id, int pet2Id)
        {
            var (firstPetId, secondPetId) = pet1Id < pet2Id ? (pet1Id, pet2Id) : (pet2Id, pet1Id);

            return await _context.PetConnections
                .Include(pc => pc.Pet1)
                .Include(pc => pc.Pet2)
                .Include(pc => pc.RequestedBy)
                .FirstOrDefaultAsync(pc => pc.Pet1Id == firstPetId && pc.Pet2Id == secondPetId);
        }
    }
}
