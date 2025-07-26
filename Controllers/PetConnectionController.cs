using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;
using PetWhenua.Services;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PetConnectionController : ControllerBase
    {
        private readonly IPetConnectionService _petConnectionService;
        private readonly INotificationService _notificationService;
        private readonly IPetService _petService;

        public PetConnectionController(
            IPetConnectionService petConnectionService,
            INotificationService notificationService,
            IPetService petService)
        {
            _petConnectionService = petConnectionService;
            _notificationService = notificationService;
            _petService = petService;
        }

        [HttpPost("request")]
        public async Task<IActionResult> RequestConnection([FromBody] RequestConnectionDto request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var connection = await _petConnectionService.RequestConnectionAsync(
                    currentUserId, request.Pet1Id, request.Pet2Id, request.Message);
                
                // Send notification to the pet owner who received the request
                try
                {
                    // Get pet information to create meaningful notification
                    var pet1 = await _petService.GetPetByIdAsync(request.Pet1Id, includeUser: true);
                    var pet2 = await _petService.GetPetByIdAsync(request.Pet2Id, includeUser: true);
                    
                    // Determine which pet belongs to the target user
                    var targetUserId = pet1?.UserId == currentUserId ? pet2?.UserId : pet1?.UserId;
                    var requesterPetName = pet1?.UserId == currentUserId ? pet1?.Name : pet2?.Name;
                    var targetPetName = pet1?.UserId == currentUserId ? pet2?.Name : pet1?.Name;
                    var requesterPetId = pet1?.UserId == currentUserId ? pet1?.PetId : pet2?.PetId;
                    
                    if (targetUserId.HasValue && !string.IsNullOrEmpty(requesterPetName) && !string.IsNullOrEmpty(targetPetName))
                    {
                        await _notificationService.CreatePetConnectionRequestNotificationAsync(
                            targetUserId.Value, 
                            currentUserId, 
                            connection.PetConnectionId, 
                            requesterPetName, 
                            targetPetName,
                            requesterPetId);
                    }
                }
                catch (Exception ex)
                {
                    // Log notification failure but don't fail the main request
                    Console.WriteLine($"Failed to send connection request notification: {ex.Message}");
                }
                
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
                
                // Send notification to the original requester about the response
                try
                {
                    var pet1 = await _petService.GetPetByIdAsync(connection.Pet1Id, includeUser: true);
                    var pet2 = await _petService.GetPetByIdAsync(connection.Pet2Id, includeUser: true);
                    
                    var requesterPetName = pet1?.UserId == connection.RequestedById ? pet1?.Name : pet2?.Name;
                    var responderPetName = pet1?.UserId == connection.RequestedById ? pet2?.Name : pet1?.Name;
                    var connectedPetId = pet1?.UserId == connection.RequestedById ? pet2?.PetId : pet1?.PetId;
                    
                    if (!string.IsNullOrEmpty(requesterPetName) && !string.IsNullOrEmpty(responderPetName))
                    {
                        var isApproved = request.Response == PetConnectionStatus.Accepted;
                        await _notificationService.CreatePetConnectionResponseNotificationAsync(
                            connection.RequestedById, 
                            currentUserId, 
                            connection.PetConnectionId, 
                            isApproved, 
                            requesterPetName, 
                            responderPetName,
                            connectedPetId);
                    }
                }
                catch (Exception ex)
                {
                    // Log notification failure but don't fail the main request
                    Console.WriteLine($"Failed to send connection response notification: {ex.Message}");
                }
                
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
