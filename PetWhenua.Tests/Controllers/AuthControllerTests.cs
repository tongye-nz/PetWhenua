using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using PetWhenua.Controllers;
using PetWhenua.Services;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _mockAuthService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
    }

    [Fact]
    public async Task Register_ValidRequest_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "TestPass123!",
            FirstName = "Test",
            LastName = "User"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "fake-jwt-token",
            Expires = DateTime.UtcNow.AddDays(1),
            User = new UserDto
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@example.com",
                FirstName = "Test",
                LastName = "User"
            }
        };

        _mockAuthService.Setup(x => x.RegisterAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal(expectedResponse.Token, response.Token);
        Assert.Equal(expectedResponse.User.Username, response.User.Username);
        Assert.Equal(expectedResponse.User.Email, response.User.Email);
    }

    [Fact]
    public async Task Register_InvalidOperationException_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Username = "existinguser",
            Email = "existing@example.com",
            Password = "TestPass123!",
            FirstName = "Test",
            LastName = "User"
        };

        var exceptionMessage = "Username already exists";
        _mockAuthService.Setup(x => x.RegisterAsync(request))
            .ThrowsAsync(new InvalidOperationException(exceptionMessage));

        // Act
        var result = await _controller.Register(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(exceptionMessage, badRequestResult.Value);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithAuthResponse()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "TestPass123!"
        };

        var expectedResponse = new AuthResponseDto
        {
            Token = "fake-jwt-token",
            Expires = DateTime.UtcNow.AddDays(1),
            User = new UserDto
            {
                UserId = 1,
                Username = "testuser",
                Email = "test@example.com"
            }
        };

        _mockAuthService.Setup(x => x.LoginAsync(request))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(okResult.Value);
        Assert.Equal(expectedResponse.Token, response.Token);
        Assert.Equal(expectedResponse.User.Username, response.User.Username);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "wrongpassword"
        };

        var exceptionMessage = "Invalid username/email or password.";
        _mockAuthService.Setup(x => x.LoginAsync(request))
            .ThrowsAsync(new UnauthorizedAccessException(exceptionMessage));

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(exceptionMessage, unauthorizedResult.Value);
    }

    [Fact]
    public async Task Login_AccountDeactivated_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "TestPass123!"
        };

        var exceptionMessage = "Account is deactivated. Please contact support.";
        _mockAuthService.Setup(x => x.LoginAsync(request))
            .ThrowsAsync(new UnauthorizedAccessException(exceptionMessage));

        // Act
        var result = await _controller.Login(request);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(exceptionMessage, unauthorizedResult.Value);
    }

    [Theory]
    [MemberData(nameof(GetInvalidRegisterRequests))]
    public async Task Register_InvalidModelState_ReturnsBadRequest(RegisterRequestDto request)
    {
        // Arrange
        _controller.ModelState.AddModelError("Username", "Username is required");

        // Act
        var result = await _controller.Register(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [MemberData(nameof(GetInvalidLoginRequests))]
    public async Task Login_InvalidModelState_ReturnsBadRequest(LoginRequestDto request)
    {
        // Arrange
        _controller.ModelState.AddModelError("UsernameOrEmail", "Username or Email is required");

        // Act
        var result = await _controller.Login(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    public static IEnumerable<object[]> GetInvalidRegisterRequests()
    {
        yield return new object[] { new RegisterRequestDto { Username = "", Email = "test@example.com", Password = "TestPass123!", FirstName = "Test", LastName = "User" } };
        yield return new object[] { new RegisterRequestDto { Username = "test", Email = "", Password = "TestPass123!", FirstName = "Test", LastName = "User" } };
        yield return new object[] { new RegisterRequestDto { Username = "test", Email = "test@example.com", Password = "", FirstName = "Test", LastName = "User" } };
    }

    public static IEnumerable<object[]> GetInvalidLoginRequests()
    {
        yield return new object[] { new LoginRequestDto { UsernameOrEmail = "", Password = "TestPass123!" } };
        yield return new object[] { new LoginRequestDto { UsernameOrEmail = "test", Password = "" } };
    }
} 