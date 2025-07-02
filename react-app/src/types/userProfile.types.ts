export interface UserProfileData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  region: string;
  district: string;
  profilePicture?: string;
  petCount?: number;
  joinDate?: string;
}

export interface UserProfileFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  region?: string;
  district?: string;
  bio?: string;
}

export interface UserProfileFormState {
  isEditing: boolean;
  loading: boolean;
  success: string;
  error: string;
}

export type UserProfileField = keyof UserProfileData; 