using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PetConnectionController : ControllerBase
    {
        private readonly IPetConnectionService _petConnectionService;

        public PetConnectionController(IPetConnectionService petConnectionService)
        {
            _petConnectionService = petConnectionService;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestConnection([FromBody] RequestConnectionDto request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var connection = await _petConnectionService.RequestConnectionAsync(
                    currentUserId, request.Pet1Id, request.Pet2Id, request.Message);
                
                return Ok(new { message = "Connection request sent successfully", connection });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{connectionId}/respond")]
        public async Task<IActionResult> RespondToConnection(int connectionId, [FromBody] RespondConnectionDto request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var connection = await _petConnectionService.RespondToConnectionAsync(
                    connectionId, currentUserId, request.Response, request.Message);
                
                return Ok(new { message = "Response sent successfully", connection });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingConnections()
        {
            var currentUserId = GetCurrentUserId();
            var connections = await _petConnectionService.GetPendingConnectionsForUserAsync(currentUserId);
            return Ok(connections);
        }

        [HttpGet("connected/{petId}")]
        public async Task<IActionResult> GetConnectedPets(int petId)
        {
            var connectedPets = await _petConnectionService.GetConnectedPetsAsync(petId);
            return Ok(connectedPets);
        }

        [HttpGet("available/{petId}")]
        public async Task<IActionResult> GetAvailablePetsForConnection(int petId)
        {
            var currentUserId = GetCurrentUserId();
            var availablePets = await _petConnectionService.GetAvailablePetsForConnectionAsync(currentUserId, petId);
            return Ok(availablePets);
        }

        [HttpGet("status/{pet1Id}/{pet2Id}")]
        public async Task<IActionResult> GetConnectionStatus(int pet1Id, int pet2Id)
        {
            var connection = await _petConnectionService.GetConnectionAsync(pet1Id, pet2Id);
            var areConnected = await _petConnectionService.ArePetsConnectedAsync(pet1Id, pet2Id);
            
            return Ok(new { 
                areConnected, 
                connection,
                status = connection?.Status.ToString() ?? "No Connection"
            });
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user token");
            }
            return userId;
        }
    }

    public class RequestConnectionDto
    {
        public int Pet1Id { get; set; }
        public int Pet2Id { get; set; }
        public string? Message { get; set; }
    }

    public class RespondConnectionDto
    {
        public PetConnectionStatus Response { get; set; }
        public string? Message { get; set; }
    }
}
