import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function fixSlugsFromUrl() {
  try {
    console.log('🔧 Fixing product slugs to use SEO-friendly URLs from sourceUrl...\n')

    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sourceUrl: true,
      },
    })

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const product of allProducts) {
      if (!product.sourceUrl) {
        skipped++
        continue
      }

      try {
        // Extract SEO-friendly slug from sourceUrl
        const url = new URL(product.sourceUrl)
        const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder')
        const seoSlug = pathParts[pathParts.length - 1]

        if (!seoSlug) {
          skipped++
          continue
        }

        // Only update if slug is different
        if (product.slug === seoSlug) {
          skipped++
          continue
        }

        // Check if the new slug already exists for a different product
        const existing = await prisma.product.findFirst({
          where: {
            slug: seoSlug,
            id: { not: product.id },
          },
        })

        if (existing) {
          console.log(`  ⚠️  Slug "${seoSlug}" already exists for product "${existing.name}"`)
          console.log(`     Skipping "${product.name}" (current slug: ${product.slug})`)
          skipped++
          continue
        }

        // Update the slug
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: seoSlug },
        })

        fixed++
        if (fixed % 100 === 0) {
          console.log(`  ✅ Fixed ${fixed} products...`)
        }
      } catch (error) {
        console.error(`  ❌ Error fixing slug for "${product.name}":`, error)
        errors++
      }
    }

    console.log(`\n✅ Summary:`)
    console.log(`  Fixed: ${fixed} products`)
    console.log(`  Skipped: ${skipped} products (already correct or no sourceUrl)`)
    console.log(`  Errors: ${errors} products`)

  } catch (error) {
    console.error('❌ Error fixing slugs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixSlugsFromUrl()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

