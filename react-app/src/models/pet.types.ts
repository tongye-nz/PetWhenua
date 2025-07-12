export interface Pet {
  petId?: number;
  userId: number;
  name: string;
  species?: string;
  breed?: string;
  age: number;
  gender?: string;
  description?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    userId: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface CreatePetRequest {
  name: string;
  species?: string;
  breed?: string;
  age: number;
  gender?: string;
  description?: string;
  profilePicture?: string;
}

export interface UpdatePetRequest extends CreatePetRequest {
  petId: number;
}

export interface PetFilters {
  species?: string;
  breed?: string;
  userId?: number;
  includeUser?: boolean;
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: number | '';
  gender: string;
  description: string;
  profilePicture: string;
}

export interface PetFormErrors {
  name?: string;
  species?: string;
  breed?: string;
  age?: string;
  gender?: string;
  description?: string;
  profilePicture?: string;
}

// Common pet species and breeds for dropdowns
export const PET_SPECIES = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' }
];

export const PET_GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unknown', label: 'Unknown' }
];

export const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
  'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Mixed Breed'
];

export const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'British Shorthair', 'Ragdoll',
  'Bengal', 'Siamese', 'Abyssinian', 'Mixed Breed'
];
