using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using PetWhenua.Services;
using PetWhenua.Models;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<IUserService> _mockUserService;
    private readonly AuthService _authService;
    private readonly Mock<IConfigurationSection> _mockJwtSection;

    public AuthServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        _mockUserService = new Mock<IUserService>();
        _mockJwtSection = new Mock<IConfigurationSection>();
        
        SetupJwtConfiguration();
        _authService = new AuthService(_mockConfiguration.Object, _mockUserService.Object);
    }

    private void SetupJwtConfiguration()
    {
        _mockJwtSection.Setup(x => x["SecretKey"]).Returns("TestSecretKey123456789TestSecretKey123456789");
        _mockJwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
        _mockJwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
        _mockJwtSection.Setup(x => x["ExpirationMinutes"]).Returns("60");
        
        _mockConfiguration.Setup(x => x.GetSection("JwtSettings")).Returns(_mockJwtSection.Object);
    }

    [Fact]
    public void HashPassword_ValidPassword_ReturnsHashedPassword()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var hashedPassword = _authService.HashPassword(password);

        // Assert
        Assert.NotNull(hashedPassword);
        Assert.NotEqual(password, hashedPassword);
        Assert.True(hashedPassword.Length > 0);
    }

    [Fact]
    public void VerifyPassword_CorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "TestPassword123!";
        var hashedPassword = _authService.HashPassword(password);

        // Act
        var result = _authService.VerifyPassword(password, hashedPassword);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_IncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var password = "TestPassword123!";
        var wrongPassword = "WrongPassword123!";
        var hashedPassword = _authService.HashPassword(password);

        // Act
        var result = _authService.VerifyPassword(wrongPassword, hashedPassword);

        // Assert
        Assert.False(result);
    }

    [Theory]
    [InlineData("", "Password is required.")]
    [InlineData("short", "Password must be at least 8 characters long.")]
    [InlineData("nouppercase123!", "Password must contain at least one uppercase letter.")]
    [InlineData("NOLOWERCASE123!", "Password must contain at least one lowercase letter.")]
    [InlineData("NoNumber!", "Password must contain at least one number.")]
    public void ValidatePassword_InvalidPassword_ThrowsArgumentException(string password, string expectedMessage)
    {
        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => _authService.ValidatePassword(password));
        Assert.Equal(expectedMessage, exception.Message);
    }

    [Fact]
    public void ValidatePassword_ValidPassword_DoesNotThrow()
    {
        // Arrange
        var validPassword = "ValidPass123!";

        // Act & Assert
        var exception = Record.Exception(() => _authService.ValidatePassword(validPassword));
        Assert.Null(exception);
    }

    [Fact]
    public void GenerateJwtToken_ValidUser_ReturnsToken()
    {
        // Arrange
        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            Role = "user"
        };

        // Act
        var token = _authService.GenerateJwtToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.True(token.Length > 0);
        Assert.Contains(".", token); // JWT format check
    }

    [Fact]
    public void MapToUserDto_ValidUser_ReturnsCorrectDto()
    {
        // Arrange
        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            ProfilePicture = "profile.jpg",
            Bio = "Test bio",
            Location = "Test Location",
            PhoneNumber = "123456789",
            CreatedAt = DateTime.UtcNow,
            Role = "user"
        };

        // Act
        var userDto = _authService.MapToUserDto(user);

        // Assert
        Assert.Equal(user.UserId, userDto.UserId);
        Assert.Equal(user.Username, userDto.Username);
        Assert.Equal(user.Email, userDto.Email);
        Assert.Equal(user.FirstName, userDto.FirstName);
        Assert.Equal(user.LastName, userDto.LastName);
        Assert.Equal(user.ProfilePicture, userDto.ProfilePicture);
        Assert.Equal(user.Bio, userDto.Bio);
        Assert.Equal(user.Location, userDto.Location);
        Assert.Equal(user.PhoneNumber, userDto.PhoneNumber);
        Assert.Equal(user.CreatedAt, userDto.CreatedAt);
        Assert.Equal(user.Role, userDto.Role);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_ReturnsAuthResponse()
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

        var createdUser = new User
        {
            UserId = 1,
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = "user",
            CreatedAt = DateTime.UtcNow
        };

        _mockUserService.Setup(x => x.CreateUserFromRegistrationAsync(request, It.IsAny<string>()))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
        Assert.Equal(request.Username, result.User.Username);
        Assert.Equal(request.Email, result.User.Email);
        Assert.True(result.Expires > DateTime.UtcNow);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "TestPass123!"
        };

        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = _authService.HashPassword(request.Password),
            IsActive = true,
            Role = "user"
        };

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(request.UsernameOrEmail))
            .ReturnsAsync(user);
        _mockUserService.Setup(x => x.UpdateLastLoginAsync(user.UserId))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Token);
        Assert.Equal(user.Username, result.User.Username);
        Assert.Equal(user.Email, result.User.Email);
        _mockUserService.Verify(x => x.UpdateLastLoginAsync(user.UserId), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_InvalidCredentials_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "WrongPassword123!"
        };

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(request.UsernameOrEmail))
            .ReturnsAsync((User?)null);
        _mockUserService.Setup(x => x.GetUserByEmailAsync(request.UsernameOrEmail))
            .ReturnsAsync((User?)null);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange
        var request = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "TestPass123!"
        };

        var user = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = _authService.HashPassword(request.Password),
            IsActive = false,
            Role = "user"
        };

        _mockUserService.Setup(x => x.GetUserByUsernameAsync(request.UsernameOrEmail))
            .ReturnsAsync(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _authService.LoginAsync(request));
        Assert.Contains("Account is deactivated", exception.Message);
    }

    [Fact]
    public async Task ChangePasswordAsync_ValidRequest_ReturnsTrue()
    {
        // Arrange
        var userId = 1;
        var currentPassword = "CurrentPass123!";
        var newPassword = "NewPassword123!";

        var user = new User
        {
            UserId = userId,
            PasswordHash = _authService.HashPassword(currentPassword)
        };

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, false, false))
            .ReturnsAsync(user);
        _mockUserService.Setup(x => x.UpdateUserAsync(It.IsAny<User>()))
            .ReturnsAsync(user);

        // Act
        var result = await _authService.ChangePasswordAsync(userId, currentPassword, newPassword);

        // Assert
        Assert.True(result);
        _mockUserService.Verify(x => x.UpdateUserAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_SamePassword_ThrowsArgumentException()
    {
        // Arrange
        var userId = 1;
        var password = "SamePassword123!";

        var user = new User
        {
            UserId = userId,
            PasswordHash = _authService.HashPassword(password)
        };

        _mockUserService.Setup(x => x.GetUserByIdAsync(userId, false, false))
            .ReturnsAsync(user);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => 
            _authService.ChangePasswordAsync(userId, password, password));
        Assert.Contains("New password must be different", exception.Message);
    }
} 