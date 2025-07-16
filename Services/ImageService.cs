using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PetWhenua.Models;
using PetWhenua.Models.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace PetWhenua.Services
{
    public class ImageService : IImageService
    {
        private readonly AppDbContext _context;
        private readonly ImageUploadSettings _settings;
        private readonly ILogger<ImageService> _logger;

        public ImageService(AppDbContext context, IOptions<ImageUploadSettings> settings, ILogger<ImageService> logger)
        {
            _context = context;
            _settings = settings.Value;
            _logger = logger;
            
            // Ensure upload directory exists
            EnsureUploadDirectoryExists();
        }

        public async Task<List<string>> UploadImagesAsync(List<IFormFile> files, int userId, int? postId = null)
        {
            var uploadedImages = new List<string>();

            if (files.Count > _settings.MaxImagesPerPost)
            {
                throw new InvalidOperationException($"Maximum {_settings.MaxImagesPerPost} images allowed per post.");
            }

            foreach (var file in files)
            {
                try
                {
                    var imageUrl = await UploadImageAsync(file, userId, postId);
                    uploadedImages.Add(imageUrl);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to upload image {FileName} for user {UserId}", file.FileName, userId);
                    
                    // Clean up any already uploaded images on failure
                    await DeleteImagesAsync(uploadedImages);
                    throw;
                }
            }

            return uploadedImages;
        }

        public async Task<string> UploadImageAsync(IFormFile file, int userId, int? postId = null)
        {
            if (!IsValidImageFile(file))
            {
                throw new InvalidOperationException("Invalid image file.");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var imageBytes = memoryStream.ToArray();

            // Compress image
            var compressedBytes = await CompressImageAsync(imageBytes);
            
            // Generate unique filename
            var fileName = GenerateUniqueFileName(file.FileName, userId, postId);
            var filePath = GetFullFilePath(fileName);

            // Save compressed image to disk
            await File.WriteAllBytesAsync(filePath, compressedBytes);

            // Get image dimensions for metadata
            using var image = Image.Load(compressedBytes);
            var width = image.Width;
            var height = image.Height;

            // Save metadata if postId is provided
            if (postId.HasValue)
            {
                await SaveImageMetadataAsync(fileName, file.FileName, compressedBytes.Length, width, height, userId, postId.Value);
            }

            return GetImageUrl(fileName);
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                var fileName = ExtractFileNameFromUrl(imageUrl);
                var filePath = GetFullFilePath(fileName);

                // Delete file from disk
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                // Delete metadata from database
                await DeleteImageMetadataAsync(fileName);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete image {ImageUrl}", imageUrl);
                return false;
            }
        }

        public async Task<bool> DeleteImagesAsync(List<string> imageUrls)
        {
            var allDeleted = true;

            foreach (var imageUrl in imageUrls)
            {
                var deleted = await DeleteImageAsync(imageUrl);
                if (!deleted)
                {
                    allDeleted = false;
                    _logger.LogWarning("Failed to delete image {ImageUrl}", imageUrl);
                }
            }

            return allDeleted;
        }

        public async Task<byte[]> CompressImageAsync(byte[] imageBytes, int maxWidth = 1000, int maxHeight = 667, int quality = 75)
        {
            using var inputStream = new MemoryStream(imageBytes);
            using var image = await Image.LoadAsync(inputStream);

            // Store original dimensions for aspect ratio preservation
            var originalWidth = image.Width;
            var originalHeight = image.Height;

            // Calculate new dimensions while maintaining aspect ratio
            var (newWidth, newHeight) = CalculateNewDimensions(originalWidth, originalHeight, maxWidth, maxHeight);

            // Resize image maintaining aspect ratio
            image.Mutate(x => x.Resize(newWidth, newHeight));

            // Use configurable target file size
            var targetSizeBytes = _settings.TargetFileSize;
            
            // Try different quality levels to achieve target size
            var qualityLevels = new[] { quality, 65, 55, 45, 35, 25, 15 };
            
            foreach (var currentQuality in qualityLevels)
            {
                using var outputStream = new MemoryStream();
                var encoder = new JpegEncoder { Quality = currentQuality };
                await image.SaveAsync(outputStream, encoder);
                
                var compressedBytes = outputStream.ToArray();
                
                // If we're under target size, return this compression
                if (compressedBytes.Length <= targetSizeBytes)
                {
                    _logger.LogInformation("Compressed image to {Size}KB with quality {Quality}% (dimensions: {Width}x{Height})", 
                        compressedBytes.Length / 1024, currentQuality, newWidth, newHeight);
                    return compressedBytes;
                }
            }
            
            // If still too large, try smaller dimensions while preserving aspect ratio
            // Reduce max dimensions by 20% and recalculate with aspect ratio
            var reducedMaxWidth = (int)(maxWidth * 0.8);
            var reducedMaxHeight = (int)(maxHeight * 0.8);
            var (smallerWidth, smallerHeight) = CalculateNewDimensions(originalWidth, originalHeight, reducedMaxWidth, reducedMaxHeight);
            
            image.Mutate(x => x.Resize(smallerWidth, smallerHeight));
            
            // Try compression again with smaller size but preserved aspect ratio
            foreach (var currentQuality in new[] { 25, 15, 10 })
            {
                using var outputStream = new MemoryStream();
                var encoder = new JpegEncoder { Quality = currentQuality };
                await image.SaveAsync(outputStream, encoder);
                
                var compressedBytes = outputStream.ToArray();
                
                if (compressedBytes.Length <= targetSizeBytes)
                {
                    _logger.LogWarning("Aggressively compressed image to {Size}KB with quality {Quality}% and reduced dimensions ({Width}x{Height})", 
                        compressedBytes.Length / 1024, currentQuality, smallerWidth, smallerHeight);
                    return compressedBytes;
                }
            }
            
            // Last resort: very small dimensions while maintaining aspect ratio
            var verySmallMaxWidth = (int)(maxWidth * 0.6);
            var verySmallMaxHeight = (int)(maxHeight * 0.6);
            var (verySmallWidth, verySmallHeight) = CalculateNewDimensions(originalWidth, originalHeight, verySmallMaxWidth, verySmallMaxHeight);
            
            image.Mutate(x => x.Resize(verySmallWidth, verySmallHeight));
            
            using var finalStream = new MemoryStream();
            var finalEncoder = new JpegEncoder { Quality = 10 };
            await image.SaveAsync(finalStream, finalEncoder);
            
            var finalBytes = finalStream.ToArray();
            _logger.LogWarning("Final compression resulted in {Size}KB (target was {Target}KB) with dimensions {Width}x{Height}", 
                finalBytes.Length / 1024, targetSizeBytes / 1024, verySmallWidth, verySmallHeight);
            
            return finalBytes;
        }

        public string GenerateUniqueFileName(string originalFileName, int userId, int? postId = null)
        {
            var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var hash = GenerateFileHash(originalFileName, userId, timestamp);
            
            var postIdPart = postId?.ToString() ?? "temp";
            return $"{userId}_{postIdPart}_{timestamp}_{hash}{extension}";
        }

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > _settings.MaxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_settings.AllowedExtensions.Contains(extension))
                return false;

            // Additional validation: check file signature
            try
            {
                using var stream = file.OpenReadStream();
                var imageInfo = Image.Identify(stream);
                return imageInfo != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<PostImage> SaveImageMetadataAsync(string fileName, string originalFileName, long fileSize, int width, int height, int userId, int postId)
        {
            var postImage = new PostImage
            {
                PostId = postId,
                FileName = fileName,
                OriginalFileName = originalFileName,
                FileSize = fileSize,
                Width = width,
                Height = height,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.PostImages.Add(postImage);
            await _context.SaveChangesAsync();

            return postImage;
        }

        public async Task<bool> DeleteImageMetadataAsync(string fileName)
        {
            try
            {
                var postImage = await _context.PostImages.FirstOrDefaultAsync(pi => pi.FileName == fileName);
                if (postImage != null)
                {
                    _context.PostImages.Remove(postImage);
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete image metadata for file {FileName}", fileName);
                return false;
            }
        }

        public string GetImageUrl(string fileName)
        {
            var year = DateTime.UtcNow.Year;
            var month = DateTime.UtcNow.Month.ToString("D2");
            return $"/uploads/posts/{year}/{month}/{fileName}";
        }

        public Task<bool> ImageExistsAsync(string fileName)
        {
            var filePath = GetFullFilePath(fileName);
            return Task.FromResult(File.Exists(filePath));
        }

        #region Private Methods

        private void EnsureUploadDirectoryExists()
        {
            var year = DateTime.UtcNow.Year;
            var month = DateTime.UtcNow.Month.ToString("D2");
            var fullPath = Path.Combine(_settings.UploadPath, year.ToString(), month);
            
            if (!Directory.Exists(fullPath))
            {
                Directory.CreateDirectory(fullPath);
            }
        }

        private string GetFullFilePath(string fileName)
        {
            var year = DateTime.UtcNow.Year;
            var month = DateTime.UtcNow.Month.ToString("D2");
            return Path.Combine(_settings.UploadPath, year.ToString(), month, fileName);
        }

        private string ExtractFileNameFromUrl(string imageUrl)
        {
            return Path.GetFileName(imageUrl);
        }

        private string GenerateFileHash(string originalFileName, int userId, string timestamp)
        {
            var input = $"{originalFileName}_{userId}_{timestamp}_{Guid.NewGuid()}";
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToHexString(hashBytes)[..8].ToLowerInvariant();
        }

        /// <summary>
        /// Calculates new dimensions while preserving the original aspect ratio.
        /// The image will fit within the specified max dimensions without distortion.
        /// </summary>
        /// <param name="originalWidth">Original image width</param>
        /// <param name="originalHeight">Original image height</param>
        /// <param name="maxWidth">Maximum allowed width</param>
        /// <param name="maxHeight">Maximum allowed height</param>
        /// <returns>New dimensions that maintain aspect ratio and fit within max bounds</returns>
        private (int newWidth, int newHeight) CalculateNewDimensions(int originalWidth, int originalHeight, int maxWidth, int maxHeight)
        {
            // If image is already smaller than max dimensions, keep original size
            if (originalWidth <= maxWidth && originalHeight <= maxHeight)
                return (originalWidth, originalHeight);

            // Calculate scaling ratios for both dimensions
            var ratioX = (double)maxWidth / originalWidth;
            var ratioY = (double)maxHeight / originalHeight;
            
            // Use the smaller ratio to ensure the image fits within both max dimensions
            // This preserves the aspect ratio while ensuring the image isn't stretched
            var ratio = Math.Min(ratioX, ratioY);

            // Apply the scaling ratio to both dimensions
            var newWidth = (int)(originalWidth * ratio);
            var newHeight = (int)(originalHeight * ratio);

            return (newWidth, newHeight);
        }

        #endregion
    }
}
