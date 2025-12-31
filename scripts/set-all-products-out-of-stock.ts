import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function setAllProductsOutOfStock() {
  try {
    console.log('🔄 Setting all products to OUT_OF_STOCK...')

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        availability: true,
        metadata: true,
      },
    })

    console.log(`📦 Found ${products.length} products to update`)

    let updated = 0
    let variantsUpdated = 0

    for (const product of products) {
      const metadata = (product.metadata as Record<string, unknown>) || {}
      const variants = (metadata.variants as Array<{
        size?: string
        price?: number
        availability?: string
        stock?: number
      }>) || []

      // Update variants to OUT_OF_STOCK and stock to 0
      if (variants.length > 0) {
        const updatedVariants = variants.map(variant => ({
          ...variant,
          availability: 'OUT_OF_STOCK' as const,
          stock: 0,
        }))

        metadata.variants = updatedVariants
        variantsUpdated += variants.length
      }

      // Update product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          availability: 'OUT_OF_STOCK',
          metadata: metadata as any,
        },
      })

      updated++
      
      if (updated % 100 === 0) {
        console.log(`  ✅ Updated ${updated}/${products.length} products...`)
      }
    }

    console.log('\n✅ Successfully updated all products!')
    console.log(`   - Products updated: ${updated}`)
    console.log(`   - Variants updated: ${variantsUpdated}`)
    console.log(`   - All products are now OUT_OF_STOCK`)
    console.log(`   - All inventory is set to 0`)

  } catch (error) {
    console.error('❌ Error updating products:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setAllProductsOutOfStock()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })


