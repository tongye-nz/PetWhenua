/**
 * Utility functions for constructing proper image URLs
 */

const API_BASE_URL = 'http://localhost:5295';

/**
 * Constructs a full URL for an image
 * @param imageUrl - The image URL (can be relative or absolute)
 * @returns Full URL with base domain if needed
 */
export const getFullImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  if (!imageUrl) {
    return undefined;
  }

  // If it's already a full URL (http/https), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a data URL (base64), return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // If it's a relative URL, construct the full URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // If it doesn't start with /, add one
  return `${API_BASE_URL}/${imageUrl}`;
};

/**
 * Constructs a full URL specifically for profile pictures
 * @param profilePictureUrl - The profile picture URL
 * @returns Full URL or undefined if no URL provided
 */
export const getProfilePictureUrl = (profilePictureUrl: string | null | undefined): string | undefined => {
  return getFullImageUrl(profilePictureUrl);
};

/**
 * Constructs a full URL specifically for post images
 * @param imageUrl - The post image URL
 * @returns Full URL or undefined if no URL provided  
 */
export const getPostImageUrl = (imageUrl: string | null | undefined): string | undefined => {
  return getFullImageUrl(imageUrl);
}; 