namespace PetWhenua.Services.Abstract
{
    public interface IMockDataService
    {
        Task<bool> SeedMockDataAsync(bool forceRecreate = false);
        Task ClearAllDataAsync();
        Task<MockDataSummary> GetMockDataSummaryAsync();
        Task<bool> DatabaseHasDataAsync();
        Task SeedUsersAsync();
        Task SeedPetsAsync();
        Task SeedPostsAsync();
        Task SeedCommentsAsync();
        Task SeedLocalRelationshipsAsync();
    }

    public class MockDataSummary
    {
        public int UserCount { get; set; }
        public int PetCount { get; set; }
        public int PostCount { get; set; }
        public int CommentCount { get; set; }
        public int FollowCount { get; set; }
        public int PetConnectionCount { get; set; }
        public List<string> LocationsWithUsers { get; set; } = new();
        public Dictionary<string, int> UsersByRole { get; set; } = new();
        public Dictionary<string, int> PostsByType { get; set; } = new();
        public DateTime? LastSeededAt { get; set; }
    }
} 