import { BUY_SELL_CATEGORIES } from '../data/categories';

/**
 * Get categories for a specific post type
 */
export const getCategoriesForPostType = (postType: number | string): string[] => {
  // Convert string enum to number for comparison
  const numericPostType = typeof postType === 'string' ? 
    (postType === 'BuySell' ? 2 : -1) : postType;
  
  switch (numericPostType) {
    case 2: // BuySell post type
      return [...BUY_SELL_CATEGORIES];
    default:
      return []; // No predefined categories for other post types
  }
};

/**
 * Check if a post type should use predefined categories
 */
export const shouldUsePredefinedCategories = (postType: number | string): boolean => {
  const numericPostType = typeof postType === 'string' ? 
    (postType === 'BuySell' ? 2 : -1) : postType;
  
  return numericPostType === 2; // Only BuySell posts use predefined categories
};

/**
 * Validate if a category is valid for a given post type
 */
export const isValidCategoryForPostType = (category: string, postType: number | string): boolean => {
  const availableCategories = getCategoriesForPostType(postType);
  return availableCategories.includes(category);
}; 