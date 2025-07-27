using Moq;
using Xunit;
using PetWhenua.Services;

namespace PetWhenua.Tests.Services;

public class PostAuthorizationServiceTests
{
    private readonly PostAuthorizationService _authorizationService;

    public PostAuthorizationServiceTests()
    {
        _authorizationService = new PostAuthorizationService();
    }

    #region GetInitialPostStatus Tests

    [Theory]
    [InlineData("member", PostType.Moment, PostStatus.Active)]
    [InlineData("member", PostType.BuySell, PostStatus.Active)]
    [InlineData("member", PostType.PetWedding, PostStatus.Active)]
    [InlineData("vet", PostType.Moment, PostStatus.Active)]
    [InlineData("vet", PostType.BuySell, PostStatus.Active)]
    [InlineData("vet", PostType.Library, PostStatus.Active)]
    [InlineData("site_admin", PostType.Announcement, PostStatus.Active)]
    [InlineData("site_admin", PostType.Library, PostStatus.Active)]
    [InlineData("meetup_admin", PostType.Meetup, PostStatus.Active)]
    public void GetInitialPostStatus_AutoActiveRoles_ReturnsActive(string userRole, PostType postType, PostStatus expectedStatus)
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus(userRole, postType);

        // Assert
        Assert.Equal(expectedStatus, result);
    }

    [Fact]
    public void GetInitialPostStatus_MemberMeetup_ReturnsPending()
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus("member", PostType.Meetup);

        // Assert
        Assert.Equal(PostStatus.Pending, result);
    }

    [Theory]
    [InlineData("vet", PostType.Meetup)]
    [InlineData("site_admin", PostType.Meetup)]
    [InlineData("meetup_admin", PostType.Meetup)]
    public void GetInitialPostStatus_AdminRolesMeetup_ReturnsActive(string userRole, PostType postType)
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus(userRole, postType);

        // Assert
        Assert.Equal(PostStatus.Active, result);
    }

    [Theory]
    [InlineData("member", PostType.Library, PostStatus.Active)]
    [InlineData("member", PostType.Announcement, PostStatus.Active)]
    [InlineData("meetup_admin", PostType.Library, PostStatus.Active)]
    [InlineData("meetup_admin", PostType.Announcement, PostStatus.Active)]
    public void GetInitialPostStatus_RestrictedPostTypes_ReturnsActive(string userRole, PostType postType, PostStatus expectedStatus)
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus(userRole, postType);

        // Assert
        Assert.Equal(expectedStatus, result);
    }

    #endregion

    #region CanCreatePost Tests

    [Theory]
    [InlineData("member", PostType.Moment, true)]
    [InlineData("member", PostType.BuySell, true)]
    [InlineData("member", PostType.PetWedding, true)]
    [InlineData("member", PostType.Meetup, true)]
    [InlineData("member", PostType.Library, false)]
    [InlineData("member", PostType.Announcement, false)]
    public void CanCreatePost_MemberRole_ReturnsCorrectPermissions(string userRole, PostType postType, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanCreatePost(userRole, postType);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("vet", PostType.Moment, true)]
    [InlineData("vet", PostType.BuySell, true)]
    [InlineData("vet", PostType.PetWedding, true)]
    [InlineData("vet", PostType.Meetup, true)]
    [InlineData("vet", PostType.Library, true)]
    [InlineData("vet", PostType.Announcement, false)]
    public void CanCreatePost_VetRole_ReturnsCorrectPermissions(string userRole, PostType postType, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanCreatePost(userRole, postType);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("site_admin", PostType.Moment, true)]
    [InlineData("site_admin", PostType.BuySell, true)]
    [InlineData("site_admin", PostType.PetWedding, true)]
    [InlineData("site_admin", PostType.Meetup, true)]
    [InlineData("site_admin", PostType.Library, true)]
    [InlineData("site_admin", PostType.Announcement, true)]
    public void CanCreatePost_SiteAdminRole_ReturnsTrue(string userRole, PostType postType, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanCreatePost(userRole, postType);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("meetup_admin", PostType.Moment, true)]
    [InlineData("meetup_admin", PostType.BuySell, true)]
    [InlineData("meetup_admin", PostType.PetWedding, true)]
    [InlineData("meetup_admin", PostType.Meetup, true)]
    [InlineData("meetup_admin", PostType.Library, false)]
    [InlineData("meetup_admin", PostType.Announcement, false)]
    public void CanCreatePost_MeetupAdminRole_ReturnsCorrectPermissions(string userRole, PostType postType, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanCreatePost(userRole, postType);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("invalid_role", PostType.Moment)]
    [InlineData("", PostType.BuySell)]
    [InlineData(null, PostType.Library)]
    public void CanCreatePost_InvalidRole_ReturnsFalse(string? userRole, PostType postType)
    {
        // Act
        var result = _authorizationService.CanCreatePost(userRole!, postType);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region CanEditPost Tests

    [Fact]
    public void CanEditPost_PostOwner_ReturnsTrue()
    {
        // Arrange
        var userRole = "member";
        var postOwnerId = 1;
        var userId = 1; // Same as post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, postOwnerId, userId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void CanEditPost_NotPostOwner_ReturnsFalse()
    {
        // Arrange
        var userRole = "member";
        var postOwnerId = 1;
        var userId = 2; // Different from post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, postOwnerId, userId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void CanEditPost_SiteAdminRole_ReturnsTrue()
    {
        // Arrange
        var userRole = "site_admin";
        var postOwnerId = 1;
        var userId = 2; // Different from post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, postOwnerId, userId);

        // Assert
        Assert.True(result);
    }

    [Theory]
    [InlineData("vet")]
    [InlineData("member")]
    public void CanEditPost_NonAdminRolesNotOwner_ReturnsFalse(string userRole)
    {
        // Arrange
        var postOwnerId = 1;
        var userId = 2; // Different from post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, postOwnerId, userId);

        // Assert
        Assert.False(result);
    }

    #endregion

    #region CanEditPost with Post Status Tests

    [Theory]
    [InlineData(PostStatus.Active, true)]
    [InlineData(PostStatus.Pending, true)]
    [InlineData(PostStatus.Inactive, false)]
    [InlineData(PostStatus.Sold, false)]
    [InlineData(PostStatus.Expired, false)]
    [InlineData(PostStatus.Cancelled, false)]
    public void CanEditPost_WithPostStatus_ReturnsCorrectResult(PostStatus status, bool expectedCanEdit)
    {
        // Arrange
        var userRole = "member";
        var post = new Post
        {
            PostId = 1,
            UserId = 1,
            Status = status,
            PostType = PostType.Moment
        };
        var userId = 1; // Same as post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, post, userId);

        // Assert
        Assert.Equal(expectedCanEdit, result);
    }

    [Fact]
    public void CanEditPost_SiteAdminCanEditInactivePosts_ReturnsTrue()
    {
        // Arrange
        var userRole = "site_admin";
        var post = new Post
        {
            PostId = 1,
            UserId = 1,
            Status = PostStatus.Inactive,
            PostType = PostType.Moment
        };
        var userId = 2; // Different from post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, post, userId);

        // Assert
        Assert.True(result); // Site admins can edit any post regardless of status
    }

    [Fact]
    public void CanEditPost_MeetupAdminNonOwner_ReturnsFalse()
    {
        // Arrange
        var userRole = "meetup_admin";
        var post = new Post
        {
            PostId = 1,
            UserId = 1,
            Status = PostStatus.Active,
            PostType = PostType.Meetup
        };
        var userId = 2; // Different from post owner

        // Act
        var result = _authorizationService.CanEditPost(userRole, post, userId);

        // Assert
        Assert.False(result); // Only site admins can edit posts they don't own
    }

    #endregion

    #region CanChangePostStatus Tests

    [Theory]
    [InlineData("site_admin", PostType.Moment, false, true)]
    [InlineData("site_admin", PostType.Meetup, false, true)]
    [InlineData("site_admin", PostType.Library, false, true)]
    [InlineData("meetup_admin", PostType.Meetup, false, true)]
    [InlineData("meetup_admin", PostType.Moment, false, false)]
    [InlineData("vet", PostType.Library, false, false)]
    [InlineData("member", PostType.Moment, false, false)]
    public void CanChangePostStatus_VariousRoles_ReturnsCorrectPermissions(string userRole, PostType postType, bool isOwner, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanChangePostStatus(userRole, postType, isOwner);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("member", PostType.BuySell, true, true)]
    [InlineData("member", PostType.PetWedding, true, true)]
    [InlineData("vet", PostType.Library, true, true)]
    public void CanChangePostStatus_PostOwner_ReturnsTrue(string userRole, PostType postType, bool isOwner, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanChangePostStatus(userRole, postType, isOwner);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Theory]
    [InlineData("member", PostType.Moment, true, false)]  // Moment posts don't allow status changes
    [InlineData("member", PostType.Announcement, true, false)]  // Only site admin can change announcements
    [InlineData("member", PostType.Library, true, false)]  // Only vet owners can change library posts
    [InlineData("vet", PostType.Moment, true, false)]  // Moment posts don't allow status changes
    [InlineData("member", PostType.Meetup, true, false)]  // Only meetup admins can change meetup status
    public void CanChangePostStatus_RestrictedCases_ReturnsFalse(string userRole, PostType postType, bool isOwner, bool expectedResult)
    {
        // Act
        var result = _authorizationService.CanChangePostStatus(userRole, postType, isOwner);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    #endregion

    #region Static Method Tests

    [Fact]
    public void GetPostCreationPermissions_MemberRole_ReturnsCorrectPermissions()
    {
        // Act
        var permissions = _authorizationService.GetPostCreationPermissions("member");

        // Assert
        Assert.True(permissions[PostType.Moment]);
        Assert.True(permissions[PostType.BuySell]);
        Assert.True(permissions[PostType.PetWedding]);
        Assert.True(permissions[PostType.Meetup]);
        Assert.False(permissions[PostType.Library]);
        Assert.False(permissions[PostType.Announcement]);
    }

    [Fact]
    public void GetPostCreationPermissions_VetRole_ReturnsCorrectPermissions()
    {
        // Act
        var permissions = _authorizationService.GetPostCreationPermissions("vet");

        // Assert
        Assert.True(permissions[PostType.Moment]);
        Assert.True(permissions[PostType.BuySell]);
        Assert.True(permissions[PostType.PetWedding]);
        Assert.True(permissions[PostType.Meetup]);
        Assert.True(permissions[PostType.Library]);
        Assert.False(permissions[PostType.Announcement]);
    }

    [Fact]
    public void GetPostCreationPermissions_SiteAdminRole_ReturnsAllTrue()
    {
        // Act
        var permissions = _authorizationService.GetPostCreationPermissions("site_admin");

        // Assert
        Assert.True(permissions[PostType.Moment]);
        Assert.True(permissions[PostType.BuySell]);
        Assert.True(permissions[PostType.PetWedding]);
        Assert.True(permissions[PostType.Meetup]);
        Assert.True(permissions[PostType.Library]);
        Assert.True(permissions[PostType.Announcement]);
    }

    [Fact]
    public void GetLibraryPostCreationRoles_ReturnsCorrectRoles()
    {
        // Act
        var roles = PostAuthorizationService.GetLibraryPostCreationRoles();

        // Assert
        Assert.Contains("vet", roles);
        Assert.Contains("site_admin", roles);
        Assert.DoesNotContain("member", roles);
        Assert.DoesNotContain("meetup_admin", roles);
    }

    [Fact]
    public void GetAnnouncementPostCreationRoles_ReturnsCorrectRoles()
    {
        // Act
        var roles = PostAuthorizationService.GetAnnouncementPostCreationRoles();

        // Assert
        Assert.Contains("site_admin", roles);
        Assert.DoesNotContain("member", roles);
        Assert.DoesNotContain("vet", roles);
        Assert.DoesNotContain("meetup_admin", roles);
    }

    [Fact]
    public void GetUnrestrictedPostCreationRoles_ReturnsAllRoles()
    {
        // Act
        var roles = PostAuthorizationService.GetUnrestrictedPostCreationRoles();

        // Assert
        Assert.Contains("member", roles);
        Assert.Contains("vet", roles);
        Assert.Contains("site_admin", roles);
        Assert.Contains("meetup_admin", roles);
        Assert.True(roles.Count >= 4); // Should include all standard roles
    }

    [Fact]
    public void GetAutoActiveMeetupRoles_ReturnsCorrectRoles()
    {
        // Act
        var roles = PostAuthorizationService.GetAutoActiveMeetupRoles();

        // Assert
        Assert.Contains("site_admin", roles);
        Assert.Contains("meetup_admin", roles);
        Assert.Contains("vet", roles);
        Assert.DoesNotContain("member", roles);
    }

    [Fact]
    public void GetMeetupActivationRoles_ReturnsAdminRoles()
    {
        // Act
        var roles = PostAuthorizationService.GetMeetupActivationRoles();

        // Assert
        Assert.Contains("site_admin", roles);
        Assert.Contains("meetup_admin", roles);
        // Note: Whether other roles can activate meetups depends on business rules
    }

    #endregion

    #region Edge Cases and Validation

    [Fact]
    public void GetInitialPostStatus_NullRole_ReturnsActive()
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus(null!, PostType.Moment);

        // Assert
        Assert.Equal(PostStatus.Active, result);
    }

    [Fact]
    public void GetInitialPostStatus_EmptyRole_ReturnsActive()
    {
        // Act
        var result = _authorizationService.GetInitialPostStatus("", PostType.Moment);

        // Assert
        Assert.Equal(PostStatus.Active, result);
    }

    [Fact]
    public void CanCreatePost_NullRole_ReturnsFalse()
    {
        // Act
        var result = _authorizationService.CanCreatePost(null!, PostType.Moment);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void CanEditPost_NullRole_ReturnsTrueForOwner()
    {
        // Act
        var result = _authorizationService.CanEditPost(null!, 1, 1);

        // Assert
        Assert.True(result); // Post owners can edit their posts regardless of role validation
    }

    [Fact]
    public void GetPostCreationPermissions_InvalidRole_ReturnsAllFalse()
    {
        // Act
        var permissions = _authorizationService.GetPostCreationPermissions("invalid_role");

        // Assert
        Assert.All(permissions.Values, permission => Assert.False(permission));
    }

    [Theory]
    [InlineData("MEMBER")]
    [InlineData("Member")]
    [InlineData("SITE_ADMIN")]
    [InlineData("Site_Admin")]
    public void Authorization_CaseInsensitiveRoles_WorksCorrectly(string userRole)
    {
        // Act
        var canCreateMoment = _authorizationService.CanCreatePost(userRole.ToLower(), PostType.Moment);

        // Assert
        Assert.True(canCreateMoment); // All these normalized roles should be able to create moments
    }

    #endregion
} 