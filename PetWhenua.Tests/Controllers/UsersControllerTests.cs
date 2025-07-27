using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using PetWhenua.Services;
using PetWhenua.Models;

namespace PetWhenua.Tests.Controllers;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly Mock<IImageService> _mockImageService;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _mockImageService = new Mock<IImageService>();
        _controller = new UsersController(_mockUserService.Object, _mockImageService.Object);
    }

    [Fact]
    public async Task GetUsers_WithoutParameters_ReturnsOkWithUsers()
    {
        // Arrange
        var expectedUsers = new List<User>
        {
            new User { UserId = 1, Username = "user1", Email = "user1@example.com" },
            new User { UserId = 2, Username = "user2", Email = "user2@example.com" }
        };

        _mockUserService.Setup(x => x.GetUsersAsync(false, false))
            .ReturnsAsync(expectedUsers);

        // Act
        var result = await _controller.GetUsers();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);
        Assert.Equal(expectedUsers.Count, users.Count());
    }

    [Fact]
    public async Task GetUsers_WithIncludeParameters_ReturnsOkWithUsers()
    {
        // Arrange
        var expectedUsers = new List<User>
        {
            new User { UserId = 1, Username = "user1", Email = "user1@example.com" }
        };

        _mockUserService.Setup(x => x.GetUsersAsync(true, true))
            .ReturnsAsync(expectedUsers);

        // Act
        var result = await _controller.GetUsers(true, true);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);
        Assert.Single(users);
        _mockUserService.Verify(x => x.GetUsersAsync(true, true), Times.Once);
    }

    [Fact]
    public async Task GetUser_ExistingUser_ReturnsOkWithUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User
        {
            UserId = userId,
            Username = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User"
        };

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, false, false))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(expectedUser.UserId, user.UserId);
        Assert.Equal(expectedUser.Username, user.Username);
    }

    [Fact]
    public async Task GetUser_NonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var userId = 999;

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, false, false))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"User with ID {userId} not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task GetUserByUsername_ExistingUser_ReturnsOkWithUser()
    {
        // Arrange
        var username = "testuser";
        var expectedUser = new User
        {
            UserId = 1,
            Username = username,
            Email = "test@example.com"
        };

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUserByUsername(username);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(expectedUser.Username, user.Username);
    }

    [Fact]
    public async Task GetUserByUsername_NonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var username = "nonexistentuser";

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetUserByUsername(username);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"User with username '{username}' not found", notFoundResult.Value?.ToString());
    }

    [Fact]
    public async Task GetUserByEmail_ExistingUser_ReturnsOkWithUser()
    {
        // Arrange
        var email = "test@example.com";
        var expectedUser = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = email
        };

        _mockUserService.Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUserByEmail(email);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(expectedUser.Email, user.Email);
    }

    [Fact]
    public async Task GetUserByEmail_NonExistingUser_ReturnsNotFound()
    {
        // Arrange
        var email = "nonexistent@example.com";

        _mockUserService.Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _controller.GetUserByEmail(email);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains($"User with email '{email}' not found", notFoundResult.Value?.ToString());
    }

    [Theory]
    [InlineData(1, "user1", "user1@example.com")]
    [InlineData(2, "user2", "user2@example.com")]
    [InlineData(3, "user3", "user3@example.com")]
    public async Task GetUser_DifferentUsers_ReturnsCorrectUser(int userId, string username, string email)
    {
        // Arrange
        var expectedUser = new User
        {
            UserId = userId,
            Username = username,
            Email = email
        };

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, false, false))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUser(userId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(userId, user.UserId);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
    }

    [Fact]
    public async Task GetUser_WithIncludeParameters_CallsServiceWithCorrectParameters()
    {
        // Arrange
        var userId = 1;
        var includePets = true;
        var includePosts = true;
        var expectedUser = new User { UserId = userId, Username = "testuser" };

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, includePets, includePosts))
            .ReturnsAsync(expectedUser);

        // Act
        await _controller.GetUser(userId, includePets, includePosts);

        // Assert
        _mockUserService.Verify(x => x.GetUserByIdAsync(userId, includePets, includePosts), Times.Once);
    }

    [Theory]
    [InlineData("testuser")]
    [InlineData("test.user")]
    [InlineData("test_user")]
    [InlineData("testuser123")]
    public async Task GetUserByUsername_ValidUsernames_ReturnsUser(string username)
    {
        // Arrange
        var expectedUser = new User
        {
            UserId = 1,
            Username = username,
            Email = "test@example.com"
        };

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(username))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUserByUsername(username);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(username, user.Username);
    }

    [Theory]
    [InlineData("test@example.com")]
    [InlineData("user.name@domain.co.nz")]
    [InlineData("test123@test.com")]
    public async Task GetUserByEmail_ValidEmails_ReturnsUser(string email)
    {
        // Arrange
        var expectedUser = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = email
        };

        _mockUserService.Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _controller.GetUserByEmail(email);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);
        Assert.Equal(email, user.Email);
    }
} 