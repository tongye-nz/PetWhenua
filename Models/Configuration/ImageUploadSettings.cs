namespace PetWhenua.Models.Configuration
{
    public class ImageUploadSettings
    {
        public int MaxFileSize { get; set; } = 5242880; // 5MB
        public int TargetFileSize { get; set; } = 2097152; // 2MB target after compression
        public int MaxImagesPerPost { get; set; } = 9;
        public List<string> AllowedExtensions { get; set; } = new() { ".jpg", ".jpeg", ".png", ".webp" };
        public int CompressionQuality { get; set; } = 75;
        public int MaxWidth { get; set; } = 1000;
        public int MaxHeight { get; set; } = 667;
        public string UploadPath { get; set; } = "wwwroot/uploads/posts";
    }
}
