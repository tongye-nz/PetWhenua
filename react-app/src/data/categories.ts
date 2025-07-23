/**
 * Predefined categories for different post types
 */

export const BUY_SELL_CATEGORIES = [
  'Pet Food & Treats',
  'Pet Toys',
  'Beds & Mats',
  'Cages & Playpens',
  'Litter Boxes & Cleaning Supplies',
  'Collars, Leashes & Harnesses',
  'Pet Clothing & Accessories',
  'Grooming & Bath Supplies',
  'Pet Carriers & Travel Gear',
  'Health & Medical Supplies',
  'Feeding & Watering Supplies',
  'Training Supplies',
  'Other'
] as const;

export type BuySellCategory = typeof BUY_SELL_CATEGORIES[number]; 