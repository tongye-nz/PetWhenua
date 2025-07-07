namespace PetWhenua.Services.Factories
{
    public interface IPetFactory
    {
        Pet CreatePet(int userId, string name, string? species = null, string? breed = null, int age = 0);
        Pet CreatePetFromExisting(Pet existingPet, Pet updatedPet);
        Pet CreatePetWithDetails(int userId, string name, string? species, string? breed, int age, string? gender, string? description, string? profilePicture);
        bool ValidatePetForCreation(Pet pet);
        bool ValidatePetForUpdate(Pet existingPet, Pet updatedPet);
    }
}
