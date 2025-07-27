using Moq;
using Xunit;
using PetWhenua.Services;
using PetWhenua.Services.Factories;
using PetWhenua.Repositories.Abstract;
using PetWhenua.Models;

namespace PetWhenua.Tests.Services;

public class PetServiceTests
{
    private readonly Mock<IPetRepository> _mockPetRepository;
    private readonly Mock<IPetFactory> _mockPetFactory;
    private readonly PetService _petService;

    public PetServiceTests()
    {
        _mockPetRepository = new Mock<IPetRepository>();
        _mockPetFactory = new Mock<IPetFactory>();
        _petService = new PetService(_mockPetRepository.Object, _mockPetFactory.Object);
    }

    [Fact]
    public async Task GetPetsAsync_WithoutParameters_ReturnsAllPets()
    {
        // Arrange
        var expectedPets = new List<Pet>
        {
            new Pet { PetId = 1, Name = "Buddy", Species = "Dog" },
            new Pet { PetId = 2, Name = "Mittens", Species = "Cat" }
        };

        _mockPetRepository.Setup(x => x.GetAllPetsAsync(false, null))
            .ReturnsAsync(expectedPets);

        // Act
        var result = await _petService.GetPetsAsync();

        // Assert
        Assert.Equal(expectedPets.Count, result.Count());
        Assert.Equal(expectedPets.First().Name, result.First().Name);
    }

    [Fact]
    public async Task GetPetsAsync_WithUserId_ReturnsUserPets()
    {
        // Arrange
        var userId = 1;
        var expectedPets = new List<Pet>
        {
            new Pet { PetId = 1, Name = "Buddy", Species = "Dog", UserId = userId }
        };

        _mockPetRepository.Setup(x => x.GetAllPetsAsync(false, userId))
            .ReturnsAsync(expectedPets);

        // Act
        var result = await _petService.GetPetsAsync(false, userId);

        // Assert
        Assert.Single(result);
        Assert.Equal(expectedPets.First().UserId, result.First().UserId);
    }

    [Fact]
    public async Task GetPetByIdAsync_ExistingPet_ReturnsPet()
    {
        // Arrange
        var petId = 1;
        var expectedPet = new Pet { PetId = petId, Name = "Buddy", Species = "Dog" };

        _mockPetRepository.Setup(x => x.GetPetByIdAsync(petId, false))
            .ReturnsAsync(expectedPet);

        // Act
        var result = await _petService.GetPetByIdAsync(petId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedPet.PetId, result.PetId);
        Assert.Equal(expectedPet.Name, result.Name);
    }

    [Fact]
    public async Task GetPetByIdAsync_NonExistingPet_ReturnsNull()
    {
        // Arrange
        var petId = 999;

        _mockPetRepository.Setup(x => x.GetPetByIdAsync(petId, false))
            .ReturnsAsync((Pet?)null);

        // Act
        var result = await _petService.GetPetByIdAsync(petId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreatePetAsync_ValidPet_ReturnsCreatedPet()
    {
        // Arrange
        var pet = new Pet
        {
            UserId = 1,
            Name = "Buddy",
            Species = "Dog",
            Breed = "Golden Retriever"
        };

        var createdPet = new Pet
        {
            PetId = 1,
            UserId = pet.UserId,
            Name = pet.Name,
            Species = pet.Species,
            Breed = pet.Breed,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockPetRepository.Setup(x => x.UserExistsAsync(pet.UserId))
            .ReturnsAsync(true);
        _mockPetFactory.Setup(x => x.ValidatePetForCreation(pet));
        _mockPetRepository.Setup(x => x.AddPetAsync(It.IsAny<Pet>()))
            .ReturnsAsync(createdPet);

        // Act
        var result = await _petService.CreatePetAsync(pet);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createdPet.PetId, result.PetId);
        Assert.Equal(createdPet.Name, result.Name);
        _mockPetFactory.Verify(x => x.ValidatePetForCreation(pet), Times.Once);
    }

    [Fact]
    public async Task CreatePetAsync_InvalidUserId_ThrowsInvalidOperationException()
    {
        // Arrange
        var pet = new Pet
        {
            UserId = 999,
            Name = "Buddy",
            Species = "Dog"
        };

        _mockPetRepository.Setup(x => x.UserExistsAsync(pet.UserId))
            .ReturnsAsync(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _petService.CreatePetAsync(pet));
        Assert.Contains("Invalid UserId. User does not exist.", exception.Message);
    }

    [Fact]
    public async Task CreatePetAsync_WithBasicParameters_ReturnsCreatedPet()
    {
        // Arrange
        var userId = 1;
        var name = "Buddy";
        var species = "Dog";
        var breed = "Golden Retriever";
        var age = 3;

        var createdPet = new Pet
        {
            PetId = 1,
            UserId = userId,
            Name = name,
            Species = species,
            Breed = breed,
            Age = age
        };

        _mockPetRepository.Setup(x => x.UserExistsAsync(userId))
            .ReturnsAsync(true);
        _mockPetFactory.Setup(x => x.CreatePet(userId, name, species, breed, age))
            .Returns(createdPet);
        _mockPetRepository.Setup(x => x.AddPetAsync(createdPet))
            .ReturnsAsync(createdPet);

        // Act
        var result = await _petService.CreatePetAsync(userId, name, species, breed, age);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createdPet.Name, result.Name);
        Assert.Equal(createdPet.Species, result.Species);
        _mockPetFactory.Verify(x => x.CreatePet(userId, name, species, breed, age), Times.Once);
    }

    [Fact]
    public async Task CreatePetWithDetailsAsync_ValidDetails_ReturnsCreatedPet()
    {
        // Arrange
        var userId = 1;
        var name = "Buddy";
        var species = "Dog";
        var breed = "Golden Retriever";
        var age = 3;
        var gender = "Male";
        var description = "Friendly dog";
        var profilePicture = "buddy.jpg";

        var createdPet = new Pet
        {
            PetId = 1,
            UserId = userId,
            Name = name,
            Species = species,
            Breed = breed,
            Age = age,
            Gender = gender,
            Description = description,
            ProfilePicture = profilePicture
        };

        _mockPetRepository.Setup(x => x.UserExistsAsync(userId))
            .ReturnsAsync(true);
        _mockPetFactory.Setup(x => x.CreatePetWithDetails(userId, name, species, breed, age, gender, description, profilePicture))
            .Returns(createdPet);
        _mockPetRepository.Setup(x => x.AddPetAsync(createdPet))
            .ReturnsAsync(createdPet);

        // Act
        var result = await _petService.CreatePetWithDetailsAsync(userId, name, species, breed, age, gender, description, profilePicture);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createdPet.Name, result.Name);
        Assert.Equal(createdPet.Gender, result.Gender);
        Assert.Equal(createdPet.Description, result.Description);
        _mockPetFactory.Verify(x => x.CreatePetWithDetails(userId, name, species, breed, age, gender, description, profilePicture), Times.Once);
    }

    [Fact]
    public async Task CreatePetWithDetailsAsync_InvalidUserId_ThrowsInvalidOperationException()
    {
        // Arrange
        var userId = 999;
        var name = "Buddy";

        _mockPetRepository.Setup(x => x.UserExistsAsync(userId))
            .ReturnsAsync(false);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _petService.CreatePetWithDetailsAsync(userId, name, null, null, 0, null, null, null));
        Assert.Contains("Invalid UserId. User does not exist.", exception.Message);
    }

    [Theory]
    [InlineData(1, "Buddy", "Dog")]
    [InlineData(2, "Mittens", "Cat")]
    [InlineData(3, "Goldie", "Fish")]
    public async Task CreatePetAsync_DifferentSpecies_ReturnsCorrectPet(int userId, string name, string species)
    {
        // Arrange
        var createdPet = new Pet
        {
            PetId = userId,
            UserId = userId,
            Name = name,
            Species = species
        };

        _mockPetRepository.Setup(x => x.UserExistsAsync(userId))
            .ReturnsAsync(true);
        _mockPetFactory.Setup(x => x.CreatePet(userId, name, species, null, 0))
            .Returns(createdPet);
        _mockPetRepository.Setup(x => x.AddPetAsync(createdPet))
            .ReturnsAsync(createdPet);

        // Act
        var result = await _petService.CreatePetAsync(userId, name, species);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(name, result.Name);
        Assert.Equal(species, result.Species);
    }

    [Fact]
    public async Task UpdatePetAsync_ValidPet_ReturnsUpdatedPet()
    {
        // Arrange
        var pet = new Pet
        {
            PetId = 1,
            UserId = 1,
            Name = "Updated Buddy",
            Species = "Dog"
        };

        _mockPetRepository.Setup(x => x.GetPetByIdAsync(pet.PetId, false))
            .ReturnsAsync(pet);
        _mockPetFactory.Setup(x => x.CreatePetFromExisting(pet, pet))
            .Returns(pet);
        _mockPetRepository.Setup(x => x.UpdatePetAsync(pet))
            .ReturnsAsync(pet);

        // Act
        var result = await _petService.UpdatePetAsync(pet);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(pet.Name, result.Name);
        _mockPetRepository.Verify(x => x.UpdatePetAsync(pet), Times.Once);
    }

    [Fact]
    public async Task DeletePetAsync_ExistingPet_ReturnsTrue()
    {
        // Arrange
        var petId = 1;

        _mockPetRepository.Setup(x => x.DeletePetAsync(petId))
            .ReturnsAsync(true);

        // Act
        var result = await _petService.DeletePetAsync(petId);

        // Assert
        Assert.True(result);
        _mockPetRepository.Verify(x => x.DeletePetAsync(petId), Times.Once);
    }

    [Fact]
    public async Task DeletePetAsync_NonExistingPet_ReturnsFalse()
    {
        // Arrange
        var petId = 999;

        _mockPetRepository.Setup(x => x.DeletePetAsync(petId))
            .ReturnsAsync(false);

        // Act
        var result = await _petService.DeletePetAsync(petId);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task PetExistsAsync_ExistingPet_ReturnsTrue()
    {
        // Arrange
        var petId = 1;

        _mockPetRepository.Setup(x => x.PetExistsAsync(petId))
            .ReturnsAsync(true);

        // Act
        var result = await _petService.PetExistsAsync(petId);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task PetExistsAsync_NonExistingPet_ReturnsFalse()
    {
        // Arrange
        var petId = 999;

        _mockPetRepository.Setup(x => x.PetExistsAsync(petId))
            .ReturnsAsync(false);

        // Act
        var result = await _petService.PetExistsAsync(petId);

        // Assert
        Assert.False(result);
    }
} 