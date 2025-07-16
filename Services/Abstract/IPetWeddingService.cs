namespace PetWhenua.Services.Abstract
{
    public interface IPetWeddingService
    {
        Task<Post> CreatePetWeddingAsync(int userId, string title, string content, List<int> petIds, 
            string location, string address, DateTime eventDate, List<string>? images = null, string? category = null);
        Task<bool> ApprovePetWeddingParticipationAsync(int postId, int userId);
        Task<IEnumerable<Post>> GetPendingWeddingApprovalsForUserAsync(int userId);
        Task<bool> CanUserSelectPetForWeddingAsync(int userId, int petId);
        Task<IEnumerable<Pet>> GetSelectablePetsForWeddingAsync(int userId);
        Task<Post> UpdateWeddingStatusBasedOnApprovalsAsync(int postId);
    }
}
