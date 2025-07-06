using Microsoft.EntityFrameworkCore;

namespace PetWhenua.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetUsersAsync(bool includePets = false, bool includePosts = false)
        {
            var query = _context.Users.AsQueryable();

            if (includePets)
            {
                query = query.Include(u => u.Pets);
            }

            if (includePosts)
            {
                query = query.Include(u => u.Posts);
            }

            return await query.OrderBy(u => u.Username).ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(int id, bool includePets = false, bool includePosts = false)
        {
            var query = _context.Users.AsQueryable();

            if (includePets)
            {
                query = query.Include(u => u.Pets);
            }

            if (includePosts)
            {
                query = query.Include(u => u.Posts);
            }

            return await query.FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            // Check if username already exists
            if (await UsernameExistsAsync(user.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email already exists
            if (await EmailExistsAsync(user.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.UserId);
            if (existingUser == null)
            {
                throw new InvalidOperationException($"User with ID {user.UserId} not found.");
            }

            // Check if username is being changed and if it already exists
            if (existingUser.Username != user.Username && await UsernameExistsAsync(user.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            // Check if email is being changed and if it already exists
            if (existingUser.Email != user.Email && await EmailExistsAsync(user.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            // Update properties
            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.ProfilePicture = user.ProfilePicture;
            existingUser.Bio = user.Bio;
            existingUser.Location = user.Location;
            existingUser.PhoneNumber = user.PhoneNumber;
            existingUser.Role = user.Role;
            existingUser.IsActive = user.IsActive;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingUser;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            return await _context.Users.AnyAsync(u => u.UserId == id);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            return await _context.Users
                .AnyAsync(u => u.Username.ToLower() == username.ToLower());
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }
    }
}
