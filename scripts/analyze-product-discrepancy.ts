import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function analyzeDiscrepancy() {
  try {
    console.log('📊 Analyzing product discrepancy...\n')

    // Total products in database
    const totalProducts = await prisma.product.count()
    console.log(`Total products in database: ${totalProducts}`)

    // Products with valid sourceUrl
    const productsWithUrl = await prisma.product.findMany({
      where: {
        sourceUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        sourceUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Products with sourceUrl: ${productsWithUrl.length}`)

    // Check for products that might have been removed from Plantmark
    // (products that haven't been updated recently)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldProducts = await prisma.product.count({
      where: {
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    })

    console.log(`\nProducts not updated in last 30 days: ${oldProducts}`)

    // Sample of oldest products
    const oldestProducts = await prisma.product.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      take: 10,
      select: {
        name: true,
        sourceUrl: true,
        createdAt: true,
      },
    })

    console.log('\nOldest 10 products (by creation date):')
    oldestProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`)
      console.log(`     Created: ${p.createdAt.toISOString().split('T')[0]}`)
      console.log(`     URL: ${p.sourceUrl || 'N/A'}`)
    })

    // Check if there are duplicate sourceUrls
    const sourceUrlCounts = await prisma.product.groupBy({
      by: ['sourceUrl'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    })

    console.log(`\nDuplicate sourceUrls found: ${sourceUrlCounts.length}`)
    if (sourceUrlCounts.length > 0) {
      console.log('Sample duplicates:')
      sourceUrlCounts.slice(0, 5).forEach((group) => {
        console.log(`  ${group.sourceUrl}: ${group._count.id} products`)
      })
    }

    // Calculate the discrepancy
    const discrepancy = totalProducts - 1493
    console.log(`\n📋 Summary:`)
    console.log(`  Database has: ${totalProducts} products`)
    console.log(`  Scraped from Plantmark: 1493 products`)
    console.log(`  Discrepancy: ${discrepancy} products`)
    console.log(`\n  This means ${discrepancy} products in the database are not found when scraping Plantmark.`)
    console.log(`  Possible reasons:`)
    console.log(`    1. Products were removed from Plantmark's website`)
    console.log(`    2. Scraping is incomplete (pagination issue, blocked pages)`)
    console.log(`    3. Products were imported from a different source`)

  } catch (error) {
    console.error('❌ Error analyzing discrepancy:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

analyzeDiscrepancy()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

