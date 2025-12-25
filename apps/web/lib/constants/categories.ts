/**
 * The 15 main Plantmark categories
 * These are the only categories that should be displayed on the site.
 * Subcategories are not used anywhere.
 */
export const MAIN_CATEGORIES = [
  'Trees',
  'Shrubs',
  'Grasses',
  'Hedging and Screening',
  'Groundcovers',
  'Climbers',
  'Palms, Ferns & Tropical',
  'Conifers',
  'Roses',
  'Succulents & Cacti',
  'Citrus & Fruit',
  'Herbs & Vegetables',
  'Water Plants',
  'Indoor Plants',
  'Garden Products',
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// Map category names to image filenames (for category tiles on homepage)
export const categoryImageMap: Record<string, string> = {
  'Trees': '/categories/trees.jpg',
  'Shrubs': '/categories/shrubs.jpg',
  'Grasses': '/categories/grasses.jpg',
  'Hedging and Screening': '/categories/hedging-and-screening.jpg',
  'Groundcovers': '/categories/groundcovers.jpg',
  'Climbers': '/categories/climbers.jpg',
  'Palms, Ferns & Tropical': '/categories/palms,-ferns-and-tropical.jpg',
  'Conifers': '/categories/conifers.jpg',
  'Roses': '/categories/roses.jpg',
  'Succulents & Cacti': '/categories/succulents-and-cacti.jpg',
  'Citrus & Fruit': '/categories/citrus-and-fruit.jpg',
  'Herbs & Vegetables': '/categories/herbs-and-vegetables.jpg',
  'Water Plants': '/categories/water-plants.jpg',
  'Indoor Plants': '/categories/indoor-plants.jpg',
  'Garden Products': '/categories/garden-products.jpg',
};

// Map category names to header images (for category page hero sections)
// Falls back to categoryImageMap if not specified
export const categoryHeaderImageMap: Record<string, string> = {
  'Water Plants': '/categories/water-plants-header.jpg',
  'Roses': '/categories/roses-header.jpg',
  // Add other category-specific header images here as needed
};

