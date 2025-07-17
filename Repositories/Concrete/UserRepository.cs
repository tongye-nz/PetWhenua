using Microsoft.EntityFrameworkCore;
using PetWhenua.Repositories.Abstract;

namespace PetWhenua.Repositories.Concrete
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync(bool includePets = false, bool includePosts = false)
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

        public async Task<User> AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
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

        public async Task<IEnumerable<User>> SearchUsersAsync(string query, int limit = 10)
        {
            var searchTerm = query.ToLower();
            
            return await _context.Users
                .Where(u => 
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    u.Username.ToLower().Contains(searchTerm) ||
                    (u.FirstName + " " + u.LastName).ToLower().Contains(searchTerm)
                )
                .Take(limit)
                .Select(u => new User
                {
                    UserId = u.UserId,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Username = u.Username,
                    ProfilePicture = u.ProfilePicture,
                    Location = u.Location
                })
                .ToListAsync();
        }
    }
}
