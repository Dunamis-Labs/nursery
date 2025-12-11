// Shared TypeScript types
export type { Product, Category, BlogPost, Guide } from '@nursery/db';

export type ProductType = 'DIGITAL' | 'DROPSHIPPED' | 'PHYSICAL' | 'BUNDLE';
export type AvailabilityStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

