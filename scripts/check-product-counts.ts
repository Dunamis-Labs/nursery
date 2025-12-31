import { PrismaClient, ProductSource } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function checkProductCounts() {
  try {
    console.log('📊 Analyzing product counts in database...\n')

    // Total products
    const totalProducts = await prisma.product.count()
    console.log(`Total products in database: ${totalProducts}`)

    // Products by source
    const bySource = await prisma.product.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
    })

    console.log('\nProducts by source:')
    bySource.forEach((group) => {
      console.log(`  ${group.source}: ${group._count.id}`)
    })

    // Products with sourceUrl (likely from Plantmark)
    const withSourceUrl = await prisma.product.count({
      where: {
        sourceUrl: {
          not: null,
        },
      },
    })

    console.log(`\nProducts with sourceUrl: ${withSourceUrl}`)

    // Products from Plantmark (SCRAPED source)
    const scrapedProducts = await prisma.product.count({
      where: {
        source: ProductSource.SCRAPED,
      },
    })

    console.log(`Products with SCRAPED source: ${scrapedProducts}`)

    // Products with Plantmark sourceUrl
    const plantmarkProducts = await prisma.product.count({
      where: {
        sourceUrl: {
          contains: 'plantmark.com.au',
        },
      },
    })

    console.log(`Products with plantmark.com.au in sourceUrl: ${plantmarkProducts}`)

    // Products without sourceUrl (likely manual)
    const withoutSourceUrl = await prisma.product.count({
      where: {
        OR: [
          { sourceUrl: null },
          { sourceUrl: '' },
        ],
      },
    })

    console.log(`\nProducts without sourceUrl: ${withoutSourceUrl}`)

    // Products with MANUAL source
    const manualProducts = await prisma.product.count({
      where: {
        source: ProductSource.MANUAL,
      },
    })

    console.log(`Products with MANUAL source: ${manualProducts}`)

    // Products with API source
    const apiProducts = await prisma.product.count({
      where: {
        source: ProductSource.API,
      },
    })

    console.log(`Products with API source: ${apiProducts}`)

    // Summary
    console.log('\n📋 Summary:')
    console.log(`  Total in database: ${totalProducts}`)
    console.log(`  From Plantmark (SCRAPED): ${scrapedProducts}`)
    console.log(`  Manual/Other: ${totalProducts - scrapedProducts}`)
    console.log(`  Difference: ${totalProducts - scrapedProducts} products not from Plantmark import`)

  } catch (error) {
    console.error('❌ Error checking product counts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkProductCounts()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

