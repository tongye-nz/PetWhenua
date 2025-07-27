using Microsoft.AspNetCore.Mvc;
using PetWhenua.Services;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ILogger<HealthController> _logger;

        public HealthController(IPostService postService, ILogger<HealthController> logger)
        {
            _postService = postService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Health()
        {
            try
            {
                // Test basic database connectivity
                var postExists = await _postService.PostExistsAsync(1);
                var postCount = (await _postService.GetPostsAsync()).Count();
                
                return Ok(new 
                { 
                    status = "healthy", 
                    timestamp = DateTime.UtcNow,
                    database = "connected",
                    postCount = postCount,
                    post1Exists = postExists
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, new 
                { 
                    status = "unhealthy", 
                    timestamp = DateTime.UtcNow,
                    error = ex.Message,
                    details = ex.StackTrace
                });
            }
        }
    }
} 