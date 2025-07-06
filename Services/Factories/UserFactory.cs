using PetWhenua.Models.Dtos;

namespace PetWhenua.Services.Factories
{
    public class UserFactory : IUserFactory
    {
        public User CreateUser(RegisterRequestDto request, string passwordHash)
        {
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PhoneNumber = request.PhoneNumber,
                Location = request.Location,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Role = "member"
            };

            ValidateUserForCreation(user);
            return user;
        }

        public User CreateUser(string username, string email, string passwordHash, string? firstName = null, string? lastName = null)
        {
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                FirstName = firstName,
                LastName = lastName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Role = "member"
            };

            ValidateUserForCreation(user);
            return user;
        }

        public User CreateUserFromExisting(User existingUser, User updatedUser)
        {
            if (!ValidateUserForUpdate(existingUser, updatedUser))
            {
                throw new InvalidOperationException("Invalid user update data.");
            }

            // Update properties while preserving certain fields
            existingUser.Username = updatedUser.Username;
            existingUser.Email = updatedUser.Email;
            existingUser.FirstName = updatedUser.FirstName;
            existingUser.LastName = updatedUser.LastName;
            existingUser.ProfilePicture = updatedUser.ProfilePicture;
            existingUser.Bio = updatedUser.Bio;
            existingUser.Location = updatedUser.Location;
            existingUser.PhoneNumber = updatedUser.PhoneNumber;
            existingUser.Role = updatedUser.Role;
            existingUser.IsActive = updatedUser.IsActive;
            existingUser.UpdatedAt = DateTime.UtcNow;

            // Don't update: UserId, PasswordHash, CreatedAt, Pets, Posts

            return existingUser;
        }

        public User CreateDeactivatedUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            return user;
        }

        public User CreateActivatedUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            return user;
        }

        public bool ValidateUserForCreation(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (string.IsNullOrWhiteSpace(user.Username))
                throw new ArgumentException("Username cannot be empty.", nameof(user.Username));

            if (string.IsNullOrWhiteSpace(user.Email))
                throw new ArgumentException("Email cannot be empty.", nameof(user.Email));

            if (string.IsNullOrWhiteSpace(user.PasswordHash))
                throw new ArgumentException("Password hash cannot be empty.", nameof(user.PasswordHash));

            if (user.Username.Length < 3 || user.Username.Length > 50)
                throw new ArgumentException("Username must be between 3 and 50 characters.", nameof(user.Username));

            if (user.Email.Length > 100)
                throw new ArgumentException("Email cannot exceed 100 characters.", nameof(user.Email));

            // Basic email validation (more comprehensive validation should be done at the model level)
            if (!user.Email.Contains("@") || !user.Email.Contains("."))
                throw new ArgumentException("Invalid email format.", nameof(user.Email));

            return true;
        }

        public bool ValidateUserForUpdate(User existingUser, User updatedUser)
        {
            if (existingUser == null)
                throw new ArgumentNullException(nameof(existingUser));

            if (updatedUser == null)
                throw new ArgumentNullException(nameof(updatedUser));

            // Ensure UserId matches
            if (existingUser.UserId != updatedUser.UserId)
                throw new ArgumentException("User IDs do not match.", nameof(updatedUser.UserId));

            // Validate new username if changed
            if (!string.IsNullOrWhiteSpace(updatedUser.Username))
            {
                if (updatedUser.Username.Length < 3 || updatedUser.Username.Length > 50)
                    throw new ArgumentException("Username must be between 3 and 50 characters.", nameof(updatedUser.Username));
            }

            // Validate new email if changed
            if (!string.IsNullOrWhiteSpace(updatedUser.Email))
            {
                if (updatedUser.Email.Length > 100)
                    throw new ArgumentException("Email cannot exceed 100 characters.", nameof(updatedUser.Email));

                if (!updatedUser.Email.Contains("@") || !updatedUser.Email.Contains("."))
                    throw new ArgumentException("Invalid email format.", nameof(updatedUser.Email));
            }

            return true;
        }
    }
}
