import { ScrapingJobType, ScrapingJobStatus } from '@nursery/db';

export interface ProductVariant {
  id: string; // combo ID or variant ID
  size?: string; // e.g., "20cm", "25cm", "40cm", "45L", "150L"
  price?: number;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  stock?: number; // Stock quantity if available
}

export interface PlantmarkProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  botanicalName?: string;
  commonName?: string;
  price?: number; // Base/default price (for backward compatibility)
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED'; // Overall availability
  variants?: ProductVariant[]; // Multiple sizes/prices
  category?: string;
  categoryPath?: string[];
  imageUrl?: string;
  images?: string[];
  sourceUrl: string;
  sourceId?: string;
  // Additional plant-specific attributes
  specifications?: {
    height?: string;
    width?: string;
    matureHeight?: string | string[]; // Can be multiple values
    matureWidth?: string | string[]; // Can be multiple values
    position?: string | string[]; // Can be multiple values (e.g., "Full Sun", "Semi Shade")
    soilType?: string | string[]; // Can be multiple values
    growthRate?: string;
    matureSize?: string;
    sunRequirements?: string;
    waterRequirements?: string;
    hardinessZone?: string;
    bloomTime?: string;
    flowerColor?: string;
    foliageColor?: string;
    foliageType?: string; // Extracted from itemprop="foliage"
    plantType?: string; // Extracted from itemprop="plant-type"
    plantHabit?: string | string[]; // Extracted from itemprop="habit", can be multiple
    evergreen?: boolean;
    deciduous?: boolean;
    native?: boolean;
    [key: string]: unknown;
  };
  commonNames?: string[]; // Multiple common names
  careInstructions?: string;
  plantingInstructions?: string;
  metadata?: Record<string, unknown>;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{
    productId?: string;
    url?: string;
    message: string;
    timestamp: Date;
  }>;
}

export interface ScrapingJobData {
  jobType: ScrapingJobType;
  status: ScrapingJobStatus;
  startedAt?: Date;
  completedAt?: Date;
  productsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  errors: Array<{
    productId?: string;
    url?: string;
    message: string;
    timestamp: Date;
  }>;
  metadata: Record<string, unknown>;
}

export interface PlantmarkApiConfig {
  baseUrl?: string;
  apiKey?: string;
  useProxy?: boolean;
  proxyUrl?: string;
  rateLimitMs?: number; // Minimum delay between requests in milliseconds
  email?: string; // Login email for accessing prices
  password?: string; // Login password for accessing prices
}

export interface PlantmarkApiResponse {
  products?: PlantmarkProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

