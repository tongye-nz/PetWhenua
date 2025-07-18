import { profilePictureService } from '../api/profile.api';

/**
 * Uploads a pet profile picture after the pet has been created/updated
 */
export const uploadPetProfilePicture = async (
  petId: number, 
  processedImageFile: File
): Promise<string> => {
  try {
    const uploadResult = await profilePictureService.uploadPetProfilePicture(petId, processedImageFile);
    return uploadResult.profilePicture;
  } catch (error) {
    console.error('Failed to upload pet profile picture:', error);
    throw error;
  }
};

/**
 * Helper function to handle pet profile picture upload after pet creation/update
 */
export const handlePetProfilePictureUpload = async (
  petId: number, 
  processedImageFile: File | null
): Promise<string | null> => {
  if (!processedImageFile) {
    return null;
  }

  try {
    const profilePictureUrl = await uploadPetProfilePicture(petId, processedImageFile);
    console.log(`Pet profile picture uploaded successfully for pet ${petId}`);
    return profilePictureUrl;
  } catch (error) {
    console.error(`Failed to upload profile picture for pet ${petId}:`, error);
    // Return null to indicate upload failed, but don't throw to avoid breaking pet creation
    return null;
  }
}; 