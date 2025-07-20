using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using PetWhenua.Services.Abstract;
using PetWhenua.Services;
using PetWhenua.Hubs;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;
using System.Security.Claims;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PetWeddingController : ControllerBase
    {
        private readonly IPetWeddingService _petWeddingService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IPostService _postService;
        private readonly IUserService _userService;

        public PetWeddingController(
            IPetWeddingService petWeddingService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubContext,
            IPostService postService,
            IUserService userService)
        {
            _petWeddingService = petWeddingService;
            _notificationService = notificationService;
            _hubContext = hubContext;
            _postService = postService;
            _userService = userService;
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

                // Send notification to wedding creator about approval
                try
                {
                    // Get the wedding post to find the creator
                    var post = await _postService.GetPostByIdAsync(postId);
                    if (post != null && post.UserId != currentUserId)
                    {
                        // Get current user info to include in notification
                        var approver = await _userService.GetUserByIdAsync(currentUserId);
                        var approverName = approver?.FirstName ?? approver?.Username ?? "Someone";

                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = post.UserId, // Notify the wedding creator
                            Type = NotificationType.PetWeddingApproved,
                            Title = "Pet Wedding Request Approved",
                            Message = $"{approverName} has approved the pet wedding request: {post.Title}",
                            RelatedPostId = postId,
                            RelatedUserId = currentUserId
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send pet wedding approval notification: {ex.Message}");
                }

                return Ok(new { message = "Participation approved successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{postId}/reject")]
        public async Task<IActionResult> RejectPetWeddingParticipation(int postId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var success = await _petWeddingService.RejectPetWeddingParticipationAsync(postId, currentUserId);
                
                if (!success)
                    return NotFound("No pending approval found for this user");

                // Send notification to wedding creator about rejection
                try
                {
                    // Get the wedding post to find the creator
                    var post = await _postService.GetPostByIdAsync(postId);
                    if (post != null && post.UserId != currentUserId)
                    {
                        // Get current user info to include in notification
                        var rejecter = await _userService.GetUserByIdAsync(currentUserId);
                        var rejecterName = rejecter?.FirstName ?? rejecter?.Username ?? "Someone";

                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = post.UserId, // Notify the wedding creator
                            Type = NotificationType.PetWeddingRejected,
                            Title = "Pet Wedding Request Declined",
                            Message = $"{rejecterName} has declined the pet wedding request: {post.Title}",
                            RelatedPostId = postId,
                            RelatedUserId = currentUserId
                        });
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send pet wedding rejection notification: {ex.Message}");
                }

                return Ok(new { message = "Participation declined successfully" });
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


}
