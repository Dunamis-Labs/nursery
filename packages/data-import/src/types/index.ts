import { ScrapingJobType, ScrapingJobStatus } from '@nursery/db';

export interface PlantmarkProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  botanicalName?: string;
  commonName?: string;
  price?: number;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  category?: string;
  categoryPath?: string[];
  imageUrl?: string;
  images?: string[];
  sourceUrl: string;
  sourceId?: string;
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
}

export interface PlantmarkApiResponse {
  products?: PlantmarkProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

