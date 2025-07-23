using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using PetWhenua.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace PetWhenua.Services
{
    public interface IAuthService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        void ValidatePassword(string password);
        string GenerateJwtToken(User user);
        UserDto MapToUserDto(User user);
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
        Task<User?> GetUserByTokenAsync(string userId);
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;

        public AuthService(IConfiguration configuration, IUserService userService)
        {
            _configuration = configuration;
            _userService = userService;
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt());
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

        public void ValidatePassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password is required.");
            }

            if (password.Length < 8)
            {
                throw new ArgumentException("Password must be at least 8 characters long.");
            }

            if (password.Length > 100)
            {
                throw new ArgumentException("Password must be less than 100 characters long.");
            }

            // Check for required character types
            bool hasUpperCase = password.Any(char.IsUpper);
            bool hasLowerCase = password.Any(char.IsLower);
            bool hasNumber = password.Any(char.IsDigit);

            if (!hasUpperCase)
            {
                throw new ArgumentException("Password must contain at least one uppercase letter.");
            }

            if (!hasLowerCase)
            {
                throw new ArgumentException("Password must contain at least one lowercase letter.");
            }

            if (!hasNumber)
            {
                throw new ArgumentException("Password must contain at least one number.");
            }

            // Check for allowed characters only (letters, numbers, and specific special characters)
            string allowedSpecialChars = "!@#$%*-_+=";
            bool hasInvalidChars = password.Any(c => 
                !char.IsLetterOrDigit(c) && !allowedSpecialChars.Contains(c));

            if (hasInvalidChars)
            {
                throw new ArgumentException("Password can only contain letters, numbers, and these special characters: !@#$%*-_+=");
            }
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "YourDefaultSecretKeyHere123456789";
            var issuer = jwtSettings["Issuer"] ?? "PetWhenuaApp";
            var audience = jwtSettings["Audience"] ?? "PetWhenuaUsers";
            var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440"); // 24 hours default

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfilePicture = user.ProfilePicture,
                Bio = user.Bio,
                Location = user.Location,
                PhoneNumber = user.PhoneNumber,
                CreatedAt = user.CreatedAt,
                Role = user.Role
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Validate password before proceeding
            ValidatePassword(request.Password);

            // Use UserService to create user from registration (includes validation)
            var passwordHash = HashPassword(request.Password);
            var user = await _userService.CreateUserFromRegistrationAsync(request, passwordHash);

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddDays(1), // 24 hours
                User = userDto
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            // Find user by username or email using UserService
            var user = await _userService.GetUserByUsernameAsync(request.UsernameOrEmail) ??
                       await _userService.GetUserByEmailAsync(request.UsernameOrEmail);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid username/email or password.");
            }

            // Check if user is active
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Account is deactivated. Please contact support.");
            }

            // Verify password
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid username/email or password.");
            }

            // Update last login time
            await _userService.UpdateLastLoginAsync(user.UserId);

            // Generate JWT token
            var token = GenerateJwtToken(user);
            var userDto = MapToUserDto(user);

            return new AuthResponseDto
            {
                Token = token,
                Expires = DateTime.UtcNow.AddDays(1), // 24 hours
                User = userDto
            };
        }

        public async Task<User?> GetUserByTokenAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
            {
                return null;
            }

            var user = await _userService.GetUserByIdAsync(id);
            return user?.IsActive == true ? user : null;
        }

        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            // Get the user
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            // Verify current password
            if (!VerifyPassword(currentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Current password is incorrect.");
            }

            // Validate new password
            ValidatePassword(newPassword);

            // Ensure new password is different from current password
            if (VerifyPassword(newPassword, user.PasswordHash))
            {
                throw new ArgumentException("New password must be different from your current password.");
            }

            // Hash new password and update user
            var newPasswordHash = HashPassword(newPassword);
            user.PasswordHash = newPasswordHash;
            user.UpdatedAt = DateTime.UtcNow;

            await _userService.UpdateUserAsync(user);
            return true;
        }
    }
} 