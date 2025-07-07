using PetWhenua.Models.Dtos;

namespace PetWhenua.Services.Factories
{
    public interface IUserFactory
    {
        User CreateUser(RegisterRequestDto request, string passwordHash);
        User CreateUser(string username, string email, string passwordHash, string? firstName = null, string? lastName = null);
        User CreateUserFromExisting(User existingUser, User updatedUser);
        User CreateDeactivatedUser(User user);
        User CreateActivatedUser(User user);
        bool ValidateUserForCreation(User user);
        bool ValidateUserForUpdate(User existingUser, User updatedUser);
    }
}
