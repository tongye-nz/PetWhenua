using PetWhenua.Models;

namespace PetWhenua.Services
{
    public interface IImageService
    {
        Task<List<string>> UploadImagesAsync(List<IFormFile> files, int userId, int? postId = null);
        Task<string> UploadImageAsync(IFormFile file, int userId, int? postId = null);
        Task<bool> DeleteImageAsync(string imageUrl);
        Task<bool> DeleteImagesAsync(List<string> imageUrls);
        Task<byte[]> CompressImageAsync(byte[] imageBytes, int maxWidth = 1200, int maxHeight = 800, int quality = 85);
        string GenerateUniqueFileName(string originalFileName, int userId, int? postId = null);
        bool IsValidImageFile(IFormFile file);
        Task<PostImage> SaveImageMetadataAsync(string fileName, string originalFileName, long fileSize, int width, int height, int userId, int postId);
        Task<bool> DeleteImageMetadataAsync(string fileName);
        string GetImageUrl(string fileName);
        Task<bool> ImageExistsAsync(string fileName);
        
        // Profile picture specific methods
        Task<string> UploadUserProfilePictureAsync(IFormFile file, int userId);
        Task<string> UploadPetProfilePictureAsync(IFormFile file, int userId, int petId);
        Task<bool> DeleteProfilePictureAsync(string imageUrl);
    }
}
