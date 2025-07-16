namespace PetWhenua.Models.Dtos
{
    public class CreatePostWithImagesRequest
    {
        public int UserId { get; set; }
        public string UserRole { get; set; } = string.Empty;
        public PostType PostType { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<IFormFile>? Images { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }
        public decimal? Price { get; set; }
        public DateTime? EventDate { get; set; }
        public string? Category { get; set; }
        public List<int>? SelectedPetIds { get; set; }
    }

    public class ImageUploadResult
    {
        public bool Success { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public string? ErrorMessage { get; set; }
        public int UploadedCount { get; set; }
    }

    public class ImageValidationResult
    {
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
        public long FileSize { get; set; }
        public string? FileName { get; set; }
    }
}
