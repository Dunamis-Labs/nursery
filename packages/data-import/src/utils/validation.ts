import { z } from 'zod';
import type { PlantmarkProduct } from '../types';

/**
 * Validation schema for Plantmark product data
 */
export const plantmarkProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  botanicalName: z.string().optional(),
  commonName: z.string().optional(),
  price: z.number().positive().optional(),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'DISCONTINUED']).optional(),
  category: z.string().optional(),
  categoryPath: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  sourceUrl: z.string().url(),
  sourceId: z.string().optional(),
  specifications: z.record(z.unknown()).optional(),
  careInstructions: z.string().optional(),
  plantingInstructions: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Validate and normalize product data
 */
export function validateProduct(data: unknown): {
  valid: boolean;
  product?: PlantmarkProduct;
  errors?: string[];
} {
  try {
    const validated = plantmarkProductSchema.parse(data);
    return { valid: true, product: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

/**
 * Generate slug from product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize product data for database storage
 */
export function normalizeProduct(product: PlantmarkProduct): PlantmarkProduct {
  return {
    ...product,
    slug: product.slug || generateSlug(product.name),
    name: product.name.trim(),
    description: product.description?.trim(),
    botanicalName: product.botanicalName?.trim(),
    commonName: product.commonName?.trim(),
  };
}

