using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;

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
    }
} 