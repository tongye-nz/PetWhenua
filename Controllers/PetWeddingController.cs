using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetWhenua.Services.Abstract;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PetWeddingController : ControllerBase
    {
        private readonly IPetWeddingService _petWeddingService;

        public PetWeddingController(IPetWeddingService petWeddingService)
        {
            _petWeddingService = petWeddingService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePetWedding([FromBody] CreatePetWeddingDto request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var wedding = await _petWeddingService.CreatePetWeddingAsync(
                    currentUserId, 
                    request.Title, 
                    request.Content, 
                    request.PetIds, 
                    request.Location, 
                    request.Address, 
                    request.EventDate, 
                    request.Images, 
                    request.Category);
                
                return Ok(new { message = "Pet wedding created successfully", wedding });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{postId}/approve")]
        public async Task<IActionResult> ApprovePetWeddingParticipation(int postId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var success = await _petWeddingService.ApprovePetWeddingParticipationAsync(postId, currentUserId);
                
                if (!success)
                    return NotFound("No pending approval found for this user");

                return Ok(new { message = "Participation approved successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{postId}/participants")]
        public async Task<IActionResult> UpdatePetWeddingParticipants(int postId, [FromBody] UpdatePetWeddingParticipantsDto request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var updatedPost = await _petWeddingService.UpdatePetWeddingParticipantsAsync(postId, request.PetIds, currentUserId);
                
                return Ok(new { message = "Pet wedding participants updated successfully", post = updatedPost });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingWeddingApprovals()
        {
            var currentUserId = GetCurrentUserId();
            var pendingWeddings = await _petWeddingService.GetPendingWeddingApprovalsForUserAsync(currentUserId);
            return Ok(pendingWeddings);
        }

        [HttpGet("selectable-pets")]
        public async Task<IActionResult> GetSelectablePetsForWedding()
        {
            var currentUserId = GetCurrentUserId();
            var selectablePets = await _petWeddingService.GetSelectablePetsForWeddingAsync(currentUserId);
            return Ok(selectablePets);
        }

        [HttpGet("can-select-pet/{petId}")]
        public async Task<IActionResult> CanSelectPetForWedding(int petId)
        {
            var currentUserId = GetCurrentUserId();
            var canSelect = await _petWeddingService.CanUserSelectPetForWeddingAsync(currentUserId, petId);
            return Ok(new { canSelect });
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

    public class CreatePetWeddingDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<int> PetIds { get; set; } = new();
        public string Location { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public List<string>? Images { get; set; }
        public string? Category { get; set; }
    }

    public class UpdatePetWeddingParticipantsDto
    {
        public List<int> PetIds { get; set; } = new();
    }
}
