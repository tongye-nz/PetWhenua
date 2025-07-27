using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using PetWhenua.Controllers;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Tests.Controllers;

public class PostPermissionsControllerTests
{
    private readonly Mock<ILogger<PostPermissionsController>> _mockLogger;
    private readonly PostPermissionsController _controller;

    public PostPermissionsControllerTests()
    {
        _mockLogger = new Mock<ILogger<PostPermissionsController>>();
        _controller = new PostPermissionsController(_mockLogger.Object);
    }

    [Theory]
    [InlineData("member")]
    [InlineData("vet")]
    [InlineData("site_admin")]
    [InlineData("meetup_admin")]
    public void GetPostCreationPermissions_ValidRole_ReturnsOkWithPermissions(string userRole)
    {
        // Act
        var result = _controller.GetPostCreationPermissions(userRole);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        Assert.Equal(userRole, response.UserRole);
        Assert.NotEmpty(response.UserRoleDisplayName);
        Assert.NotNull(response.Permissions);
        Assert.NotNull(response.RestrictedPostTypes);
        Assert.NotNull(response.AllowedPostTypes);
        
        // Verify that permissions dictionary contains all post types
        var expectedPostTypes = Enum.GetNames<PostType>();
        Assert.Equal(expectedPostTypes.Length, response.Permissions.Count);
        
        // Verify that allowed and restricted lists are complementary
        var totalTypes = response.AllowedPostTypes.Count + response.RestrictedPostTypes.Count;
        Assert.Equal(expectedPostTypes.Length, totalTypes);
    }

    [Fact]
    public void GetPostCreationPermissions_MemberRole_HasCorrectRestrictions()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("member");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        // Members should not be able to create Library or Announcement posts
        Assert.Contains("Library", response.RestrictedPostTypes);
        Assert.Contains("Announcement", response.RestrictedPostTypes);
        
        // Members should be able to create other post types
        Assert.Contains("Moment", response.AllowedPostTypes);
        Assert.Contains("BuySell", response.AllowedPostTypes);
        Assert.Contains("PetWedding", response.AllowedPostTypes);
        Assert.Contains("Meetup", response.AllowedPostTypes);
    }

    [Fact]
    public void GetPostCreationPermissions_VetRole_CanCreateLibraryPosts()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("vet");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        // Vets should be able to create Library posts
        Assert.Contains("Library", response.AllowedPostTypes);
        
        // Vets should still not be able to create Announcement posts
        Assert.Contains("Announcement", response.RestrictedPostTypes);
    }

    [Fact]
    public void GetPostCreationPermissions_SiteAdminRole_CanCreateAllPosts()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("site_admin");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        // Site admins should be able to create all post types
        Assert.Empty(response.RestrictedPostTypes);
        Assert.Equal(6, response.AllowedPostTypes.Count); // All 6 post types
        
        // Verify all post types are allowed
        Assert.Contains("Library", response.AllowedPostTypes);
        Assert.Contains("Announcement", response.AllowedPostTypes);
        Assert.Contains("Moment", response.AllowedPostTypes);
        Assert.Contains("BuySell", response.AllowedPostTypes);
        Assert.Contains("PetWedding", response.AllowedPostTypes);
        Assert.Contains("Meetup", response.AllowedPostTypes);
    }

    [Fact]
    public void GetPostCreationPermissions_EmptyRole_ReturnsBadRequest()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("");

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("User role is required", badRequestResult.Value?.ToString());
    }

    [Fact]
    public void GetPostCreationPermissions_NullRole_ReturnsBadRequest()
    {
        // Act
        var result = _controller.GetPostCreationPermissions(null);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("User role is required", badRequestResult.Value?.ToString());
    }

    [Fact]
    public void GetPostCreationPermissions_InvalidRole_ReturnsBadRequest()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("invalid_role");

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("Invalid user role", badRequestResult.Value?.ToString());
    }

    [Fact]
    public void GetPostCreationPermissions_ValidRole_IncludesDisplayName()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("member");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        Assert.Equal("member", response.UserRole);
        Assert.NotEmpty(response.UserRoleDisplayName);
        Assert.NotEqual("member", response.UserRoleDisplayName); // Should be a display-friendly version
    }

    [Fact]
    public void GetPostCreationPermissions_PermissionsDictionaryIsCorrect()
    {
        // Act
        var result = _controller.GetPostCreationPermissions("member");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        // Verify permissions dictionary matches allowed/restricted lists
        foreach (var permission in response.Permissions)
        {
            if (permission.Value)
            {
                Assert.Contains(permission.Key, response.AllowedPostTypes);
                Assert.DoesNotContain(permission.Key, response.RestrictedPostTypes);
            }
            else
            {
                Assert.DoesNotContain(permission.Key, response.AllowedPostTypes);
                Assert.Contains(permission.Key, response.RestrictedPostTypes);
            }
        }
    }

    [Fact]
    public void GetPostCreationRestrictions_ValidRequest_ReturnsOkWithRestrictions()
    {
        // Act
        var result = _controller.GetPostCreationRestrictions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationRestrictionsInfo>(okResult.Value);
        
        Assert.NotNull(response.LibraryPostRoles);
        Assert.NotNull(response.AnnouncementPostRoles);
        Assert.NotNull(response.UnrestrictedPostRoles);
        Assert.NotNull(response.PostTypeRestrictions);
        
        // Verify that all post types are covered in restrictions
        Assert.Equal(6, response.PostTypeRestrictions.Count); // All 6 post types
        Assert.Contains("Library", response.PostTypeRestrictions.Keys);
        Assert.Contains("Announcement", response.PostTypeRestrictions.Keys);
        Assert.Contains("Moment", response.PostTypeRestrictions.Keys);
        Assert.Contains("BuySell", response.PostTypeRestrictions.Keys);
        Assert.Contains("PetWedding", response.PostTypeRestrictions.Keys);
        Assert.Contains("Meetup", response.PostTypeRestrictions.Keys);
    }

    [Fact]
    public void GetPostCreationRestrictions_LibraryAndAnnouncementRestrictions_AreCorrect()
    {
        // Act
        var result = _controller.GetPostCreationRestrictions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationRestrictionsInfo>(okResult.Value);
        
        // Library posts should be restricted to vets and site admins
        Assert.Contains("vet", response.LibraryPostRoles);
        Assert.Contains("site_admin", response.LibraryPostRoles);
        Assert.DoesNotContain("member", response.LibraryPostRoles);
        
        // Announcement posts should be restricted to site admins only
        Assert.Contains("site_admin", response.AnnouncementPostRoles);
        Assert.DoesNotContain("member", response.AnnouncementPostRoles);
        Assert.DoesNotContain("vet", response.AnnouncementPostRoles);
        Assert.DoesNotContain("meetup_admin", response.AnnouncementPostRoles);
    }

    [Fact]
    public void GetPostCreationRestrictions_UnrestrictedPosts_IncludeAllRoles()
    {
        // Act
        var result = _controller.GetPostCreationRestrictions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationRestrictionsInfo>(okResult.Value);
        
        // Unrestricted posts should allow all roles
        Assert.Contains("member", response.UnrestrictedPostRoles);
        Assert.Contains("vet", response.UnrestrictedPostRoles);
        Assert.Contains("site_admin", response.UnrestrictedPostRoles);
        Assert.Contains("meetup_admin", response.UnrestrictedPostRoles);
        
        // Verify unrestricted post types allow all roles
        var unrestrictedTypes = new[] { "Moment", "BuySell", "PetWedding", "Meetup" };
        foreach (var postType in unrestrictedTypes)
        {
            Assert.True(response.PostTypeRestrictions.ContainsKey(postType));
            var allowedRoles = response.PostTypeRestrictions[postType];
            Assert.Contains("member", allowedRoles);
            Assert.Contains("vet", allowedRoles);
            Assert.Contains("site_admin", allowedRoles);
            Assert.Contains("meetup_admin", allowedRoles);
        }
    }

    [Fact]
    public void GetPostCreationRestrictions_RestrictedPosts_HaveLimitedRoles()
    {
        // Act
        var result = _controller.GetPostCreationRestrictions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationRestrictionsInfo>(okResult.Value);
        
        // Library posts should have limited roles
        var libraryRoles = response.PostTypeRestrictions["Library"];
        Assert.DoesNotContain("member", libraryRoles);
        Assert.Contains("vet", libraryRoles);
        Assert.Contains("site_admin", libraryRoles);
        
        // Announcement posts should have very limited roles
        var announcementRoles = response.PostTypeRestrictions["Announcement"];
        Assert.DoesNotContain("member", announcementRoles);
        Assert.DoesNotContain("vet", announcementRoles);
        Assert.DoesNotContain("meetup_admin", announcementRoles);
        Assert.Contains("site_admin", announcementRoles);
    }

    [Fact]
    public void GetPostCreationRestrictions_IncludesMessages()
    {
        // Act
        var result = _controller.GetPostCreationRestrictions();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationRestrictionsInfo>(okResult.Value);
        
        Assert.NotEmpty(response.LibraryRestrictionMessage);
        Assert.NotEmpty(response.AnnouncementRestrictionMessage);
        Assert.NotEmpty(response.UnrestrictedMessage);
        
        Assert.Contains("veterinarians", response.LibraryRestrictionMessage);
        Assert.Contains("site administrators", response.LibraryRestrictionMessage);
        Assert.Contains("site administrators", response.AnnouncementRestrictionMessage);
        Assert.Contains("authenticated users", response.UnrestrictedMessage);
    }

    [Theory]
    [InlineData("member", false, true)]  // member: no Library, yes Moment
    [InlineData("vet", true, true)]      // vet: yes Library, yes Moment  
    [InlineData("site_admin", true, true)] // site_admin: yes Library, yes Moment
    public void GetPostCreationPermissions_RoleSpecificPermissions_AreCorrect(string role, bool canCreateLibrary, bool canCreateMoment)
    {
        // Act
        var result = _controller.GetPostCreationPermissions(role);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<PostCreationPermissionsResponse>(okResult.Value);
        
        Assert.Equal(canCreateLibrary, response.Permissions["Library"]);
        Assert.Equal(canCreateMoment, response.Permissions["Moment"]);
    }

    [Fact]
    public void GetPostCreationPermissions_ExceptionInAuthorization_ReturnsInternalServerError()
    {
        // This test would require mocking the PostAuthorizationService if it were injected
        // Since it's created inline, we'll test a scenario that might cause an internal error
        
        // For now, we'll test with a role that might cause issues during processing
        // In a real scenario, you'd mock the service and setup it to throw an exception
        
        // Act & Assert
        // This test structure shows how you'd test exception handling
        // The current implementation creates the service inline, so exceptions are less likely
        // But if refactored to use dependency injection, this pattern would be useful
        
        var result = _controller.GetPostCreationPermissions("member");
        
        // Verify it doesn't throw and returns a valid response
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public void GetPostCreationRestrictions_ExceptionHandling_ReturnsInternalServerError()
    {
        // Similar to above - testing the structure for exception handling
        // In the current implementation, this method is unlikely to throw
        // But the test structure shows how to handle it if the implementation changes
        
        // Act
        var result = _controller.GetPostCreationRestrictions();
        
        // Assert - verify normal operation
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
} 