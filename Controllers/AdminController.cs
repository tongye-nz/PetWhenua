using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;
using PetWhenua.Services;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Utils;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "site_admin")]
    public class AdminController : ControllerBase
    {
        private readonly IMockDataService _mockDataService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IMockDataService mockDataService, ILogger<AdminController> logger)
        {
            _mockDataService = mockDataService;
            _logger = logger;
        }

        [HttpPost("seed-mock-data")]
        public async Task<IActionResult> SeedMockData([FromQuery] bool forceRecreate = false)
        {
            try
            {
                _logger.LogInformation("Admin initiated mock data seeding with forceRecreate: {ForceRecreate}", forceRecreate);
                
                var result = await _mockDataService.SeedMockDataAsync(forceRecreate);
                
                if (result)
                {
                    var summary = await _mockDataService.GetMockDataSummaryAsync();
                    
                    return Ok(new
                    {
                        Success = true,
                        Message = "Mock data seeded successfully",
                        Summary = summary
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Failed to seed mock data. Check server logs for details."
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during mock data seeding");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred during mock data seeding",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("mock-data-summary")]
        public async Task<IActionResult> GetMockDataSummary()
        {
            try
            {
                var summary = await _mockDataService.GetMockDataSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting mock data summary");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while getting mock data summary",
                    Error = ex.Message
                });
            }
        }

        [HttpDelete("clear-mock-data")]
        public async Task<IActionResult> ClearMockData()
        {
            try
            {
                _logger.LogInformation("Admin initiated mock data clearing");
                
                await _mockDataService.ClearAllDataAsync();
                
                return Ok(new
                {
                    Success = true,
                    Message = "Mock data cleared successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during mock data clearing");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred during mock data clearing",
                    Error = ex.Message
                });
            }
        }

        [HttpGet("database-status")]
        public async Task<IActionResult> GetDatabaseStatus()
        {
            try
            {
                var hasData = await _mockDataService.DatabaseHasDataAsync();
                
                return Ok(new
                {
                    HasMockData = hasData,
                    Message = hasData 
                        ? "Database contains mock data" 
                        : "Database does not contain mock data"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking database status");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "An error occurred while checking database status",
                    Error = ex.Message
                });
            }
        }

        [HttpPost("expire-past-events")]
        public async Task<IActionResult> ExpirePastEvents([FromQuery] string? userRole = null)
        {
            try
            {
                // Only allow admins to manually trigger expiry
                if (!string.IsNullOrEmpty(userRole) && !UserRoles.IsAdmin(userRole))
                {
                    return StatusCode(403, new { error = "Only site administrators can manually trigger post expiry." });
                }

                using var scope = HttpContext.RequestServices.CreateScope();
                var expiryService = scope.ServiceProvider.GetRequiredService<PostExpiryService>();
                
                var expiredCount = await expiryService.ExpirePostsByEventDateAsync();
                
                return Ok(new
                {
                    message = $"Manual expiry check completed. {expiredCount} posts expired.",
                    expiredCount = expiredCount,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while expiring posts");
                return StatusCode(500, new { error = "An error occurred while expiring posts.", details = ex.Message });
            }
        }

        [HttpGet("expiry-stats")]
        public async Task<IActionResult> GetExpiryStats()
        {
            try
            {
                using var scope = HttpContext.RequestServices.CreateScope();
                var expiryService = scope.ServiceProvider.GetRequiredService<PostExpiryService>();
                
                var stats = await expiryService.GetExpiryStatsAsync();
                
                return Ok(new
                {
                    totalExpirablePosts = stats.TotalExpirablePosts,
                    expirableByType = stats.ExpirableByType.ToDictionary(
                        kvp => kvp.Key.ToString(),
                        kvp => kvp.Value
                    ),
                    totalActiveTimeBasedPosts = stats.TotalActiveTimeBasedPosts,
                    checkDate = stats.CheckDate,
                    message = stats.TotalExpirablePosts > 0 
                        ? $"{stats.TotalExpirablePosts} posts are eligible for expiration"
                        : "No posts are currently eligible for expiration"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting expiry stats");
                return StatusCode(500, new { error = "An error occurred while getting expiry stats.", details = ex.Message });
            }
        }

        [HttpGet("past-events")]
        public async Task<IActionResult> GetPastEvents()
        {
            try
            {
                using var scope = HttpContext.RequestServices.CreateScope();
                var postRepository = scope.ServiceProvider.GetRequiredService<IPostRepository>();
                
                var expirablePosts = await postRepository.GetExpirablePostsAsync(DateTime.UtcNow);
                
                var result = expirablePosts.Select(p => new
                {
                    postId = p.PostId,
                    title = p.Title,
                    postType = p.PostType.ToString(),
                    eventDate = p.EventDate,
                    status = p.Status.ToString(),
                    daysPastEvent = p.EventDate.HasValue 
                        ? (DateTime.UtcNow.Date - p.EventDate.Value.Date).Days 
                        : 0
                });

                return Ok(new
                {
                    posts = result,
                    count = result.Count(),
                    message = result.Any() 
                        ? $"Found {result.Count()} past events that should be expired"
                        : "No past events found that need expiration"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting past events");
                return StatusCode(500, new { error = "An error occurred while getting past events.", details = ex.Message });
            }
        }
    }
} 