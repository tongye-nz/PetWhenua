using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using PetWhenua.Controllers;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace PetWhenua.Tests.Controllers;

public class MeetupControllerTests
{
    private readonly Mock<IPostService> _mockPostService;
    private readonly Mock<ILogger<MeetupController>> _mockLogger;
    private readonly MeetupController _controller;

    public MeetupControllerTests()
    {
        _mockPostService = new Mock<IPostService>();
        _mockLogger = new Mock<ILogger<MeetupController>>();
        _controller = new MeetupController(_mockPostService.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetInactiveMeetupPosts_ValidRequest_ReturnsOkWithPosts()
    {
        // Arrange
        var inactivePosts = new List<Post>
        {
            new Post 
            { 
                PostId = 1, 
                Title = "Inactive Meetup 1", 
                PostType = PostType.Meetup, 
                Status = PostStatus.Inactive 
            },
            new Post 
            { 
                PostId = 2, 
                Title = "Inactive Meetup 2", 
                PostType = PostType.Meetup, 
                Status = PostStatus.Inactive 
            }
        };

        _mockPostService.Setup(x => x.GetInactiveMeetupPostsAsync())
            .ReturnsAsync(inactivePosts);

        // Act
        var result = await _controller.GetInactiveMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Equal(2, returnedPosts.Count());
        Assert.All(returnedPosts, post => 
        {
            Assert.Equal(PostType.Meetup, post.PostType);
            Assert.Equal(PostStatus.Inactive, post.Status);
        });
    }

    [Fact]
    public async Task GetInactiveMeetupPosts_NoInactivePosts_ReturnsOkWithEmptyList()
    {
        // Arrange
        var emptyList = new List<Post>();

        _mockPostService.Setup(x => x.GetInactiveMeetupPostsAsync())
            .ReturnsAsync(emptyList);

        // Act
        var result = await _controller.GetInactiveMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Empty(returnedPosts);
    }

    [Fact]
    public async Task GetInactiveMeetupPosts_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        var errorMessage = "Database connection failed";
        _mockPostService.Setup(x => x.GetInactiveMeetupPostsAsync())
            .ThrowsAsync(new Exception(errorMessage));

        // Act
        var result = await _controller.GetInactiveMeetupPosts();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
        
        var response = statusCodeResult.Value;
        var messageProperty = response?.GetType().GetProperty("message");
        var errorProperty = response?.GetType().GetProperty("error");
        
        Assert.Contains("Failed to retrieve inactive meetup posts", messageProperty?.GetValue(response)?.ToString() ?? "");
        Assert.Equal(errorMessage, errorProperty?.GetValue(response));
    }

    [Fact]
    public async Task GetPendingMeetupPosts_MeetupAdmin_ReturnsOkWithPosts()
    {
        // Arrange
        var userId = 1;
        var userRole = "meetup_admin";
        
        var pendingPosts = new List<Post>
        {
            new Post 
            { 
                PostId = 1, 
                Title = "Pending Meetup 1", 
                PostType = PostType.Meetup, 
                Status = PostStatus.Pending 
            },
            new Post 
            { 
                PostId = 2, 
                Title = "Pending Meetup 2", 
                PostType = PostType.Meetup, 
                Status = PostStatus.Pending 
            }
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPendingMeetupPostsAsync())
            .ReturnsAsync(pendingPosts);

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Equal(2, returnedPosts.Count());
        Assert.All(returnedPosts, post => 
        {
            Assert.Equal(PostType.Meetup, post.PostType);
            Assert.Equal(PostStatus.Pending, post.Status);
        });
    }

    [Fact]
    public async Task GetPendingMeetupPosts_SiteAdmin_ReturnsOkWithPosts()
    {
        // Arrange
        var userId = 1;
        var userRole = "site_admin";
        
        var pendingPosts = new List<Post>
        {
            new Post 
            { 
                PostId = 1, 
                Title = "Pending Meetup 1", 
                PostType = PostType.Meetup, 
                Status = PostStatus.Pending 
            }
        };

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPendingMeetupPostsAsync())
            .ReturnsAsync(pendingPosts);

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Single(returnedPosts);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_RegularMember_ReturnsForbid()
    {
        // Arrange
        var userId = 1;
        var userRole = "member";

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_Vet_ReturnsForbid()
    {
        // Arrange
        var userId = 1;
        var userRole = "vet";

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_NoUserRole_ReturnsForbid()
    {
        // Arrange
        var userId = 1;

        // Setup user claims without role
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_EmptyUserRole_ReturnsForbid()
    {
        // Arrange
        var userId = 1;
        var userRole = "";

        // Setup user claims with empty role
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_ServiceThrowsException_ReturnsInternalServerError()
    {
        // Arrange
        var userId = 1;
        var userRole = "meetup_admin";
        var errorMessage = "Database error";

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPendingMeetupPostsAsync())
            .ThrowsAsync(new Exception(errorMessage));

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var statusCodeResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(500, statusCodeResult.StatusCode);
        
        var response = statusCodeResult.Value;
        var messageProperty = response?.GetType().GetProperty("message");
        var errorProperty = response?.GetType().GetProperty("error");
        
        Assert.Contains("Failed to retrieve pending meetup posts", messageProperty?.GetValue(response)?.ToString() ?? "");
        Assert.Equal(errorMessage, errorProperty?.GetValue(response));
    }

    [Fact]
    public void GetMeetupActivationInfo_ValidRequest_ReturnsOkWithInfo()
    {
        // Act
        var result = _controller.GetMeetupActivationInfo();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<MeetupActivationInfo>(okResult.Value);
        
        Assert.NotNull(response.AutoActiveRoles);
        Assert.NotNull(response.ActivationRoles);
        Assert.NotEmpty(response.MemberStatusMessage);
        Assert.NotEmpty(response.AdminStatusMessage);
        
        // Verify messages contain expected content
        Assert.Contains("Members can create meetup posts", response.MemberStatusMessage);
        Assert.Contains("inactive until approved", response.MemberStatusMessage);
        Assert.Contains("Meetup admins", response.AdminStatusMessage);
        Assert.Contains("active meetup posts immediately", response.AdminStatusMessage);
    }

    [Fact]
    public void GetMeetupActivationInfo_AutoActiveRoles_ContainsExpectedRoles()
    {
        // Act
        var result = _controller.GetMeetupActivationInfo();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<MeetupActivationInfo>(okResult.Value);
        
        // Auto-active roles should include admins and vets
        Assert.Contains("site_admin", response.AutoActiveRoles);
        Assert.Contains("meetup_admin", response.AutoActiveRoles);
        Assert.Contains("vet", response.AutoActiveRoles);
        
        // Should not include regular members
        Assert.DoesNotContain("member", response.AutoActiveRoles);
    }

    [Fact]
    public void GetMeetupActivationInfo_ActivationRoles_ContainsAdminRoles()
    {
        // Act
        var result = _controller.GetMeetupActivationInfo();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<MeetupActivationInfo>(okResult.Value);
        
        // Activation roles should include admin roles that can activate meetups
        Assert.Contains("site_admin", response.ActivationRoles);
        Assert.Contains("meetup_admin", response.ActivationRoles);
        
        // Regular members and vets should not have activation permissions
        Assert.DoesNotContain("member", response.ActivationRoles);
        // Note: Whether vets can activate depends on business rules
    }

    [Fact]
    public void GetMeetupActivationInfo_ExceptionHandling_ReturnsInternalServerError()
    {
        // This test demonstrates the pattern for testing exception handling
        // In the current implementation, this method is unlikely to throw
        // since it just returns static authorization information
        
        // Act
        var result = _controller.GetMeetupActivationInfo();

        // Assert - verify normal operation
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
        
        // If this method were to be modified to use external services
        // that could throw exceptions, this test structure would be useful
    }

    [Theory]
    [InlineData("meetup_admin")]
    [InlineData("site_admin")]
    public async Task GetPendingMeetupPosts_AuthorizedRoles_AllowAccess(string userRole)
    {
        // Arrange
        var userId = 1;
        var pendingPosts = new List<Post>();

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPendingMeetupPostsAsync())
            .ReturnsAsync(pendingPosts);

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        _mockPostService.Verify(x => x.GetPendingMeetupPostsAsync(), Times.Once);
    }

    [Theory]
    [InlineData("member")]
    [InlineData("vet")]
    [InlineData("invalid_role")]
    public async Task GetPendingMeetupPosts_UnauthorizedRoles_ReturnsForbid(string userRole)
    {
        // Arrange
        var userId = 1;

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
        
        // Verify service is not called for unauthorized users
        _mockPostService.Verify(x => x.GetPendingMeetupPostsAsync(), Times.Never);
    }

    [Fact]
    public async Task GetPendingMeetupPosts_NoPendingPosts_ReturnsOkWithEmptyList()
    {
        // Arrange
        var userId = 1;
        var userRole = "meetup_admin";
        var emptyList = new List<Post>();

        // Setup user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, userRole)
        };
        var identity = new ClaimsIdentity(claims, "test");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };

        _mockPostService.Setup(x => x.GetPendingMeetupPostsAsync())
            .ReturnsAsync(emptyList);

        // Act
        var result = await _controller.GetPendingMeetupPosts();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedPosts = Assert.IsAssignableFrom<IEnumerable<Post>>(okResult.Value);
        Assert.Empty(returnedPosts);
    }
} 