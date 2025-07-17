using Microsoft.EntityFrameworkCore;
using PetWhenua.Models.Dtos;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserFactory _userFactory;

        public UserService(IUserRepository userRepository, IUserFactory userFactory)
        {
            _userRepository = userRepository;
            _userFactory = userFactory;
        }

        public async Task<IEnumerable<User>> GetUsersAsync(bool includePets = false, bool includePosts = false)
        {
            return await _userRepository.GetAllUsersAsync(includePets, includePosts);
        }

        public async Task<User?> GetUserByIdAsync(int id, bool includePets = false, bool includePosts = false)
        {
            return await _userRepository.GetUserByIdAsync(id, includePets, includePosts);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _userRepository.GetUserByUsernameAsync(username);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _userRepository.GetUserByEmailAsync(email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            // Check if username already exists
            if (await _userRepository.UsernameExistsAsync(user.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email already exists
            if (await _userRepository.EmailExistsAsync(user.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            // Validate user using factory
            _userFactory.ValidateUserForCreation(user);

            // Set timestamps
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            return await _userRepository.AddUserAsync(user);
        }

        public async Task<User> CreateUserFromRegistrationAsync(RegisterRequestDto request, string passwordHash)
        {
            // Check if username already exists
            if (await _userRepository.UsernameExistsAsync(request.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email already exists
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            // Create user using factory
            var user = _userFactory.CreateUser(request, passwordHash);

            return await _userRepository.AddUserAsync(user);
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            var existingUser = await _userRepository.GetUserByIdAsync(user.UserId);
            if (existingUser == null)
            {
                throw new InvalidOperationException($"User with ID {user.UserId} not found.");
            }

            // Check if username is being changed and if it already exists
            if (existingUser.Username != user.Username && await _userRepository.UsernameExistsAsync(user.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email is being changed and if it already exists
            if (existingUser.Email != user.Email && await _userRepository.EmailExistsAsync(user.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            // Use factory to create updated user
            var updatedUser = _userFactory.CreateUserFromExisting(existingUser, user);

            return await _userRepository.UpdateUserAsync(updatedUser);
        }

        public async Task<User> DeactivateUserAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException($"User with ID {id} not found.");
            }

            // Use factory to create deactivated user
            var deactivatedUser = _userFactory.CreateDeactivatedUser(user);

            return await _userRepository.UpdateUserAsync(deactivatedUser);
        }

        public async Task<User> ActivateUserAsync(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);
            if (user == null)
            {
                throw new InvalidOperationException($"User with ID {id} not found.");
            }

            // Use factory to create activated user
            var activatedUser = _userFactory.CreateActivatedUser(user);

            return await _userRepository.UpdateUserAsync(activatedUser);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            return await _userRepository.DeleteUserAsync(id);
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            return await _userRepository.UserExistsAsync(id);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _userRepository.UsernameExistsAsync(username);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userRepository.EmailExistsAsync(email);
        }

        public async Task<IEnumerable<User>> SearchUsersAsync(string query, int limit = 10)
        {
            return await _userRepository.SearchUsersAsync(query, limit);
        }
    }
}
