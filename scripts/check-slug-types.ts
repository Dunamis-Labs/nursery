import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function checkSlugTypes() {
  try {
    console.log('🔍 Checking product slug types...\n')

    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sourceUrl: true,
      },
    })

    // Check for UUID-like slugs (36 characters with hyphens)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    const productsWithUuidSlugs: Array<{ id: string; name: string; slug: string; sourceUrl: string | null }> = []
    const productsWithGeneratedSlugs: Array<{ id: string; name: string; slug: string; sourceUrl: string | null }> = []
    const productsWithSeoSlugs: Array<{ id: string; name: string; slug: string; sourceUrl: string | null }> = []

    for (const product of allProducts) {
      if (!product.slug) {
        continue
      }

      // Check if slug matches the UUID pattern
      if (uuidPattern.test(product.slug)) {
        productsWithUuidSlugs.push(product)
      } else if (product.sourceUrl) {
        // Check if slug matches the SEO-friendly URL from sourceUrl
        try {
          const url = new URL(product.sourceUrl)
          const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder')
          const seoSlug = pathParts[pathParts.length - 1]
          
          if (product.slug === seoSlug) {
            productsWithSeoSlugs.push(product)
          } else {
            // Slug doesn't match URL - likely generated from name
            productsWithGeneratedSlugs.push(product)
          }
        } catch (e) {
          productsWithGeneratedSlugs.push(product)
        }
      } else {
        productsWithGeneratedSlugs.push(product)
      }
    }

    console.log(`Total products: ${allProducts.length}`)
    console.log(`\n📊 Slug Analysis:`)
    console.log(`  Products with UUID slugs: ${productsWithUuidSlugs.length}`)
    console.log(`  Products with SEO-friendly slugs (from URL): ${productsWithSeoSlugs.length}`)
    console.log(`  Products with generated slugs (from name): ${productsWithGeneratedSlugs.length}`)

    if (productsWithUuidSlugs.length > 0) {
      console.log(`\n⚠️  Found ${productsWithUuidSlugs.length} products with UUID slugs (need fixing):`)
      productsWithUuidSlugs.slice(0, 10).forEach((p, i) => {
        const seoSlug = p.sourceUrl ? new URL(p.sourceUrl).pathname.split('/').filter(p => p && p !== 'plant-finder').pop() : 'N/A'
        console.log(`  ${i + 1}. ${p.name}`)
        console.log(`     Current slug: ${p.slug}`)
        console.log(`     Should be: ${seoSlug}`)
        console.log(`     URL: ${p.sourceUrl}`)
      })
      if (productsWithUuidSlugs.length > 10) {
        console.log(`  ... and ${productsWithUuidSlugs.length - 10} more`)
      }
    }

    if (productsWithGeneratedSlugs.length > 0 && productsWithGeneratedSlugs.length < 50) {
      console.log(`\n📝 Products with generated slugs (first 10):`)
      productsWithGeneratedSlugs.slice(0, 10).forEach((p, i) => {
        const seoSlug = p.sourceUrl ? new URL(p.sourceUrl).pathname.split('/').filter(p => p && p !== 'plant-finder').pop() : 'N/A'
        console.log(`  ${i + 1}. ${p.name}`)
        console.log(`     Current slug: ${p.slug}`)
        if (p.sourceUrl && seoSlug !== p.slug) {
          console.log(`     SEO slug from URL: ${seoSlug}`)
        }
      })
    }

  } catch (error) {
    console.error('❌ Error checking slug types:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkSlugTypes()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

