namespace PetWhenua.Services.Factories
{
    public class PetFactory : IPetFactory
    {
        public Pet CreatePet(int userId, string name, string? species = null, string? breed = null, int age = 0)
        {
            var pet = new Pet
            {
                UserId = userId,
                Name = name,
                Species = species,
                Breed = breed,
                Age = age,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            ValidatePetForCreation(pet);
            return pet;
        }

        public Pet CreatePetWithDetails(int userId, string name, string? species, string? breed, int age, string? gender, string? description, string? profilePicture)
        {
            var pet = new Pet
            {
                UserId = userId,
                Name = name,
                Species = species,
                Breed = breed,
                Age = age,
                Gender = gender,
                Description = description,
                ProfilePicture = profilePicture,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            ValidatePetForCreation(pet);
            return pet;
        }

        public Pet CreatePetFromExisting(Pet existingPet, Pet updatedPet)
        {
            if (!ValidatePetForUpdate(existingPet, updatedPet))
            {
                throw new InvalidOperationException("Invalid pet update data.");
            }

            // Update properties while preserving certain fields
            existingPet.UserId = updatedPet.UserId;
            existingPet.Name = updatedPet.Name;
            existingPet.Species = updatedPet.Species;
            existingPet.Breed = updatedPet.Breed;
            existingPet.Age = updatedPet.Age;
            existingPet.Gender = updatedPet.Gender;
            existingPet.Description = updatedPet.Description;
            existingPet.ProfilePicture = updatedPet.ProfilePicture;
            existingPet.UpdatedAt = DateTime.UtcNow;

            // Don't update: PetId, CreatedAt, User navigation property

            return existingPet;
        }

        public bool ValidatePetForCreation(Pet pet)
        {
            if (pet == null)
                throw new ArgumentNullException(nameof(pet));

            if (string.IsNullOrWhiteSpace(pet.Name))
                throw new ArgumentException("Pet name cannot be empty.", nameof(pet.Name));

            if (pet.Name.Length > 100)
                throw new ArgumentException("Pet name cannot exceed 100 characters.", nameof(pet.Name));

            if (pet.UserId <= 0)
                throw new ArgumentException("Invalid UserId.", nameof(pet.UserId));

            if (pet.Age < 0)
                throw new ArgumentException("Pet age cannot be negative.", nameof(pet.Age));

            if (pet.Age > 50) // Reasonable upper limit for most pets
                throw new ArgumentException("Pet age seems unrealistic.", nameof(pet.Age));

            if (!string.IsNullOrEmpty(pet.Species) && pet.Species.Length > 50)
                throw new ArgumentException("Species cannot exceed 50 characters.", nameof(pet.Species));

            if (!string.IsNullOrEmpty(pet.Breed) && pet.Breed.Length > 50)
                throw new ArgumentException("Breed cannot exceed 50 characters.", nameof(pet.Breed));

            if (!string.IsNullOrEmpty(pet.Gender) && pet.Gender.Length > 20)
                throw new ArgumentException("Gender cannot exceed 20 characters.", nameof(pet.Gender));

            if (!string.IsNullOrEmpty(pet.Description) && pet.Description.Length > 500)
                throw new ArgumentException("Description cannot exceed 500 characters.", nameof(pet.Description));

            return true;
        }

        public bool ValidatePetForUpdate(Pet existingPet, Pet updatedPet)
        {
            if (existingPet == null)
                throw new ArgumentNullException(nameof(existingPet));

            if (updatedPet == null)
                throw new ArgumentNullException(nameof(updatedPet));

            // Ensure PetId matches
            if (existingPet.PetId != updatedPet.PetId)
                throw new ArgumentException("Pet IDs do not match.", nameof(updatedPet.PetId));

            // Validate updated pet data
            return ValidatePetForCreation(updatedPet);
        }
    }
}
