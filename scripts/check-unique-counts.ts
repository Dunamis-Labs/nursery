import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function checkUniqueCounts() {
  try {
    console.log('📊 Checking unique product identifiers...\n')

    const total = await prisma.product.count()
    
    const uniqueUrlsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "sourceUrl") as count
      FROM "Product"
      WHERE "sourceUrl" IS NOT NULL
    `
    const uniqueUrls = Number(uniqueUrlsResult[0].count)

    const uniqueSourceIdsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT "sourceId") as count
      FROM "Product"
      WHERE "sourceId" IS NOT NULL AND "sourceId" != ''
    `
    const uniqueSourceIds = Number(uniqueSourceIdsResult[0].count)

    const uniqueSlugsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT slug) as count
      FROM "Product"
      WHERE slug IS NOT NULL
    `
    const uniqueSlugs = Number(uniqueSlugsResult[0].count)

    console.log(`Total products: ${total}`)
    console.log(`Unique sourceUrls: ${uniqueUrls}`)
    console.log(`Unique sourceIds: ${uniqueSourceIds}`)
    console.log(`Unique slugs: ${uniqueSlugs}`)
    console.log(`\nDifferences:`)
    console.log(`  Total - Unique URLs: ${total - uniqueUrls} (duplicates by URL)`)
    console.log(`  Total - Unique Source IDs: ${total - uniqueSourceIds} (duplicates by Source ID)`)
    console.log(`  Total - Unique Slugs: ${total - uniqueSlugs} (duplicates by slug)`)
    
    console.log(`\n📋 Conclusion:`)
    if (total - uniqueUrls === 1) {
      console.log(`  Only 1 duplicate by sourceUrl (the calathea-zebrina we found)`)
      console.log(`  This means duplicates are NOT the cause of the 474 product discrepancy`)
      console.log(`  The issue is that scraping is incomplete - not finding all products`)
    } else {
      console.log(`  Found ${total - uniqueUrls} duplicates by sourceUrl`)
    }

  } catch (error) {
    console.error('❌ Error checking unique counts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkUniqueCounts()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

