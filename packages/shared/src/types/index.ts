// Shared TypeScript types
// Note: Prisma types (Product, Category, etc.) will be available after running: npm run db:generate
// Import Prisma types directly from @prisma/client after generation

export type ProductType = 'DIGITAL' | 'DROPSHIPPED' | 'PHYSICAL' | 'BUNDLE';
export type AvailabilityStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

