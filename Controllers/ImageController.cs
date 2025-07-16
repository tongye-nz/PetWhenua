using Microsoft.AspNetCore.Mvc;
using PetWhenua.Models.Dtos;
using PetWhenua.Services;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IImageService _imageService;
        private readonly ILogger<ImageController> _logger;

        public ImageController(IImageService imageService, ILogger<ImageController> logger)
        {
            _imageService = imageService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> files, [FromForm] int userId, [FromForm] int? postId = null)
        {
            try
            {
                if (files == null || !files.Any())
                {
                    return BadRequest(new ImageUploadResult
                    {
                        Success = false,
                        ErrorMessage = "No files provided for upload."
                    });
                }

                if (files.Count > 9)
                {
                    return BadRequest(new ImageUploadResult
                    {
                        Success = false,
                        ErrorMessage = "Maximum 9 images allowed per upload."
                    });
                }

                // Validate each file
                var validationResults = new List<ImageValidationResult>();
                foreach (var file in files)
                {
                    var isValid = _imageService.IsValidImageFile(file);
                    validationResults.Add(new ImageValidationResult
                    {
                        IsValid = isValid,
                        FileName = file.FileName,
                        FileSize = file.Length,
                        ErrorMessage = isValid ? null : "Invalid image file format or size."
                    });
                }

                var invalidFiles = validationResults.Where(v => !v.IsValid).ToList();
                if (invalidFiles.Any())
                {
                    return BadRequest(new ImageUploadResult
                    {
                        Success = false,
                        ErrorMessage = $"Invalid files: {string.Join(", ", invalidFiles.Select(f => f.FileName))}"
                    });
                }

                // Upload images
                var imageUrls = await _imageService.UploadImagesAsync(files, userId, postId);

                return Ok(new ImageUploadResult
                {
                    Success = true,
                    ImageUrls = imageUrls,
                    UploadedCount = imageUrls.Count
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Image upload validation failed for user {UserId}", userId);
                return BadRequest(new ImageUploadResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload images for user {UserId}", userId);
                return StatusCode(500, new ImageUploadResult
                {
                    Success = false,
                    ErrorMessage = "An error occurred while uploading images."
                });
            }
        }

        [HttpDelete("{fileName}")]
        public async Task<IActionResult> DeleteImage(string fileName)
        {
            try
            {
                // Extract just the filename from the URL if a full URL was passed
                var actualFileName = Path.GetFileName(fileName);
                
                var imageUrl = _imageService.GetImageUrl(actualFileName);
                var deleted = await _imageService.DeleteImageAsync(imageUrl);

                if (!deleted)
                {
                    return NotFound(new { message = "Image not found or could not be deleted." });
                }

                return Ok(new { message = "Image deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete image {FileName}", fileName);
                return StatusCode(500, new { message = "An error occurred while deleting the image." });
            }
        }

        [HttpGet("validate")]
        public IActionResult ValidateImages([FromQuery] int count)
        {
            try
            {
                if (count > 9)
                {
                    return BadRequest(new { 
                        isValid = false, 
                        message = "Maximum 9 images allowed per post." 
                    });
                }

                if (count < 0)
                {
                    return BadRequest(new { 
                        isValid = false, 
                        message = "Image count cannot be negative." 
                    });
                }

                return Ok(new { 
                    isValid = true, 
                    message = $"Image count {count} is valid." 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating image count {Count}", count);
                return StatusCode(500, new { message = "An error occurred while validating image count." });
            }
        }

        [HttpPost("validate-file")]
        public IActionResult ValidateImageFile([FromForm] IFormFile file)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest(new ImageValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "No file provided."
                    });
                }

                var isValid = _imageService.IsValidImageFile(file);
                
                return Ok(new ImageValidationResult
                {
                    IsValid = isValid,
                    FileName = file.FileName,
                    FileSize = file.Length,
                    ErrorMessage = isValid ? null : "Invalid image file format or size."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating image file {FileName}", file?.FileName);
                return StatusCode(500, new ImageValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "An error occurred while validating the image file."
                });
            }
        }

        [HttpGet("exists/{fileName}")]
        public async Task<IActionResult> CheckImageExists(string fileName)
        {
            try
            {
                var exists = await _imageService.ImageExistsAsync(fileName);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if image exists {FileName}", fileName);
                return StatusCode(500, new { message = "An error occurred while checking image existence." });
            }
        }
    }
}
