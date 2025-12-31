#!/usr/bin/env tsx
/**
 * Fix products with UUID slugs and ensure all products have proper categories
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Import utilities (these don't need DB connection)
import { generateSlug } from '../packages/data-import/src/utils/validation';

async function main() {
  // Import Prisma AFTER env vars are loaded
  const { prisma } = await import('@nursery/db');
  console.log('🔧 Fixing product slugs and categories...\n');

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: {
          name: true,
          parentId: true,
        },
      },
      sourceUrl: true,
    },
  });

  console.log(`Found ${products.length} products\n`);

  let fixedSlugs = 0;
  let fixedCategories = 0;
  let needsCategory = 0;

  for (const product of products) {
    let needsUpdate = false;
    const updateData: any = {};

    // Check if slug is a UUID (36 characters with hyphens)
    const slug = product.slug || '';
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    if (isUUID || !slug || slug.trim() === '') {
      console.log(`  🔍 Found product with UUID/empty slug: "${product.name}" (slug: "${slug}")`);
      // Generate proper slug from name
      const newSlug = generateSlug(product.name);
      
      // Check if slug already exists
      const existing = await prisma.product.findFirst({
        where: {
          slug: newSlug,
          id: { not: product.id },
        },
      });

      if (existing) {
        // Append short ID to make unique
        updateData.slug = `${newSlug}-${product.id.substring(0, 8)}`;
      } else {
        updateData.slug = newSlug;
      }
      
      needsUpdate = true;
      fixedSlugs++;
      console.log(`  ✅ Fixed slug for "${product.name}": ${product.slug} → ${updateData.slug}`);
    }

    // Check category
    if (!product.categoryId) {
      needsCategory++;
      console.log(`  ⚠️  Product "${product.name}" has no category`);
      
      // Try to extract category from URL
      if (product.sourceUrl) {
        try {
          const url = new URL(product.sourceUrl);
          const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
          if (pathParts.length > 0) {
            const categorySlug = pathParts[0];
            const categoryName = categorySlug.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            // Map to main category
            const category = await prisma.category.findFirst({
              where: {
                name: { contains: categoryName, mode: 'insensitive' },
                parentId: null,
              },
            });
            
            if (category) {
              updateData.categoryId = category.id;
              needsUpdate = true;
              fixedCategories++;
              console.log(`  ✅ Assigned category "${category.name}" from URL`);
            }
          }
        } catch (e) {
          // URL parsing failed
        }
      }
    } else if (product.category?.parentId) {
      // Product is in a sub-category, need to move to primary
      console.log(`  ⚠️  Product "${product.name}" is in sub-category "${product.category.name}"`);
      
      // Find primary category
      let currentCategoryId: string | null = product.categoryId;
      const visited = new Set<string>();
      
      while (currentCategoryId && !visited.has(currentCategoryId)) {
        visited.add(currentCategoryId);
        const cat = await prisma.category.findUnique({
          where: { id: currentCategoryId },
          select: { id: true, name: true, parentId: true },
        });
        
        if (!cat) break;
        if (!cat.parentId) {
          // Found primary category
          updateData.categoryId = cat.id;
          needsUpdate = true;
          fixedCategories++;
          console.log(`  ✅ Moved to primary category "${cat.name}"`);
          break;
        }
        currentCategoryId = cat.parentId;
      }
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
    }
  }

  console.log(`\n✅ Summary:`);
  console.log(`   Fixed slugs: ${fixedSlugs}`);
  console.log(`   Fixed categories: ${fixedCategories}`);
  console.log(`   Products still needing category: ${needsCategory - fixedCategories}\n`);
}

main().catch(console.error);

