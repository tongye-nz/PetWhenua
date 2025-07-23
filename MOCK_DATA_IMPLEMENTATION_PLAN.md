# Mock Data Implementation Plan

## 📋 **Overview**
This document outlines the implementation plan for creating comprehensive mock data for the PetWhenua application, including users, pets, posts, comments, and images across both local development and Azure SQL environments.

## 🎯 **Requirements Summary**
- **21 User Accounts**: 10 Members, 5 Meetup Admins, 5 Vets, 1 Site Admin
- **Diverse NZ Locations**: Based on actual nzLocations.ts data
- **Content Distribution**: Posts, comments, pets according to user roles
- **Images**: Some posts include sample images
- **Environment Support**: Local SQL Server and Azure SQL

---

## 🔍 **Step 1: Analysis & Preparation**

### **1.1 Database Schema Review**
- [ ] Review existing models and relationships
- [ ] Check constraints and validation rules
- [ ] Identify foreign key dependencies
- [ ] Understand post type requirements

### **1.2 Location Data Integration**
Using `react-app/src/data/nzLocations.ts` for consistent location handling:
- Ensure compatibility with existing location utilities
- Validate location format: `"Region, District"`
- Use `isValidDistrictForRegion()` for validation

### **1.3 Content Requirements Analysis**
- Post type validation rules
- Image requirements and formats
- User role permissions
- Business logic constraints

---

## 🏗️ **Step 2: Implementation Approach**

### **Recommended: Entity Framework Seeding**
```csharp
// In Program.cs or dedicated service
public interface IMockDataService
{
    Task<bool> SeedMockDataAsync(bool forceRecreate = false);
    Task ClearAllDataAsync();
    Task<MockDataSummary> GetMockDataSummaryAsync();
    Task<bool> DatabaseHasDataAsync();
}
```

**Advantages:**
- Integrated with EF Core
- Environment-aware seeding
- Automatic relationship handling
- Transaction support

---

## 📍 **Step 3: Location Distribution**

### **3.1 Selected NZ Locations (10 total)**
Based on `nzLocations.ts` data structure:

| # | Region | District | LocalityId | DistrictId | Assignment |
|---|--------|----------|------------|------------|------------|
| 1 | Auckland | Auckland City | 2 | 4 | Site Admin + 2 Members + 1 Vet + 1 Meetup Admin |
| 2 | Wellington | Wellington City | 1 | 49 | 2 Members + 1 Vet + 1 Meetup Admin |
| 3 | Canterbury | Christchurch City | 16 | 58 | 2 Members + 1 Vet + 1 Meetup Admin |
| 4 | Waikato | Hamilton | 3 | 11 | 2 Members + 1 Vet |
| 5 | Bay of Plenty | Tauranga | 4 | 24 | 2 Members + 1 Vet + 1 Meetup Admin |
| 6 | Otago | Dunedin | 17 | 67 | 1 Meetup Admin |


### **3.2 User Distribution Summary**
- **Members (10)**: 2 each in Auckland, Wellington, Canterbury, Waikato, Tauranga
- **Meetup Admins (5)**: 1 each in Auckland, Wellington, Canterbury, Tauranga, Dunedin
- **Vets (5)**: 1 each in Auckland, Wellington, Canterbury, Waikato, Tauranga
- **Site Admin (1)**: Auckland, Auckland City

### **3.3 Location Overlap Benefits**
- **Auckland**: Site Admin + 2 Members + 1 Vet + 1 Meetup Admin (5 users total)
- **Wellington**: 2 Members + 1 Vet + 1 Meetup Admin (4 users total)
- **Canterbury**: 2 Members + 1 Vet + 1 Meetup Admin (4 users total)
- **Waikato**: 2 Members + 1 Vet (3 users total)
- **Tauranga**: 2 Members + 1 Vet + 1 Meetup Admin (4 users total)
- **Dunedin**: 1 Meetup Admin (1 user total)

### **3.4 Testing Scenarios Enabled**
This improved distribution allows comprehensive testing of:

**Location-Based Features:**
- **"Users Near Me"**: Members can discover vets, meetup admins, and other members in their area
- **"Pets Near Me"**: Pet owners can find pets from different user types in their location
- **Local Meetups**: Meetup admins can organize events where local members actually exist to attend
- **Local Communities**: Users in same region/district automatically follow each other
- **Pet Connections**: Pets from users in same location are connected to each other

**Role Interactions:**
- **Auckland Hub**: All user types present - perfect for testing complex interactions
- **Regional Centers**: Wellington, Canterbury, Tauranga have mixed communities
- **Vet Accessibility**: Every major center has a vet for member consultations
- **Meetup Coverage**: 4 of 5 major centers have meetup admins for local events

**Realistic Scenarios:**
- Members attending meetups organized by local admins
- Vets providing advice to local pet owners
- Cross-role commenting and interactions
- Site admin monitoring activity across all regions
- Location-based post filtering and recommendations
- **Local Social Networks**: Established follow relationships within communities
- **Pet Playdates**: Connected pets from the same area

---

## 👥 **Step 4: User Account Structure**

### **4.1 Naming Convention & Location Assignment**
```
Members:
- member01@petwhenua.co.nz, member02@petwhenua.co.nz (Auckland)
- member03@petwhenua.co.nz, member04@petwhenua.co.nz (Wellington)
- member05@petwhenua.co.nz, member06@petwhenua.co.nz (Canterbury)
- member07@petwhenua.co.nz, member08@petwhenua.co.nz (Waikato)
- member09@petwhenua.co.nz, member10@petwhenua.co.nz (Tauranga)

Meetup Admins:
- meetupadmin01@petwhenua.co.nz (Auckland - same as Site Admin & Members)
- meetupadmin02@petwhenua.co.nz (Wellington - same as Members & Vet)
- meetupadmin03@petwhenua.co.nz (Canterbury - same as Members & Vet)
- meetupadmin04@petwhenua.co.nz (Tauranga - same as Members & Vet)
- meetupadmin05@petwhenua.co.nz (Dunedin - unique location)

Vets:
- vet01@petwhenua.co.nz (Auckland)
- vet02@petwhenua.co.nz (Wellington)
- vet03@petwhenua.co.nz (Canterbury)
- vet04@petwhenua.co.nz (Waikato)
- vet05@petwhenua.co.nz (Tauranga)

Site Admin:
- siteadmin@petwhenua.co.nz (Auckland)
```

### **4.2 Password Strategy**
- All accounts: `TestPass123!` (meets validation requirements)
- Document in README for development team
- Different passwords for production environments

### **4.3 Profile Data**
- Realistic NZ names and personal details
- Bio content relevant to user roles
- Profile pictures (sample images)
- Proper role assignments

---

## 🐾 **Step 5: Pet Data Structure**

### **5.1 Pet Distribution**
- **Each user**: 1-3 pets randomly assigned (dogs and cats only)
- **Total pets**: ~42-63 pets across all users
- **Species split**: Approximately 60% dogs, 40% cats (realistic for NZ)
- **Breed variety**: All breeds from petConstants.ts represented

### **5.2 Pet Variety**
Based on `react-app/src/utils/petConstants.ts`:

```csharp
// Species (cats and dogs only)
Species: Dog, Cat

// Dog Breeds (from DOG_BREEDS constant)
Dog Breeds: 
- Labrador Retriever
- Golden Retriever  
- German Shepherd
- Bulldog
- Poodle
- Beagle
- Rottweiler
- Yorkshire Terrier
- Mixed Breed

// Cat Breeds (from CAT_BREEDS constant)
Cat Breeds:
- Persian
- Maine Coon
- British Shorthair
- Ragdoll
- Bengal
- Siamese
- Abyssinian
- Mixed Breed

// Genders (from PET_GENDERS constant)  
Genders: Male, Female
```

**Benefits of Dogs & Cats Only:**
- ✅ Consistent with frontend dropdown options
- ✅ Easier to find appropriate stock images  
- ✅ More focused testing scenarios
- ✅ Realistic pet ownership patterns in NZ
- ✅ Better breed-specific interactions and comments

### **5.3 Pet Characteristics**
- **Ages**: 0-15 years (puppies/kittens to seniors)
- **Genders**: Male, Female, Unknown (from PET_GENDERS constant)
- **Breeds**: Randomly selected from appropriate breed constants
- **Names**: Popular cat and dog names (Max, Luna, Charlie, Bella, etc.)
- **Profile pictures**: 70% of pets have pictures matching their breed
- **Pet connections**: Automatic connections between pets in the same location
- **Cross-species friendships**: Dogs and cats connected within local communities

---

## 📝 **Step 6: Post Content Distribution**

### **6.1 Member Posts (10 accounts)**
Each member creates:
- **10 Moment posts**: Personal pet stories, daily life
- **2 BuySell posts**: Pet supplies, accessories

### **6.2 Meetup Admin Posts (5 accounts)**
Each meetup admin creates:
- **5 Moment posts**: Community-focused content, local pet community highlights
- **2 Meetup posts**: Location-specific events (e.g., "Auckland Dog Park Meetup", "Wellington Cat Café Social")

### **6.3 Vet Posts (5 accounts)**
Each vet creates:
- **5 Moment posts**: Educational content, tips
- **2 Library posts**: Professional resources, guides
- **1 Meetup post**: Educational workshops

### **6.4 Site Admin Posts (1 account)**
- **5 Moment posts**: Platform updates, community highlights
- **5 Announcement posts**: Important site-wide communications

### **6.5 Total Post Count**
- **Moment**: 120 posts
- **BuySell**: 20 posts
- **Meetup**: 15 posts
- **Library**: 10 posts
- **Announcement**: 5 posts
- **Total**: 170 posts

---

## 💬 **Step 7: Comment Distribution**

### **7.1 Comment Strategy**
- **Each user comments on 10 different posts** (not their own)
- **Location preference**: Users more likely to comment on posts from their area
- **Cross-role interactions**: Members comment on vet advice, meetup posts, etc.
- **Local community engagement**: Higher comment activity between users in same location
- **Total comments**: ~210 comments
- **Comment variety**: Questions, praise, advice, experiences, meetup attendance

### **7.2 Comment Content**
```csharp
// Sample comment templates by interaction type
Moment Posts:
"What a beautiful [dog/cat]! How old is [pet name]?"
"My Labrador loves doing that too! So cute 😍"
"Is that a Persian cat? Absolutely gorgeous!"

Vet/Library Posts:
"Thanks for sharing this! Very helpful information."
"My German Shepherd had the same issue. Here's what worked for us..."
"Our Bengal cat responds well to this approach too."

Meetup Posts:
"I'd love to join this meetup. Count me in!"
"Is this suitable for Golden Retrievers? My Max would love to come!"
"Great idea! Are small dogs like Yorkshire Terriers welcome?"

BuySell Posts:
"Is this still available?"
"Would you consider $40? I'm local to Wellington."
"Perfect for my Maine Coon! Still available?"
```

---

## 🤝 **Step 8: Local Relationship Creation**

### **8.1 User Follow Relationships**
- **Same Location Rule**: Users in identical region/district automatically follow each other
- **Community Examples**:
  - Auckland: Site Admin + 2 Members + 1 Vet + 1 Meetup Admin (all follow each other)
  - Wellington: 2 Members + 1 Vet + 1 Meetup Admin (all follow each other)
  - Canterbury: 2 Members + 1 Vet + 1 Meetup Admin (all follow each other)
  - Waikato: 2 Members + 1 Vet (all follow each other)
  - Tauranga: 2 Members + 1 Vet + 1 Meetup Admin (all follow each other)

### **8.2 Pet Connection Relationships**
- **Same Location Rule**: Pets from users in same region/district are automatically connected
- **Cross-Species Connections**: Dogs and cats connect within local communities
- **Connection Examples**:
  - Auckland pets: ~10-15 pets all connected to each other
  - Wellington pets: ~8-12 pets all connected to each other
  - Canterbury pets: ~8-12 pets all connected to each other

### **8.3 Benefits of Local Relationships**
- **Realistic Social Networks**: Mimics real-world local pet communities
- **Enhanced Testing**: "Users Near Me" and "Pets Near Me" show meaningful connections
- **Active Communities**: Local users already know each other (like real neighborhoods)
- **Meetup Attendance**: Local members likely to attend local meetups
- **Cross-Role Interactions**: Established relationships enable natural conversations

### **8.4 Smart Image Assignment Logic**

**User Profile Pictures by Location:**
- **Auckland (5 users)**: user-01.jpg, user-02.jpg, user-03.jpg, user-04.jpg, user-05.jpg
- **Wellington (4 users)**: user-01.jpg, user-02.jpg, user-03.jpg, user-04.jpg
- **Canterbury (4 users)**: user-01.jpg, user-02.jpg, user-03.jpg, user-04.jpg
- **Waikato (3 users)**: user-01.jpg, user-02.jpg, user-03.jpg
- **Tauranga (4 users)**: user-01.jpg, user-02.jpg, user-03.jpg, user-04.jpg

**Pet Pictures by Location (Example - Auckland):**
- **Dogs in Auckland**: dog-01.jpg, dog-02.jpg, dog-03.jpg, dog-04.jpg (then cycle if more dogs)
- **Cats in Auckland**: cat-01.jpg, cat-02.jpg, cat-03.jpg (then cycle if more cats)

**Benefits:**
- **Visual Clarity**: Easy to distinguish connected users/pets in UI
- **Realistic Testing**: Mimics real-world where friends have different photos
- **Better UX Testing**: Users can easily identify different community members
- **Debugging Friendly**: Unique images make relationship testing easier

---

## 🖼️ **Step 9: Image Handling Strategy**

### **9.1 Image Storage Strategy**

**Sample Image Folder Structure:**
```
wwwroot/
├── uploads/
│   ├── samples/
│   │   ├── pets/
│   │   │   ├── cat-01.jpg
│   │   │   ├── cat-02.jpg
│   │   │   ├── cat-03.jpg
│   │   │   ├── dog-01.jpg
│   │   │   ├── dog-02.jpg
│   │   │   ├── dog-03.jpg
│   │   │   └── dog-04.jpg
│   │   ├── posts/
│   │   │   ├── moment-01.jpg
│   │   │   ├── moment-02.jpg
│   │   │   ├── buysell-01.jpg
│   │   │   ├── meetup-01.jpg
│   │   │   └── library-01.jpg
│   │   └── profiles/
│   │       ├── user-01.jpg
│   │       ├── user-02.jpg
│   │       ├── user-03.jpg
│   │       ├── user-04.jpg
│   │       └── user-05.jpg
```

**Benefits:**
- ✅ Consistent across all environments (local & Azure)
- ✅ No external dependencies
- ✅ Fast loading (local files)
- ✅ Version controlled with source code
- ✅ Works offline
- ✅ Simple deployment
- ✅ Minimal storage requirements (only 17 images total)
- ✅ Easy to manage and maintain
- ✅ Smart assignment avoids duplicate images in local communities
- ✅ Enhanced visual clarity for testing relationships

### **9.2 Image Distribution**
- **Profile Pictures**: 80% of users have profile pictures (user-01.jpg to user-05.jpg)
- **Pet Pictures**: 70% of pets have profile pictures (cat-01.jpg to cat-03.jpg, dog-01.jpg to dog-04.jpg)
- **Post Images**: 40% of posts include images (moment-01.jpg to moment-05.jpg, etc.)
- **Image Formats**: JPG, PNG (optimized for web)
- **Smart Image Assignment**: 
  - Users in same location get different profile pictures
  - Connected pets get different profile pictures
  - Images can be reused across different locations

---

## ⚙️ **Step 10: Implementation Code Structure**

### **10.1 Service Structure**
```csharp
public class MockDataService : IMockDataService
{
    private readonly AppDbContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<MockDataService> _logger;
    
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
    
    // Implementation methods
    public async Task<bool> SeedMockDataAsync(bool forceRecreate = false)
    public async Task SeedUsersAsync()
    public async Task SeedPetsAsync()
    public async Task SeedPostsAsync()
    public async Task SeedCommentsAsync()
    public async Task SeedLocalRelationshipsAsync()
    
    // Local relationship creation
    private async Task CreateUserFollowsByLocationAsync()
    private async Task CreatePetConnectionsByLocationAsync()
    private List<User> GetUsersByLocation(string location)
    private List<Pet> GetPetsByUserLocation(string location)
    
    // Smart image assignment methods
    private string GetUniquePetImageForLocation(string species, string location, List<string> usedImages)
    private string GetUniqueUserImageForLocation(string location, List<string> usedImages)
    private List<string> GetUsedPetImagesInLocation(string location, string species)
    private List<string> GetUsedUserImagesInLocation(string location)
    
    // Fallback for when all images are used in a location
    private string GetLeastUsedPetImage(string species, string location)
    private string GetLeastUsedUserImage(string location)
}
```

### **10.2 Configuration Support**
```json
{
  "MockData": {
    "EnableAutoSeed": true,
    "ForceRecreateOnStartup": false,
    "UseLocalImages": true,
    "ImageBasePath": "/uploads/samples/",
    "PetImageCount": { "cats": 3, "dogs": 4 },
    "UserImageCount": 5,
    "PostImageCount": 5,
    "SmartImageAssignment": true,
    "AvoidDuplicatesInLocation": true
  }
}
```

### **10.3 Data Models**
```csharp
public class SeedUserData
{
    public string Email { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public string Location { get; set; }
    public string Bio { get; set; }
    public List<SeedPetData> Pets { get; set; }
    public List<SeedPostData> Posts { get; set; }
}

public class SeedPetData
{
    public string Name { get; set; }
    public string Species { get; set; } // "dog" or "cat" only
    public string Breed { get; set; }   // From DOG_BREEDS or CAT_BREEDS constants
    public string Gender { get; set; }  // "male", "female", "unknown"
    public int Age { get; set; }
    public string Description { get; set; }
    public string? ProfilePicture { get; set; } // Assigned uniquely within location
    public string UserLocation { get; set; }    // Used for smart image assignment
}

// Example Smart Assignment Result:
// Auckland Dogs: Max (dog-01.jpg), Bella (dog-02.jpg), Charlie (dog-03.jpg)
// Wellington Dogs: Luna (dog-01.jpg), Cooper (dog-02.jpg) 
// → Same images reused across different locations, unique within locations
```

---

## 🚀 **Step 11: Environment-Specific Deployment**

### **11.1 Local Development**
```csharp
// In Program.cs
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var mockDataService = scope.ServiceProvider.GetRequiredService<IMockDataService>();
    
    if (!await mockDataService.DatabaseHasDataAsync())
    {
        await mockDataService.SeedMockDataAsync();
    }
}
```

### **11.2 Azure SQL Deployment**

#### **Automatic Seeding**
```csharp
// Check for specific environment variable
if (Environment.GetEnvironmentVariable("ENABLE_MOCK_DATA") == "true")
{
    await mockDataService.SeedMockDataAsync();
}
```

#### **Manual Seeding Endpoint** (Recommended for Production)
```csharp
[HttpPost("seed-mock-data")]
[Authorize(Roles = "SiteAdmin")]
public async Task<IActionResult> SeedMockData([FromQuery] bool forceRecreate = false)
{
    var result = await _mockDataService.SeedMockDataAsync(forceRecreate);
    return Ok(new { Success = result, Message = "Mock data seeded successfully" });
}
```

### **11.3 Azure-Specific Considerations**

#### **Connection String Management**
- Use Azure Key Vault for sensitive data
- Environment-specific `appsettings.Production.json`
- Secure password management

#### **Image Storage in Azure**
```csharp
// Azure Blob Storage configuration
public class AzureImageService : IImageService
{
    // Upload sample images to blob storage
    // Generate SAS URLs for public access
    // Handle CDN integration
}
```

#### **Database Migration Strategy**
```csharp
// Ensure migrations run before seeding
public static async Task InitializeDatabaseAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Run migrations
    await context.Database.MigrateAsync();
    
    // Seed data if needed
    if (ShouldSeedData())
    {
        var mockDataService = scope.ServiceProvider.GetRequiredService<IMockDataService>();
        await mockDataService.SeedMockDataAsync();
    }
}
```

---

## ✅ **Step 12: Implementation Checklist**

### **12.1 Backend Implementation**
- [ ] Create `IMockDataService` interface
- [ ] Implement `MockDataService` class
- [ ] Add configuration support
- [ ] Create seed data models
- [ ] Implement user seeding
- [ ] Implement pet seeding
- [ ] Implement post seeding
- [ ] Implement comment seeding
- [ ] Implement local relationship creation (user follows + pet connections)
- [ ] Add image handling
- [ ] Create admin endpoint for manual seeding

### **12.2 Image Setup**
- [ ] Create `wwwroot/uploads/samples/` folder structure
- [ ] Add 4 generic dog images (dog-01.jpg to dog-04.jpg)
- [ ] Add 3 generic cat images (cat-01.jpg to cat-03.jpg)
- [ ] Add 5 sample post images (moment-01.jpg, moment-02.jpg, buysell-01.jpg, meetup-01.jpg, library-01.jpg)
- [ ] Add 5 sample profile pictures (user-01.jpg to user-05.jpg)
- [ ] Optimize images for web (compress, resize)
- [ ] Test smart image assignment logic (unique images within locations)
- [ ] Verify no duplicate profile pictures for connected users/pets
- [ ] Test image loading and reuse logic in both environments

### **12.3 Testing & Validation**
- [ ] Test local seeding process
- [ ] Validate all relationships (user follows + pet connections)
- [ ] Verify local community creation (users in same location follow each other)
- [ ] Test pet connections within locations
- [ ] Check business rule compliance
- [ ] Test image loading
- [ ] Verify location data integrity
- [ ] Test Azure deployment
- [ ] Performance testing with full dataset

### **12.4 Documentation**
- [ ] Update README with seeding instructions
- [ ] Document test account credentials
- [ ] Create troubleshooting guide
- [ ] Document Azure deployment steps

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Foundation** 
1. **Setup**: Create folder structure and service interfaces
2. **Users**: Implement user seeding with roles and locations  
3. **Validation**: Test user creation and authentication

### **Phase 2: Content**
4. **Pets**: Add pet seeding with breeds from petConstants
5. **Posts**: Implement post creation by user type
6. **Testing**: Verify business rules and relationships

### **Phase 3: Interactions**  
7. **Comments**: Add comment seeding with location preferences
8. **Local Relationships**: Create automatic user follows and pet connections by location
9. **Smart Images**: Implement smart image assignment (unique within locations)

### **Phase 4: Deployment**
10. **Local Testing**: Full end-to-end testing in development
11. **Azure Setup**: Configure production environment  
12. **Production Deploy**: Deploy and seed Azure environment

**Ready to begin Phase 1?** 🎯 