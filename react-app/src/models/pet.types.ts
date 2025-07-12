export interface Pet {
  petId?: number;
  userId: number;
  name: string;
  species?: string;
  breed?: string;
  age: number; // Keep for backward compatibility with backend
  birthYear?: number; // New field for more precise age calculation
  birthMonth?: number; // New field (1-12) for month precision
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
  age: number; // Calculated from birth year/month
  birthYear?: number;
  birthMonth?: number;
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
  birthYear: number | '';
  birthMonth: number | '';
  gender: string;
  description: string;
  profilePicture: string;
}

export interface PetFormErrors {
  name?: string;
  species?: string;
  breed?: string;
  birthYear?: string;
  birthMonth?: string;
  gender?: string;
  description?: string;
  profilePicture?: string;
}

// Re-export utilities for backward compatibility
export {
  calculatePetAge,
  formatPetAge,
  calculateAgeInYears
} from '../utils/petAgeUtils';

export {
  BIRTH_MONTHS,
  generateBirthYears,
  getValidBirthMonths
} from '../utils/petBirthDateUtils';

export {
  PET_SPECIES,
  PET_GENDERS,
  DOG_BREEDS,
  CAT_BREEDS
} from '../utils/petConstants';
