using Microsoft.AspNetCore.Mvc;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                message = "PetWhenua API is running successfully!",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                timestamp = DateTime.UtcNow,
                endpoints = new
                {
                    swagger = "/swagger",
                    api = "/api",
                    notifications = "/hubs/notifications"
                }
            });
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
} 