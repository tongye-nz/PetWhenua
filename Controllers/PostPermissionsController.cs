using Microsoft.AspNetCore.Mvc;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using PetWhenua.Utils;

namespace PetWhenua.Controllers
{
    [ApiController]
    [Route("api/posts/permissions")]
    public class PostPermissionsController : ControllerBase
    {
        private readonly ILogger<PostPermissionsController> _logger;

        public PostPermissionsController(ILogger<PostPermissionsController> logger)
        {
            _logger = logger;
        }

        [HttpGet("creation")]
        public IActionResult GetPostCreationPermissions([FromQuery] string userRole)
        {
            try
            {
                if (string.IsNullOrEmpty(userRole))
                {
                    return BadRequest("User role is required.");
                }

                if (!UserRoles.IsValidRole(userRole))
                {
                    return BadRequest($"Invalid user role: {userRole}");
                }

                var authService = new PostAuthorizationService();
                var permissions = authService.GetPostCreationPermissions(userRole);
                
                var response = new PostCreationPermissionsResponse
                {
                    UserRole = userRole,
                    UserRoleDisplayName = UserRoles.GetDisplayName(userRole),
                    Permissions = permissions.ToDictionary(
                        kvp => kvp.Key.ToString(), 
                        kvp => kvp.Value
                    ),
                    RestrictedPostTypes = permissions
                        .Where(kvp => !kvp.Value)
                        .Select(kvp => kvp.Key.ToString())
                        .ToList(),
                    AllowedPostTypes = permissions
                        .Where(kvp => kvp.Value)
                        .Select(kvp => kvp.Key.ToString())
                        .ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting post creation permissions for role: {UserRole}", userRole);
                return StatusCode(500, new { error = "An error occurred while getting post creation permissions." });
            }
        }

        [HttpGet("creation-restrictions")]
        public IActionResult GetPostCreationRestrictions()
        {
            try
            {
                var restrictions = new PostCreationRestrictionsInfo
                {
                    LibraryPostRoles = PostAuthorizationService.GetLibraryPostCreationRoles(),
                    AnnouncementPostRoles = PostAuthorizationService.GetAnnouncementPostCreationRoles(),
                    UnrestrictedPostRoles = PostAuthorizationService.GetUnrestrictedPostCreationRoles(),
                    PostTypeRestrictions = new Dictionary<string, List<string>>
                    {
                        { "Library", PostAuthorizationService.GetLibraryPostCreationRoles() },
                        { "Announcement", PostAuthorizationService.GetAnnouncementPostCreationRoles() },
                        { "Moment", UserRoles.AllRoles },
                        { "BuySell", UserRoles.AllRoles },
                        { "PetWedding", UserRoles.AllRoles },
                        { "Meetup", UserRoles.AllRoles }
                    }
                };

                return Ok(restrictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting post creation restrictions");
                return StatusCode(500, new { error = "An error occurred while getting post creation restrictions." });
            }
        }
    }
} 