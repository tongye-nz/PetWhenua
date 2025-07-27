using Microsoft.EntityFrameworkCore;
using PetWhenua.Services.Abstract;
using PetWhenua.Services.Factories;

namespace PetWhenua.Services
{
    public class MockDataService : IMockDataService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;
        private readonly IUserFactory _userFactory;
        private readonly IPetFactory _petFactory;
        private readonly IPostFactory _postFactory;
        private readonly ILogger<MockDataService> _logger;
        private readonly IConfiguration _configuration;
        private readonly Random _random = new();

        // Pet constants (mirror frontend constants)
        private static readonly string[] DOG_BREEDS = {
            "Labrador Retriever", "Golden Retriever", "German Shepherd", 
            "Bulldog", "Poodle", "Beagle", "Rottweiler", 
            "Yorkshire Terrier", "Mixed Breed"
        };
        
        private static readonly string[] CAT_BREEDS = {
            "Persian", "Maine Coon", "British Shorthair", "Ragdoll",
            "Bengal", "Siamese", "Abyssinian", "Mixed Breed"
        };

        private static readonly string[] PET_GENDERS = { "Male", "Female" };

        // Location data based on plan
        private static readonly List<SeedLocationData> SEED_LOCATIONS = new()
        {
            new("Auckland", "Auckland City", 2, 4),
            new("Wellington", "Wellington City", 1, 49),
            new("Canterbury", "Christchurch City", 16, 58),
            new("Waikato", "Hamilton", 3, 11),
            new("Bay of Plenty", "Tauranga", 4, 24),
            new("Otago", "Dunedin", 17, 67)
        };

        public MockDataService(
            AppDbContext context,
            IAuthService authService,
            IUserFactory userFactory,
            IPetFactory petFactory,
            IPostFactory postFactory,
            ILogger<MockDataService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _authService = authService;
            _userFactory = userFactory;
            _petFactory = petFactory;
            _postFactory = postFactory;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<bool> SeedMockDataAsync(bool forceRecreate = false)
        {
            try
            {
                _logger.LogInformation("Starting mock data seeding...");

                // Check if data already exists
                if (!forceRecreate && await DatabaseHasDataAsync())
                {
                    _logger.LogInformation("Database already has data. Skipping seeding.");
                    return true;
                }

                if (forceRecreate)
                {
                    _logger.LogInformation("Force recreate requested. Clearing existing data...");
                    await ClearAllDataAsync();
                }

                // Seed in order of dependencies
                await SeedUsersAsync();
                await SeedPetsAsync();
                await SeedPostsAsync();
                await SeedCommentsAsync();
                await SeedLocalRelationshipsAsync();

                _logger.LogInformation("Mock data seeding completed successfully!");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during mock data seeding");
                return false;
            }
        }

        public async Task<bool> DatabaseHasDataAsync()
        {
            return await _context.Users.AnyAsync(u => u.Email.Contains("@petwhenua.co.nz"));
        }

        public async Task ClearAllDataAsync()
        {
            _logger.LogInformation("Clearing all mock data...");

            // Delete in reverse dependency order
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM UserFollows WHERE FollowerId IN (SELECT UserId FROM Users WHERE Email LIKE '%@petwhenua.co.nz')");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM PetConnections");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Comments WHERE UserId IN (SELECT UserId FROM Users WHERE Email LIKE '%@petwhenua.co.nz')");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Likes WHERE UserId IN (SELECT UserId FROM Users WHERE Email LIKE '%@petwhenua.co.nz')");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Posts WHERE UserId IN (SELECT UserId FROM Users WHERE Email LIKE '%@petwhenua.co.nz')");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Pets WHERE UserId IN (SELECT UserId FROM Users WHERE Email LIKE '%@petwhenua.co.nz')");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM Users WHERE Email LIKE '%@petwhenua.co.nz'");

            await _context.SaveChangesAsync();
            _logger.LogInformation("Mock data cleared successfully.");
        }

        public async Task SeedUsersAsync()
        {
            _logger.LogInformation("Seeding users...");

            var users = new List<SeedUserData>
            {
                // Site Admin (Auckland)
                new("siteadmin@petwhenua.co.nz", "siteadmin", "Alex", "Smith", UserRoles.SiteAdmin, 
                    "Auckland, Auckland City", "Site administrator for PetWhenua. Ensuring our community runs smoothly!"),

                // Meetup Admins
                new("meetupadmin01@petwhenua.co.nz", "meetupadmin01", "Sarah", "Johnson", UserRoles.MeetupAdmin, 
                    "Auckland, Auckland City", "Organizing amazing pet meetups in Auckland! Join us for fun community events."),
                new("meetupadmin02@petwhenua.co.nz", "meetupadmin02", "Mike", "Wilson", UserRoles.MeetupAdmin, 
                    "Wellington, Wellington City", "Wellington's pet meetup organizer. Let's bring our furry friends together!"),
                new("meetupadmin03@petwhenua.co.nz", "meetupadmin03", "Emma", "Brown", UserRoles.MeetupAdmin, 
                    "Canterbury, Christchurch City", "Creating wonderful pet social events in Christchurch area."),
                new("meetupadmin04@petwhenua.co.nz", "meetupadmin04", "David", "Lee", UserRoles.MeetupAdmin, 
                    "Bay of Plenty, Tauranga", "Bringing Bay of Plenty pet lovers together through fun meetups!"),
                new("meetupadmin05@petwhenua.co.nz", "meetupadmin05", "Lisa", "Taylor", UserRoles.MeetupAdmin, 
                    "Otago, Dunedin", "Organizing pet community events in beautiful Dunedin."),

                // Vets
                new("vet01@petwhenua.co.nz", "vet01", "Dr. James", "Anderson", UserRoles.Vet, 
                    "Auckland, Auckland City", "Veterinarian with 15 years experience. Happy to help with pet health advice!"),
                new("vet02@petwhenua.co.nz", "vet02", "Dr. Maria", "Garcia", UserRoles.Vet, 
                    "Wellington, Wellington City", "Passionate about animal welfare. Specializing in small animal care."),
                new("vet03@petwhenua.co.nz", "vet03", "Dr. Robert", "Chen", UserRoles.Vet, 
                    "Canterbury, Christchurch City", "Your friendly neighborhood vet. Love helping pets stay healthy and happy!"),
                new("vet04@petwhenua.co.nz", "vet04", "Dr. Sophie", "Williams", UserRoles.Vet, 
                    "Waikato, Hamilton", "Veterinary surgeon focused on preventive care and pet wellness."),
                new("vet05@petwhenua.co.nz", "vet05", "Dr. Tom", "Miller", UserRoles.Vet, 
                    "Bay of Plenty, Tauranga", "Caring for pets in Tauranga. Always here for your furry family members!"),

                // Members (2 per location)
                new("member01@petwhenua.co.nz", "member01", "Emily", "Davis", UserRoles.Member, 
                    "Auckland, Auckland City", "Dog lover and proud owner of two golden retrievers! Love meeting new pet friends."),
                new("member02@petwhenua.co.nz", "member02", "Chris", "Thompson", UserRoles.Member, 
                    "Auckland, Auckland City", "Cat enthusiast living in Auckland. My Maine Coon is my best buddy!"),
                new("member03@petwhenua.co.nz", "member03", "Jessica", "White", UserRoles.Member, 
                    "Wellington, Wellington City", "Wellington pet parent with a love for rescue animals."),
                new("member04@petwhenua.co.nz", "member04", "Daniel", "Clark", UserRoles.Member, 
                    "Wellington, Wellington City", "Beagle owner who enjoys long walks around Wellington harbour."),
                new("member05@petwhenua.co.nz", "member05", "Amanda", "Lewis", UserRoles.Member, 
                    "Canterbury, Christchurch City", "Christchurch local with two cats and one very energetic border collie."),
                new("member06@petwhenua.co.nz", "member06", "Ryan", "Hall", UserRoles.Member, 
                    "Canterbury, Christchurch City", "Love hiking with my German Shepherd around Canterbury trails."),
                new("member07@petwhenua.co.nz", "member07", "Nicole", "Young", UserRoles.Member, 
                    "Waikato, Hamilton", "Hamilton resident with a passion for pet photography and training."),
                new("member08@petwhenua.co.nz", "member08", "Jason", "King", UserRoles.Member, 
                    "Waikato, Hamilton", "First-time pet owner learning all about caring for my new puppy!"),
                new("member09@petwhenua.co.nz", "member09", "Rachel", "Wright", UserRoles.Member, 
                    "Bay of Plenty, Tauranga", "Tauranga local who loves beach walks with my labrador."),
                new("member10@petwhenua.co.nz", "member10", "Mark", "Green", UserRoles.Member, 
                    "Bay of Plenty, Tauranga", "Pet training enthusiast always looking to learn new techniques.")
            };

            var passwordHash = _authService.HashPassword("TestPass123!");

            foreach (var userData in users)
            {
                var user = new User
                {
                    Username = userData.Username,
                    Email = userData.Email,
                    PasswordHash = passwordHash,
                    FirstName = userData.FirstName,
                    LastName = userData.LastName,
                    Role = userData.Role,
                    Location = userData.Location,
                    Bio = userData.Bio,
                    ProfilePicture = GetUniqueUserImageForLocation(userData.Location),
                    CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(30, 90)),
                    UpdatedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 30)),
                    IsActive = true
                };

                _context.Users.Add(user);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully seeded {users.Count} users.");
        }

        public async Task SeedPetsAsync()
        {
            _logger.LogInformation("Seeding pets...");

            var users = await _context.Users
                .Where(u => u.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var petNames = new List<string>
            {
                "Max", "Bella", "Charlie", "Luna", "Cooper", "Lucy", "Rocky", "Daisy",
                "Bear", "Molly", "Duke", "Sadie", "Jack", "Maggie", "Zeus", "Sophie",
                "Buddy", "Chloe", "Oliver", "Zoe", "Tucker", "Lily", "Leo", "Ruby",
                "Milo", "Stella", "Oscar", "Nala", "Finn", "Rosie", "Jasper", "Penny"
            };

            var usedImages = new Dictionary<string, List<string>>();
            var petCount = 0;

            foreach (var user in users)
            {
                var numPets = _random.Next(1, 4); // 1-3 pets per user

                for (int i = 0; i < numPets; i++)
                {
                    var species = _random.Next(2) == 0 ? "Dog" : "Cat";
                    var breeds = species == "Dog" ? DOG_BREEDS : CAT_BREEDS;
                    var breed = breeds[_random.Next(breeds.Length)];
                    var name = petNames[_random.Next(petNames.Count)];
                    var gender = PET_GENDERS[_random.Next(PET_GENDERS.Length)];
                    var age = _random.Next(1, 16);

                    var pet = new Pet
                    {
                        UserId = user.UserId,
                        Name = name,
                        Species = species,
                        Breed = breed,
                        Gender = gender,
                        Age = age,
                        BirthYear = DateTime.Now.Year - age,
                        BirthMonth = _random.Next(1, 13),
                        Description = GeneratePetDescription(name, species, breed, age),
                        ProfilePicture = GetUniquePetImageForLocation(species.ToLower(), user.Location ?? "Unknown", usedImages),
                        CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(5, 60)),
                        UpdatedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 15))
                    };

                    _context.Pets.Add(pet);
                    petCount++;
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully seeded {petCount} pets.");
        }

        public async Task SeedPostsAsync()
        {
            _logger.LogInformation("Seeding posts...");
            
            var users = await _context.Users
                .Where(u => u.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var postCount = 0;

            foreach (var user in users)
            {
                var postsToCreate = GetPostsForUserRole(user.Role);
                
                foreach (var postData in postsToCreate)
                {
                    var post = new Post
                    {
                        UserId = user.UserId,
                        PostType = postData.PostType,
                        Title = postData.Title,
                        Content = postData.Content,
                        Location = user.Location ?? "Unknown",
                        Status = PostStatus.Active,
                        Price = postData.Price,
                        EventDate = postData.EventDate,
                        Category = postData.Category,
                        Images = postData.HasImage ? new List<string> { GetPostImage(postData.PostType, postCount) } : new List<string>(),
                        CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 30)),
                        UpdatedAt = DateTime.UtcNow.AddDays(-_random.Next(0, 5))
                    };

                    _context.Posts.Add(post);
                    postCount++;
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully seeded {postCount} posts.");
        }

        public async Task SeedCommentsAsync()
        {
            _logger.LogInformation("Seeding comments...");
            
            var users = await _context.Users
                .Where(u => u.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var posts = await _context.Posts
                .Where(p => p.User.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var commentTemplates = new List<string>
            {
                "This is so adorable! Thanks for sharing.",
                "What a beautiful pet! How old are they?",
                "Love this post! Very helpful information.",
                "Great advice, thank you for sharing your experience.",
                "This made my day! Such a cute photo.",
                "Thanks for organizing this event, looking forward to it!",
                "Is this still available? Please let me know.",
                "My pet would love to join this meetup!",
                "Excellent resource, bookmarking this for later.",
                "Such a heartwarming story, thanks for sharing!"
            };

            var commentCount = 0;

            foreach (var user in users)
            {
                var availablePosts = posts.Where(p => p.UserId != user.UserId).ToList();
                var postsToComment = availablePosts.OrderBy(x => _random.Next()).Take(10).ToList();

                foreach (var post in postsToComment)
                {
                    var comment = new Comment
                    {
                        PostId = post.PostId,
                        UserId = user.UserId,
                        Content = commentTemplates[_random.Next(commentTemplates.Count)],
                        CreatedAt = post.CreatedAt.AddDays(_random.Next(1, 15)),
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Comments.Add(comment);
                    commentCount++;
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully seeded {commentCount} comments.");
        }

        public async Task SeedLocalRelationshipsAsync()
        {
            _logger.LogInformation("Seeding local relationships...");
            
            await CreateUserFollowsByLocationAsync();
            await CreatePetConnectionsByLocationAsync();
            
            _logger.LogInformation("Successfully seeded local relationships.");
        }

        private async Task CreateUserFollowsByLocationAsync()
        {
            var users = await _context.Users
                .Where(u => u.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var followCount = 0;

            // Group users by location
            var usersByLocation = users.GroupBy(u => u.Location ?? "Unknown").ToList();

            foreach (var locationGroup in usersByLocation)
            {
                var locationUsers = locationGroup.ToList();
                
                // Create follow relationships between all users in same location
                for (int i = 0; i < locationUsers.Count; i++)
                {
                    for (int j = 0; j < locationUsers.Count; j++)
                    {
                        if (i != j) // Don't follow yourself
                        {
                            var follow = new UserFollow
                            {
                                FollowerId = locationUsers[i].UserId,
                                FollowingId = locationUsers[j].UserId,
                                CreatedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 30))
                            };

                            _context.UserFollows.Add(follow);
                            followCount++;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully created {followCount} user follow relationships.");
        }

        private async Task CreatePetConnectionsByLocationAsync()
        {
            var pets = await _context.Pets
                .Include(p => p.User)
                .Where(p => p.User.Email.Contains("@petwhenua.co.nz"))
                .ToListAsync();

            var connectionCount = 0;

            // Group pets by user location
            var petsByLocation = pets.GroupBy(p => p.User.Location ?? "Unknown").ToList();

            foreach (var locationGroup in petsByLocation)
            {
                var locationPets = locationGroup.ToList();
                
                // Create connections between all pets in same location
                for (int i = 0; i < locationPets.Count; i++)
                {
                    for (int j = i + 1; j < locationPets.Count; j++)
                    {
                        if (locationPets[i].UserId != locationPets[j].UserId) // Don't connect pets from same owner
                        {
                            var connection = new PetConnection
                            {
                                Pet1Id = locationPets[i].PetId,
                                Pet2Id = locationPets[j].PetId,
                                Status = PetConnectionStatus.Accepted,
                                RequestedById = locationPets[i].UserId,
                                RequestedAt = DateTime.UtcNow.AddDays(-_random.Next(1, 30)),
                                RespondedAt = DateTime.UtcNow.AddDays(-_random.Next(0, 15)),
                                RequestMessage = "Would love for our pets to be friends!",
                                ResponseMessage = "That sounds wonderful!"
                            };

                            _context.PetConnections.Add(connection);
                            connectionCount++;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Successfully created {connectionCount} pet connections.");
        }

        public async Task<MockDataSummary> GetMockDataSummaryAsync()
        {
            var users = await _context.Users.Where(u => u.Email.Contains("@petwhenua.co.nz")).ToListAsync();
            var pets = await _context.Pets.Include(p => p.User).Where(p => p.User.Email.Contains("@petwhenua.co.nz")).ToListAsync();
            var posts = await _context.Posts.Include(p => p.User).Where(p => p.User.Email.Contains("@petwhenua.co.nz")).ToListAsync();
            var comments = await _context.Comments.Include(c => c.User).Where(c => c.User.Email.Contains("@petwhenua.co.nz")).ToListAsync();
            var follows = await _context.UserFollows.Include(f => f.Follower).Where(f => f.Follower.Email.Contains("@petwhenua.co.nz")).ToListAsync();
            var connections = await _context.PetConnections.Include(pc => pc.Pet1).ThenInclude(p => p.User).Where(pc => pc.Pet1.User.Email.Contains("@petwhenua.co.nz")).ToListAsync();

            return new MockDataSummary
            {
                UserCount = users.Count,
                PetCount = pets.Count,
                PostCount = posts.Count,
                CommentCount = comments.Count,
                FollowCount = follows.Count,
                PetConnectionCount = connections.Count,
                LocationsWithUsers = users.Select(u => u.Location ?? "Unknown").Distinct().ToList(),
                UsersByRole = users.GroupBy(u => u.Role).ToDictionary(g => g.Key, g => g.Count()),
                PostsByType = posts.GroupBy(p => p.PostType.ToString()).ToDictionary(g => g.Key, g => g.Count()),
                LastSeededAt = DateTime.UtcNow
            };
        }

        // Helper methods
        private string GetUniqueUserImageForLocation(string location)
        {
            // Use available user profile images: user-01.jpg to user-11.jpg
            var imageNumber = Math.Abs(location.GetHashCode()) % 11 + 1;
            return $"/uploads/samples/profiles/user-{imageNumber:00}.jpg";
        }

        private string GetUniquePetImageForLocation(string species, string location, Dictionary<string, List<string>> usedImages)
        {
            var key = $"{location}_{species}";
            if (!usedImages.ContainsKey(key))
                usedImages[key] = new List<string>();

            // Use available images: cat-01 to cat-10, dog-01 to dog-10
            var maxImages = 10; // Both cats and dogs have 10 images available
            
            for (int i = 1; i <= maxImages; i++)
            {
                var image = $"/uploads/samples/pets/{species}-{i:00}.jpg";
                if (!usedImages[key].Contains(image))
                {
                    usedImages[key].Add(image);
                    return image;
                }
            }

            // If all images used in this location, start reusing them
            var cycleIndex = usedImages[key].Count % maxImages + 1;
            var cycleImage = $"/uploads/samples/pets/{species}-{cycleIndex:00}.jpg";
            return cycleImage;
        }

        private string GetPostImage(PostType postType, int postIndex)
        {
            // Use postIndex to ensure variety across posts
            return postType switch
            {
                PostType.Moment => $"/uploads/samples/posts/moment-{(postIndex % 5) + 1:00}.jpg", // cycle through moment-01 to moment-05
                PostType.BuySell => $"/uploads/samples/posts/buysell-{(postIndex % 2) + 1:00}.jpg", // cycle through buysell-01 to buysell-02
                PostType.Meetup => $"/uploads/samples/posts/meetup-{(postIndex % 2) + 1:00}.jpg", // cycle through meetup-01 to meetup-02
                PostType.Library => $"/uploads/samples/posts/library-{(postIndex % 2) + 1:00}.jpg", // cycle through library-01 to library-02
                PostType.Announcement => $"/uploads/samples/posts/moment-{(postIndex % 5) + 1:00}.jpg", // Reuse moment images for announcements
                _ => $"/uploads/samples/posts/moment-{(postIndex % 5) + 1:00}.jpg"
            };
        }

        private string GeneratePetDescription(string name, string species, string breed, int age)
        {
            var descriptions = new List<string>
            {
                $"Meet {name}! This lovely {age}-year-old {breed.ToLower()} is full of energy and loves making new friends.",
                $"{name} is a wonderful {breed.ToLower()} who enjoys long walks and playing in the park.",
                $"This adorable {age}-year-old {species.ToLower()} named {name} loves cuddles and treats!",
                $"{name} is a friendly {breed.ToLower()} looking for playdates with other pets in the area.",
                $"Sweet {name} is a {age}-year-old {breed.ToLower()} with a gentle personality and lots of love to give."
            };

            return descriptions[_random.Next(descriptions.Count)];
        }

        private List<SeedPostData> GetPostsForUserRole(string role)
        {
            return role switch
            {
                UserRoles.Member => GenerateMemberPosts(),
                UserRoles.MeetupAdmin => GenerateMeetupAdminPosts(),
                UserRoles.Vet => GenerateVetPosts(),
                UserRoles.SiteAdmin => GenerateSiteAdminPosts(),
                _ => new List<SeedPostData>()
            };
        }

        private List<SeedPostData> GenerateMemberPosts()
        {
            var posts = new List<SeedPostData>();
            
            // 10 moment posts
            for (int i = 0; i < 10; i++)
            {
                posts.Add(new SeedPostData(
                    PostType.Moment,
                    $"Fun day at the park with my furry friend #{i + 1}",
                    "Had such an amazing time at the local park today! My pet absolutely loved running around and meeting other animals. The weather was perfect and we even made some new friends. Looking forward to doing this again soon!",
                    i % 4 == 0 // 25% chance of having image
                ));
            }

            // 2 buy/sell posts
            posts.Add(new SeedPostData(
                PostType.BuySell,
                "Dog bed for sale - excellent condition",
                "Selling a high-quality dog bed that my pet has outgrown. It's in excellent condition, very comfortable, and perfect for medium-sized dogs. Asking $45 or best offer. Pick up preferred.",
                true,
                price: 45m,
                category: "Pet Furniture"
            ));

            posts.Add(new SeedPostData(
                PostType.BuySell,
                "Cat toys bundle - moving sale",
                "Moving house and need to find a new home for these cat toys. Includes feather wands, laser pointer, catnip mice, and puzzle feeders. All in good condition. $25 for the whole bundle.",
                true,
                price: 25m,
                category: "Pet Toys"
            ));

            return posts;
        }

        private List<SeedPostData> GenerateMeetupAdminPosts()
        {
            var posts = new List<SeedPostData>();
            
            // 5 moment posts
            for (int i = 0; i < 5; i++)
            {
                posts.Add(new SeedPostData(
                    PostType.Moment,
                    $"Community highlights from our recent events #{i + 1}",
                    "What an incredible turnout at our last meetup! It's so heartwarming to see our local pet community growing and connecting. Thank you to everyone who participated and made it such a special day.",
                    i % 3 == 0
                ));
            }

            // 2 meetup posts
            posts.Add(new SeedPostData(
                PostType.Meetup,
                "Weekly Dog Social - Every Saturday Morning",
                "Join us every Saturday morning at 9 AM for our weekly dog social! It's a great opportunity for your furry friends to socialize and for you to meet fellow dog lovers in the community. All dogs welcome, just make sure they're vaccinated and friendly.",
                true,
                eventDate: DateTime.Now.AddDays(7).Date.AddHours(9),
                category: "Social Events"
            ));

            posts.Add(new SeedPostData(
                PostType.Meetup,
                "Pet Training Workshop - Basic Commands",
                "Professional pet trainer will be hosting a workshop covering basic commands like sit, stay, come, and heel. Perfect for new pet owners or those looking to brush up on training techniques. Limited spots available, please RSVP!",
                true,
                eventDate: DateTime.Now.AddDays(14).Date.AddHours(14),
                category: "Education"
            ));

            return posts;
        }

        private List<SeedPostData> GenerateVetPosts()
        {
            var posts = new List<SeedPostData>();
            
            // 5 moment posts
            for (int i = 0; i < 5; i++)
            {
                posts.Add(new SeedPostData(
                    PostType.Moment,
                    $"Pet health tip of the day #{i + 1}",
                    "Remember to check your pet's teeth regularly! Dental health is crucial for overall wellbeing. Look for signs of tartar buildup, bad breath, or difficulty eating. Regular dental care can prevent serious health issues down the road.",
                    i % 3 == 0
                ));
            }

            // 2 library posts
            posts.Add(new SeedPostData(
                PostType.Library,
                "Essential Vaccination Schedule for Puppies and Kittens",
                "Complete guide to vaccination schedules for young pets. Includes timeline, recommended vaccines, what to expect after vaccination, and signs to watch for. Essential reading for new pet parents to ensure their furry friends stay healthy and protected.",
                true,
                category: "Health Guides"
            ));

            posts.Add(new SeedPostData(
                PostType.Library,
                "Emergency First Aid for Common Pet Injuries",
                "Step-by-step guide for handling common pet emergencies until you can reach a veterinarian. Covers cuts, choking, poisoning, and other urgent situations. Every pet owner should know these basic first aid techniques.",
                true,
                category: "Emergency Care"
            ));

            // 1 meetup post
            posts.Add(new SeedPostData(
                PostType.Meetup,
                "Pet Health Q&A Session with Local Veterinarian",
                "Free Q&A session where you can ask questions about your pet's health, behavior, and care. Bring your concerns and get professional advice in a relaxed, informal setting. No appointment needed, just drop by!",
                true,
                eventDate: DateTime.Now.AddDays(10).Date.AddHours(16),
                category: "Health & Wellness"
            ));

            return posts;
        }

        private List<SeedPostData> GenerateSiteAdminPosts()
        {
            var posts = new List<SeedPostData>();
            
            // 5 moment posts
            for (int i = 0; i < 5; i++)
            {
                posts.Add(new SeedPostData(
                    PostType.Moment,
                    $"Community update and celebration #{i + 1}",
                    "We're thrilled to see our PetWhenua community growing every day! Thank you to all our amazing members who make this such a wonderful place for pet lovers to connect, share, and support each other.",
                    i % 2 == 0
                ));
            }

            // 5 announcement posts
            posts.Add(new SeedPostData(
                PostType.Announcement,
                "Welcome to PetWhenua - Community Guidelines",
                "Welcome to our growing pet community! Please take a moment to read our community guidelines to ensure everyone has a positive experience. Be respectful, keep posts pet-related, and help us maintain a friendly environment for all.",
                false,
                category: "Community"
            ));

            posts.Add(new SeedPostData(
                PostType.Announcement,
                "New Feature: Pet Connection Requests",
                "We're excited to announce our new pet connection feature! You can now send connection requests to other pet owners in your area. This makes it easier to organize playdates and build friendships within our community.",
                false,
                category: "Features"
            ));

            posts.Add(new SeedPostData(
                PostType.Announcement,
                "Upcoming Platform Maintenance - Scheduled Downtime",
                "We'll be performing routine maintenance on our platform this Saturday from 2 AM to 4 AM. During this time, the site may be temporarily unavailable. Thank you for your patience as we work to improve your experience!",
                false,
                category: "Maintenance"
            ));

            posts.Add(new SeedPostData(
                PostType.Announcement,
                "Monthly Community Challenge: Share Your Pet's Story",
                "This month's challenge: Share a heartwarming story about your pet! Whether it's how you met, a funny moment, or how they've changed your life - we'd love to hear from you. Use the hashtag #PetStoryChallenge",
                false,
                category: "Challenges"
            ));

            posts.Add(new SeedPostData(
                PostType.Announcement,
                "Safety Reminder: Protecting Your Pets During Summer",
                "Important safety reminder as we head into warmer weather. Remember to never leave pets in hot cars, provide plenty of water, avoid hot pavement, and watch for signs of overheating. Let's keep our furry friends safe and comfortable!",
                false,
                category: "Safety"
            ));

            return posts;
        }
    }

    // Helper classes
    public class SeedUserData
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
        public string Location { get; set; }
        public string Bio { get; set; }

        public SeedUserData(string email, string username, string firstName, string lastName, string role, string location, string bio)
        {
            Email = email;
            Username = username;
            FirstName = firstName;
            LastName = lastName;
            Role = role;
            Location = location;
            Bio = bio;
        }
    }

    public class SeedLocationData
    {
        public string Region { get; set; }
        public string District { get; set; }
        public int LocalityId { get; set; }
        public int DistrictId { get; set; }

        public SeedLocationData(string region, string district, int localityId, int districtId)
        {
            Region = region;
            District = district;
            LocalityId = localityId;
            DistrictId = districtId;
        }
    }

    public class SeedPostData
    {
        public PostType PostType { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public bool HasImage { get; set; }
        public decimal? Price { get; set; }
        public DateTime? EventDate { get; set; }
        public string? Category { get; set; }

        public SeedPostData(PostType postType, string title, string content, bool hasImage = false, decimal? price = null, DateTime? eventDate = null, string? category = null)
        {
            PostType = postType;
            Title = title;
            Content = content;
            HasImage = hasImage;
            Price = price;
            EventDate = eventDate;
            Category = category;
        }
    }
} 