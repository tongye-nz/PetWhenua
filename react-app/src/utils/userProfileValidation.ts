import type { UserProfileData, UserProfileFormErrors } from '../types/userProfile.types';

// Validation constants
export const VALIDATION_RULES = {
  BIO_MAX_LENGTH: 500,
  EMAIL_REGEX: /\S+@\S+\.\S+/,
  REQUIRED_FIELDS: ['firstName', 'lastName', 'email', 'region', 'district'] as const
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  EMAIL_INVALID: 'Email is invalid',
  BIO_TOO_LONG: `Bio must be less than ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`,
  GENERAL_ERROR: 'Please fix the errors above'
} as const;

// Field display names for better error messages
export const FIELD_LABELS: Record<keyof UserProfileData, string> = {
  id: 'ID',
  username: 'Username',
  email: 'Email',
  firstName: 'First name',
  lastName: 'Last name',
  bio: 'Bio',
  region: 'Region',
  district: 'District',
  profilePicture: 'Profile picture',
  petCount: 'Pet count',
  joinDate: 'Join date'
};

export const validateUserProfile = (data: UserProfileData): UserProfileFormErrors => {
  const errors: UserProfileFormErrors = {};

  // Required field validation
  if (!data.firstName?.trim()) {
    errors.firstName = ERROR_MESSAGES.REQUIRED(FIELD_LABELS.firstName);
  }

  if (!data.lastName?.trim()) {
    errors.lastName = ERROR_MESSAGES.REQUIRED(FIELD_LABELS.lastName);
  }

  if (!data.email?.trim()) {
    errors.email = ERROR_MESSAGES.REQUIRED(FIELD_LABELS.email);
  } else if (!VALIDATION_RULES.EMAIL_REGEX.test(data.email)) {
    errors.email = ERROR_MESSAGES.EMAIL_INVALID;
  }

  if (!data.region?.trim()) {
    errors.region = ERROR_MESSAGES.REQUIRED(FIELD_LABELS.region);
  }

  if (!data.district?.trim()) {
    errors.district = ERROR_MESSAGES.REQUIRED(FIELD_LABELS.district);
  }

  // Bio length validation
  if (data.bio && data.bio.length > VALIDATION_RULES.BIO_MAX_LENGTH) {
    errors.bio = ERROR_MESSAGES.BIO_TOO_LONG;
  }

  return errors;
};

export const hasValidationErrors = (errors: UserProfileFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getErrorMessage = (errors: UserProfileFormErrors): string => {
  if (!hasValidationErrors(errors)) return '';
  
  const errorFields = Object.keys(errors);
  return `Please fix the following fields: ${errorFields.join(', ')}`;
}; 