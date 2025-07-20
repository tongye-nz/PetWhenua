using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Abstract;
using PetWhenua.Models.Dtos;

namespace PetWhenua.Services
{
    public class PetWeddingService : IPetWeddingService
    {
        private readonly AppDbContext _context;
        private readonly IPetConnectionService _petConnectionService;
        private readonly IPostService _postService;

        public PetWeddingService(AppDbContext context, IPetConnectionService petConnectionService, IPostService postService)
        {
            _context = context;
            _petConnectionService = petConnectionService;
            _postService = postService;
        }

        public async Task<Post> CreatePetWeddingAsync(int userId, string title, string content, List<int> petIds, 
            string location, string address, DateTime eventDate, List<string>? images = null, string? category = null)
        {
            if (petIds.Count != 2)
                throw new InvalidOperationException("Exactly two pets must be selected for a pet wedding");

            // Validate that user can select these pets
            foreach (var petId in petIds)
            {
                if (!await CanUserSelectPetForWeddingAsync(userId, petId))
                    throw new InvalidOperationException($"You cannot select pet {petId} for this wedding");
            }

            // Validate address
            if (string.IsNullOrWhiteSpace(address) || address.Length < 5)
                throw new InvalidOperationException("Address is required and must be at least 5 characters long");

            // Create the post
            var post = new Post
            {
                UserId = userId,
                PostType = PostType.PetWedding,
                Title = title,
                Content = content,
                Location = location,
                Address = address,
                EventDate = eventDate,
                Images = images ?? new List<string>(),
                Category = category,
                Status = PostStatus.Pending, // Always start as pending
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Create participants
            var participants = new List<PetWeddingParticipant>();
            foreach (var petId in petIds)
            {
                var pet = await _context.Pets.FindAsync(petId);
                if (pet == null) continue;

                var participant = new PetWeddingParticipant
                {
                    PostId = post.PostId,
                    PetId = petId,
                    OwnerId = pet.UserId,
                    HasApproved = pet.UserId == userId, // Auto-approve if user owns the pet
                    ApprovedAt = pet.UserId == userId ? DateTime.UtcNow : null,
                    CreatedAt = DateTime.UtcNow
                };

                participants.Add(participant);
                _context.PetWeddingParticipants.Add(participant);
            }

            await _context.SaveChangesAsync();

            // Check if all participants have approved and update status if needed
            await UpdateWeddingStatusBasedOnApprovalsAsync(post.PostId);

            return post;
        }

        public async Task<bool> ApprovePetWeddingParticipationAsync(int postId, int userId)
        {
            var participant = await _context.PetWeddingParticipants
                .FirstOrDefaultAsync(pwp => pwp.PostId == postId && pwp.OwnerId == userId && !pwp.HasApproved);

            if (participant == null)
                return false;

            participant.HasApproved = true;
            participant.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Update wedding status if all participants have approved
            await UpdateWeddingStatusBasedOnApprovalsAsync(postId);

            return true;
        }

        public async Task<bool> RejectPetWeddingParticipationAsync(int postId, int userId)
        {
            var participant = await _context.PetWeddingParticipants
                .FirstOrDefaultAsync(pwp => pwp.PostId == postId && pwp.OwnerId == userId && !pwp.HasApproved);

            if (participant == null)
                return false;

            var post = await _context.Posts.FindAsync(postId);
            if (post == null || post.PostType != PostType.PetWedding)
                return false;

            // When a participant rejects, mark the entire wedding as Inactive
            post.Status = PostStatus.Inactive;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<Post>> GetPendingWeddingApprovalsForUserAsync(int userId)
        {
            return await _context.PetWeddingParticipants
                .Where(pwp => pwp.OwnerId == userId && !pwp.HasApproved && pwp.Post.UserId != userId)
                .Include(pwp => pwp.Post)
                    .ThenInclude(p => p.User)
                .Include(pwp => pwp.Post)
                    .ThenInclude(p => p.PetWeddingParticipants)
                        .ThenInclude(pwp2 => pwp2.Pet)
                            .ThenInclude(pet => pet.User)
                .Include(pwp => pwp.Post)
                    .ThenInclude(p => p.PetWeddingParticipants)
                        .ThenInclude(pwp2 => pwp2.Owner)
                .Select(pwp => pwp.Post)
                .Distinct()
                .ToListAsync();
        }

        public async Task<bool> CanUserSelectPetForWeddingAsync(int userId, int petId)
        {
            var pet = await _context.Pets.FindAsync(petId);
            if (pet == null) return false;

            // User owns the pet
            if (pet.UserId == userId) return true;

            // Check if user's pets are connected to this pet
            var userPetIds = await _context.Pets
                .Where(p => p.UserId == userId)
                .Select(p => p.PetId)
                .ToListAsync();

            foreach (var userPetId in userPetIds)
            {
                if (await _petConnectionService.ArePetsConnectedAsync(userPetId, petId))
                    return true;
            }

            return false;
        }

        public async Task<IEnumerable<SelectablePetDto>> GetSelectablePetsForWeddingAsync(int userId)
        {
            var selectablePets = new List<SelectablePetDto>();

            // Add user's own pets
            var ownPets = await _context.Pets
                .Where(p => p.UserId == userId)
                .Include(p => p.User)
                .ToListAsync();

            foreach (var pet in ownPets)
            {
                selectablePets.Add(new SelectablePetDto
                {
                    PetId = pet.PetId,
                    UserId = pet.UserId,
                    Name = pet.Name,
                    Species = pet.Species,
                    Breed = pet.Breed,
                    Age = pet.Age,
                    BirthYear = pet.BirthYear,
                    BirthMonth = pet.BirthMonth,
                    Gender = pet.Gender,
                    Description = pet.Description,
                    ProfilePicture = pet.ProfilePicture,
                    CreatedAt = pet.CreatedAt,
                    UpdatedAt = pet.UpdatedAt,
                    IsOwned = true,
                    IsConnected = false,
                    User = pet.User != null ? new UserDto
                    {
                        UserId = pet.User.UserId,
                        Username = pet.User.Username,
                        FirstName = pet.User.FirstName,
                        LastName = pet.User.LastName,
                        ProfilePicture = pet.User.ProfilePicture
                    } : null
                });
            }

            // Add connected pets
            foreach (var ownPet in ownPets)
            {
                var connectedPets = await _petConnectionService.GetConnectedPetsAsync(ownPet.PetId);
                foreach (var connectedPet in connectedPets.Where(p => p.UserId != userId))
                {
                    // Check if we already added this pet to avoid duplicates
                    if (!selectablePets.Any(sp => sp.PetId == connectedPet.PetId))
                    {
                        selectablePets.Add(new SelectablePetDto
                        {
                            PetId = connectedPet.PetId,
                            UserId = connectedPet.UserId,
                            Name = connectedPet.Name,
                            Species = connectedPet.Species,
                            Breed = connectedPet.Breed,
                            Age = connectedPet.Age,
                            BirthYear = connectedPet.BirthYear,
                            BirthMonth = connectedPet.BirthMonth,
                            Gender = connectedPet.Gender,
                            Description = connectedPet.Description,
                            ProfilePicture = connectedPet.ProfilePicture,
                            CreatedAt = connectedPet.CreatedAt,
                            UpdatedAt = connectedPet.UpdatedAt,
                            IsOwned = false,
                            IsConnected = true,
                            User = connectedPet.User != null ? new UserDto
                            {
                                UserId = connectedPet.User.UserId,
                                Username = connectedPet.User.Username,
                                FirstName = connectedPet.User.FirstName,
                                LastName = connectedPet.User.LastName,
                                ProfilePicture = connectedPet.User.ProfilePicture
                            } : null,
                            ConnectionOwner = connectedPet.User != null ? new UserDto
                            {
                                UserId = connectedPet.User.UserId,
                                Username = connectedPet.User.Username,
                                FirstName = connectedPet.User.FirstName,
                                LastName = connectedPet.User.LastName,
                                ProfilePicture = connectedPet.User.ProfilePicture
                            } : null
                        });
                    }
                }
            }

            return selectablePets;
        }

        public async Task<Post> UpdateWeddingStatusBasedOnApprovalsAsync(int postId)
        {
            var post = await _context.Posts
                .Include(p => p.PetWeddingParticipants)
                .FirstOrDefaultAsync(p => p.PostId == postId);

            if (post == null || post.PostType != PostType.PetWedding)
                throw new InvalidOperationException("Post not found or not a pet wedding");

            var allApproved = post.PetWeddingParticipants.All(pwp => pwp.HasApproved);

            if (allApproved && post.Status == PostStatus.Pending)
            {
                post.Status = PostStatus.Active;
                post.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return post;
        }

        public async Task<Post> UpdatePetWeddingParticipantsAsync(int postId, List<int> newPetIds, int requestingUserId)
        {
            if (newPetIds.Count != 2)
                throw new InvalidOperationException("Exactly two pets must be selected for a pet wedding");

            // Get the existing post with participants
            var post = await _context.Posts
                .Include(p => p.PetWeddingParticipants)
                .FirstOrDefaultAsync(p => p.PostId == postId);

            if (post == null || post.PostType != PostType.PetWedding)
                throw new InvalidOperationException("Post not found or not a pet wedding");

            // Check if user is authorized to update this wedding
            if (post.UserId != requestingUserId)
                throw new UnauthorizedAccessException("Only the wedding creator can update participants");

            // Check if post status allows updates
            if (post.Status == PostStatus.Active)
                throw new InvalidOperationException("Cannot update participants of an active pet wedding");

            // Validate that user can select these pets
            foreach (var petId in newPetIds)
            {
                if (!await CanUserSelectPetForWeddingAsync(requestingUserId, petId))
                    throw new InvalidOperationException($"You cannot select pet {petId} for this wedding");
            }

            // Remove existing participants
            var existingParticipants = post.PetWeddingParticipants.ToList();
            foreach (var participant in existingParticipants)
            {
                _context.PetWeddingParticipants.Remove(participant);
            }

            // Add new participants
            foreach (var petId in newPetIds)
            {
                var pet = await _context.Pets.FindAsync(petId);
                if (pet == null) continue;

                var participant = new PetWeddingParticipant
                {
                    PostId = postId,
                    PetId = petId,
                    OwnerId = pet.UserId,
                    HasApproved = pet.UserId == requestingUserId, // Auto-approve if user owns the pet
                    ApprovedAt = pet.UserId == requestingUserId ? DateTime.UtcNow : null,
                    CreatedAt = DateTime.UtcNow
                };

                _context.PetWeddingParticipants.Add(participant);
            }

            // Update post timestamp and reset status to pending if needed
            post.UpdatedAt = DateTime.UtcNow;
            post.Status = PostStatus.Pending; // Reset to pending when participants change

            await _context.SaveChangesAsync();

            // Update wedding status based on new approvals
            await UpdateWeddingStatusBasedOnApprovalsAsync(postId);

            return post;
        }
    }
}
