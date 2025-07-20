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
        
        // Profile picture specific settings
        public int ProfilePictureMaxFileSize { get; set; } = 2097152; // 2MB for profile pictures
        public int UserProfilePictureSize { get; set; } = 300; // 300x300 for users
        public int PetProfilePictureSize { get; set; } = 250; // 250x250 for pets
        public string UserProfilePicturePath { get; set; } = "wwwroot/uploads/profiles/users";
        public string PetProfilePicturePath { get; set; } = "wwwroot/uploads/profiles/pets";
        public int ProfilePictureCompressionQuality { get; set; } = 85; // Higher quality for profile pics
    }
}
