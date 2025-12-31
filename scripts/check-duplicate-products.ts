import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function checkDuplicates() {
  try {
    console.log('🔍 Checking for duplicate products in database...\n')

    // Check for duplicate slugs
    const duplicateSlugs = await prisma.$queryRaw<Array<{ slug: string; count: bigint }>>`
      SELECT slug, COUNT(*) as count
      FROM "Product"
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `

    console.log(`📊 Duplicate slugs found: ${duplicateSlugs.length}`)
    if (duplicateSlugs.length > 0) {
      console.log('\nDuplicate slugs:')
      for (const dup of duplicateSlugs.slice(0, 20)) {
        const products = await prisma.product.findMany({
          where: { slug: dup.slug },
          select: {
            id: true,
            name: true,
            slug: true,
            sourceUrl: true,
            sourceId: true,
            createdAt: true,
          },
        })
        console.log(`\n  Slug: "${dup.slug}" (${dup.count} products)`)
        products.forEach((p, i) => {
          console.log(`    ${i + 1}. ${p.name}`)
          console.log(`       ID: ${p.id}`)
          console.log(`       Source URL: ${p.sourceUrl || 'N/A'}`)
          console.log(`       Source ID: ${p.sourceId || 'N/A'}`)
          console.log(`       Created: ${p.createdAt.toISOString().split('T')[0]}`)
        })
      }
      if (duplicateSlugs.length > 20) {
        console.log(`\n  ... and ${duplicateSlugs.length - 20} more duplicate slugs`)
      }
    }

    // Check for duplicate sourceUrls
    const duplicateSourceUrls = await prisma.$queryRaw<Array<{ sourceUrl: string; count: bigint }>>`
      SELECT "sourceUrl", COUNT(*) as count
      FROM "Product"
      WHERE "sourceUrl" IS NOT NULL AND "sourceUrl" != ''
      GROUP BY "sourceUrl"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `

    console.log(`\n📊 Duplicate sourceUrls found: ${duplicateSourceUrls.length}`)
    if (duplicateSourceUrls.length > 0) {
      console.log('\nDuplicate sourceUrls:')
      for (const dup of duplicateSourceUrls.slice(0, 20)) {
        const products = await prisma.product.findMany({
          where: { sourceUrl: dup.sourceUrl },
          select: {
            id: true,
            name: true,
            slug: true,
            sourceUrl: true,
            sourceId: true,
            createdAt: true,
          },
        })
        console.log(`\n  URL: "${dup.sourceUrl}" (${dup.count} products)`)
        products.forEach((p, i) => {
          console.log(`    ${i + 1}. ${p.name} (${p.slug})`)
          console.log(`       ID: ${p.id}`)
          console.log(`       Source ID: ${p.sourceId || 'N/A'}`)
          console.log(`       Created: ${p.createdAt.toISOString().split('T')[0]}`)
        })
      }
      if (duplicateSourceUrls.length > 20) {
        console.log(`\n  ... and ${duplicateSourceUrls.length - 20} more duplicate URLs`)
      }
    }

    // Check for duplicate sourceIds
    const duplicateSourceIds = await prisma.$queryRaw<Array<{ sourceId: string; count: bigint }>>`
      SELECT "sourceId", COUNT(*) as count
      FROM "Product"
      WHERE "sourceId" IS NOT NULL AND "sourceId" != ''
      GROUP BY "sourceId"
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `

    console.log(`\n📊 Duplicate sourceIds found: ${duplicateSourceIds.length}`)
    if (duplicateSourceIds.length > 0) {
      console.log('\nDuplicate sourceIds:')
      for (const dup of duplicateSourceIds.slice(0, 20)) {
        const products = await prisma.product.findMany({
          where: { sourceId: dup.sourceId },
          select: {
            id: true,
            name: true,
            slug: true,
            sourceUrl: true,
            sourceId: true,
            createdAt: true,
          },
        })
        console.log(`\n  Source ID: "${dup.sourceId}" (${dup.count} products)`)
        products.forEach((p, i) => {
          console.log(`    ${i + 1}. ${p.name} (${p.slug})`)
          console.log(`       ID: ${p.id}`)
          console.log(`       Source URL: ${p.sourceUrl || 'N/A'}`)
          console.log(`       Created: ${p.createdAt.toISOString().split('T')[0]}`)
        })
      }
      if (duplicateSourceIds.length > 20) {
        console.log(`\n  ... and ${duplicateSourceIds.length - 20} more duplicate source IDs`)
      }
    }

    // Check for products with very similar names (potential duplicates with different slugs)
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sourceUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`\n📊 Checking for products with similar names...`)
    const similarNames: Array<{ name1: string; slug1: string; name2: string; slug2: string }> = []
    
    for (let i = 0; i < allProducts.length; i++) {
      for (let j = i + 1; j < allProducts.length; j++) {
        const p1 = allProducts[i]
        const p2 = allProducts[j]
        
        // Normalize names for comparison (lowercase, remove extra spaces)
        const name1 = p1.name.toLowerCase().trim().replace(/\s+/g, ' ')
        const name2 = p2.name.toLowerCase().trim().replace(/\s+/g, ' ')
        
        // Check if names are very similar (same after normalization, or one contains the other)
        if (name1 === name2 || 
            (name1.length > 10 && name2.includes(name1)) ||
            (name2.length > 10 && name1.includes(name2))) {
          similarNames.push({
            name1: p1.name,
            slug1: p1.slug,
            name2: p2.name,
            slug2: p2.slug,
          })
        }
        
        // Limit to avoid too many comparisons
        if (similarNames.length >= 50) break
      }
      if (similarNames.length >= 50) break
    }

    if (similarNames.length > 0) {
      console.log(`\nFound ${similarNames.length} pairs with similar names (showing first 20):`)
      similarNames.slice(0, 20).forEach((pair, i) => {
        console.log(`\n  ${i + 1}. "${pair.name1}" (${pair.slug1})`)
        console.log(`     "${pair.name2}" (${pair.slug2})`)
      })
    } else {
      console.log('  No similar names found')
    }

    // Summary
    const totalDuplicates = duplicateSlugs.length + duplicateSourceUrls.length + duplicateSourceIds.length
    console.log(`\n📋 Summary:`)
    console.log(`  Total products: ${allProducts.length}`)
    console.log(`  Duplicate slugs: ${duplicateSlugs.length}`)
    console.log(`  Duplicate sourceUrls: ${duplicateSourceUrls.length}`)
    console.log(`  Duplicate sourceIds: ${duplicateSourceIds.length}`)
    console.log(`  Total duplicate groups: ${totalDuplicates}`)
    
    if (totalDuplicates > 0) {
      const duplicateProductCount = duplicateSlugs.reduce((sum, d) => sum + Number(d.count), 0) +
                                   duplicateSourceUrls.reduce((sum, d) => sum + Number(d.count), 0) +
                                   duplicateSourceIds.reduce((sum, d) => sum + Number(d.count), 0)
      console.log(`\n  ⚠️  Found ${duplicateProductCount} products that are duplicates`)
      console.log(`  This could explain the discrepancy between database (1967) and scraped (1493)`)
    }

  } catch (error) {
    console.error('❌ Error checking duplicates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicates()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

