using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetUsersAsync(bool includePets = false, bool includePosts = false);
        Task<User?> GetUserByIdAsync(int id, bool includePets = false, bool includePosts = false);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task<User> CreateUserFromRegistrationAsync(RegisterRequestDto request, string passwordHash);
        Task<User> UpdateUserAsync(User user);
        Task<User> DeactivateUserAsync(int id);
        Task<User> ActivateUserAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UserExistsAsync(int id);
        Task<bool> UsernameExistsAsync(string username);
        Task<bool> EmailExistsAsync(string email);
        Task<IEnumerable<User>> SearchUsersAsync(string query, int limit = 10);
        
        // Admin methods
        Task<IEnumerable<AdminUserListDto>> GetUsersForAdminAsync();
        Task<UpdateUserRoleResponse> UpdateUserRoleAsync(int userId, string newRole);
        Task<UpdateUserStatusResponse> UpdateUserStatusAsync(int userId, bool isActive);
    }
}
