namespace PetWhenua.Services.Abstract
{
    public interface IPetConnectionService
    {
        Task<PetConnection> RequestConnectionAsync(int requesterId, int pet1Id, int pet2Id, string? message = null);
        Task<PetConnection> RespondToConnectionAsync(int connectionId, int responderId, PetConnectionStatus response, string? message = null);
        Task<IEnumerable<PetConnection>> GetPendingConnectionsForUserAsync(int userId);
        Task<IEnumerable<Pet>> GetConnectedPetsAsync(int petId);
        Task<IEnumerable<Pet>> GetAvailablePetsForConnectionAsync(int userId, int petId);
        Task<bool> ArePetsConnectedAsync(int pet1Id, int pet2Id);
        Task<PetConnection?> GetConnectionAsync(int pet1Id, int pet2Id);
    }
}
