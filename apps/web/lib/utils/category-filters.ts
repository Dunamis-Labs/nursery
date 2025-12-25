/**
 * Category-specific filter configuration and mapping utilities
 */

export type FilterType = 'price' | 'sunRequirements' | 'waterNeeds' | 'humidity' | 'growthRate' | 'difficulty' | 'toxicity';

export interface CategoryFilterConfig {
  categoryName: string;
  availableFilters: FilterType[];
}

/**
 * Category-specific filter configurations
 * Determines which filters are shown for each category
 */
export const categoryFilterConfigs: Record<string, CategoryFilterConfig> = {
  'Grasses': {
    categoryName: 'Grasses',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Hedging and Screening': {
    categoryName: 'Hedging and Screening',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Palms, Ferns & Tropical': {
    categoryName: 'Palms, Ferns & Tropical',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'humidity', 'growthRate', 'difficulty'],
  },
  'Trees': {
    categoryName: 'Trees',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Shrubs': {
    categoryName: 'Shrubs',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Groundcovers': {
    categoryName: 'Groundcovers',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Climbers': {
    categoryName: 'Climbers',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Conifers': {
    categoryName: 'Conifers',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'growthRate', 'difficulty'],
  },
  'Roses': {
    categoryName: 'Roses',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'difficulty'],
  },
  'Succulents & Cacti': {
    categoryName: 'Succulents & Cacti',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'difficulty'],
  },
  'Citrus & Fruit': {
    categoryName: 'Citrus & Fruit',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'difficulty'],
  },
  'Herbs & Vegetables': {
    categoryName: 'Herbs & Vegetables',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'difficulty'],
  },
  'Water Plants': {
    categoryName: 'Water Plants',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'difficulty'],
  },
  'Indoor Plants': {
    categoryName: 'Indoor Plants',
    availableFilters: ['price', 'sunRequirements', 'waterNeeds', 'humidity', 'difficulty', 'toxicity'],
  },
  'Garden Products': {
    categoryName: 'Garden Products',
    availableFilters: ['price'], // Only price for non-plant products
  },
};

/**
 * Map watering values from ProductSpecification to Low/Medium/High
 */
export function mapWateringToLevel(watering: string | null | undefined): 'Low' | 'Medium' | 'High' | null {
  if (!watering) return null;
  
  const lower = watering.toLowerCase();
  
  // High water needs
  if (
    lower.includes('keep moist') ||
    lower.includes('moist') ||
    lower.includes('frequent') ||
    lower.includes('regular') ||
    lower.includes('daily') ||
    lower.includes('constantly') ||
    lower.includes('wet')
  ) {
    return 'High';
  }
  
  // Low water needs
  if (
    lower.includes('drought') ||
    lower.includes('dry') ||
    lower.includes('minimal') ||
    lower.includes('sparingly') ||
    lower.includes('infrequent') ||
    lower.includes('rarely') ||
    lower.includes('when soil is dry') ||
    lower.includes('allow to dry')
  ) {
    return 'Low';
  }
  
  // Default to Medium
  return 'Medium';
}

/**
 * Map lightRequirements values to filter options
 * Maps various light requirement descriptions to: Full Sun, Partial Shade, Full Shade
 */
export function mapLightToSunRequirement(lightRequirements: string | null | undefined): 'Full Sun' | 'Partial Shade' | 'Full Shade' | null {
  if (!lightRequirements) return null;
  
  const lower = lightRequirements.toLowerCase();
  
  // Full Sun
  if (
    lower.includes('full sun') ||
    lower.includes('direct sun') ||
    lower.includes('bright direct') ||
    lower.includes('full sunlight')
  ) {
    return 'Full Sun';
  }
  
  // Full Shade
  if (
    lower.includes('full shade') ||
    lower.includes('deep shade') ||
    lower.includes('low light') ||
    lower.includes('shade') ||
    lower.includes('no direct sun')
  ) {
    return 'Full Shade';
  }
  
  // Partial Shade (default for anything else)
  if (
    lower.includes('partial') ||
    lower.includes('indirect') ||
    lower.includes('bright indirect') ||
    lower.includes('filtered') ||
    lower.includes('dappled')
  ) {
    return 'Partial Shade';
  }
  
  // Default to Partial Shade if we can't determine
  return 'Partial Shade';
}

/**
 * Get filter configuration for a category
 */
export function getCategoryFilterConfig(categoryName: string): CategoryFilterConfig {
  return categoryFilterConfigs[categoryName] || {
    categoryName,
    availableFilters: ['price', 'sunRequirements', 'waterNeeds'], // Default filters
  };
}

