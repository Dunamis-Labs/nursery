import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@nursery/db"

interface PlantFinderAnswers {
  light: string
  careEffort: string
  petSafe: string
  space: string
  goals: string[]
}

/**
 * Map light requirements from database to plant finder light values
 */
function mapLightRequirement(lightReq: string | null | undefined): string[] {
  if (!lightReq) return []
  
  const lower = lightReq.toLowerCase()
  const matches: string[] = []
  
  // Bright direct light
  if (lower.includes("full sun") || lower.includes("direct sun") || lower.includes("bright direct")) {
    matches.push("bright-direct")
  }
  
  // Bright indirect light
  if (lower.includes("bright indirect") || lower.includes("bright") && !lower.includes("direct")) {
    matches.push("bright-indirect")
  }
  
  // Medium light
  if (lower.includes("partial") || lower.includes("medium") || lower.includes("filtered")) {
    matches.push("medium")
  }
  
  // Low light
  if (lower.includes("low") || lower.includes("shade") || lower.includes("indirect")) {
    matches.push("low")
  }
  
  // If no specific matches, try to infer from common patterns
  if (matches.length === 0) {
    if (lower.includes("bright")) {
      matches.push("bright-indirect", "medium")
    } else if (lower.includes("partial") || lower.includes("filtered")) {
      matches.push("medium", "low")
    } else {
      // Default to medium if unclear
      matches.push("medium")
    }
  }
  
  return matches
}

/**
 * Map difficulty to care effort levels
 */
function mapDifficultyToCareEffort(difficulty: string | null | undefined): string[] {
  if (!difficulty) return ["easiest", "basic", "hobby"] // If no difficulty, include all
  
  const lower = difficulty.toLowerCase()
  
  if (lower.includes("easy") || lower.includes("beginner")) {
    return ["easiest"]
  } else if (lower.includes("moderate") || lower.includes("medium") || lower.includes("intermediate")) {
    return ["easiest", "basic"]
  } else if (lower.includes("difficult") || lower.includes("hard") || lower.includes("advanced") || lower.includes("expert")) {
    return ["hobby"]
  }
  
  // Default: include all if unclear
  return ["easiest", "basic", "hobby"]
}

/**
 * Check if product is pet safe based on toxicity
 */
function isPetSafe(toxicity: string | null | undefined): boolean {
  if (!toxicity) return false // If unknown, assume not safe
  
  const lower = toxicity.toLowerCase()
  return lower.includes("non-toxic") || lower.includes("safe") || lower.includes("pet-safe")
}

/**
 * Determine product size from metadata or description
 */
function getProductSizes(product: any): string[] {
  const sizes: string[] = []
  const metadata = (product.metadata as Record<string, unknown>) || {}
  
  // Check metadata for size information
  const sizeInfo = metadata.size || metadata.height || metadata.matureSize
  
  if (sizeInfo) {
    const sizeStr = String(sizeInfo).toLowerCase()
    if (sizeStr.includes("small") || sizeStr.includes("compact") || sizeStr.includes("mini")) {
      sizes.push("small")
    }
    if (sizeStr.includes("medium") || sizeStr.includes("mid")) {
      sizes.push("medium")
    }
    if (sizeStr.includes("large") || sizeStr.includes("tall") || sizeStr.includes("statement")) {
      sizes.push("large")
    }
  }
  
  // Check description for size hints
  const description = product.description?.toLowerCase() || ""
  if (description.includes("compact") || description.includes("small") || description.includes("desk") || description.includes("shelf")) {
    if (!sizes.includes("small")) sizes.push("small")
  }
  if (description.includes("floor") || description.includes("medium")) {
    if (!sizes.includes("medium")) sizes.push("medium")
  }
  if (description.includes("large") || description.includes("statement") || description.includes("tall") || description.includes("tree")) {
    if (!sizes.includes("large")) sizes.push("large")
  }
  
  // If no size info found, default to medium
  if (sizes.length === 0) {
    sizes.push("medium")
  }
  
  return sizes
}

/**
 * Extract benefits/goals from ProductContent
 */
function getProductBenefits(product: any): string[] {
  const benefits: string[] = []
  const content = product.content
  
  if (content?.benefits) {
    const benefitsText = content.benefits.toLowerCase()
    
    // Map to plant finder goal IDs
    if (benefitsText.includes("air") || benefitsText.includes("purify")) {
      benefits.push("air-quality")
    }
    if (benefitsText.includes("privacy") || benefitsText.includes("height") || benefitsText.includes("screen")) {
      benefits.push("privacy")
    }
    if (benefitsText.includes("texture") || benefitsText.includes("visual") || benefitsText.includes("interest")) {
      benefits.push("texture")
    }
    if (benefitsText.includes("edible") || benefitsText.includes("fruit") || benefitsText.includes("vegetable")) {
      benefits.push("edible")
    }
    if (benefitsText.includes("low maintenance") || benefitsText.includes("minimal")) {
      benefits.push("minimal")
    }
  }
  
  // Check idealFor array
  if (content?.idealFor && Array.isArray(content.idealFor)) {
    content.idealFor.forEach((item: string) => {
      const lower = item.toLowerCase()
      if (lower.includes("air") || lower.includes("purify")) {
        if (!benefits.includes("air-quality")) benefits.push("air-quality")
      }
      if (lower.includes("privacy") || lower.includes("screen")) {
        if (!benefits.includes("privacy")) benefits.push("privacy")
      }
      if (lower.includes("edible") || lower.includes("fruit")) {
        if (!benefits.includes("edible")) benefits.push("edible")
      }
    })
  }
  
  // Default benefits if none found
  if (benefits.length === 0) {
    benefits.push("alive") // All plants make space feel alive
  } else {
    // Always include "alive" as a default benefit
    if (!benefits.includes("alive")) benefits.push("alive")
  }
  
  return benefits
}

export async function POST(request: NextRequest) {
  try {
    const body: PlantFinderAnswers = await request.json()
    const { light, careEffort, petSafe, space, goals } = body

    // Fetch all products with their specifications and content
    const products = await prisma.product.findMany({
      where: {
        availability: {
          not: "DISCONTINUED",
        },
      },
      include: {
        specification: true,
        content: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
      take: 1000, // Limit to prevent performance issues
    })

    // Filter products based on answers
    const matchedProducts = products.filter((product) => {
      // Light match
      const productLightOptions = mapLightRequirement(product.specification?.lightRequirements)
      if (productLightOptions.length > 0 && !productLightOptions.includes(light)) {
        return false
      }

      // Care effort match
      const productCareLevels = mapDifficultyToCareEffort(product.specification?.difficulty)
      if (!productCareLevels.includes(careEffort)) {
        return false
      }

      // Pet safe filter
      if (petSafe === "yes") {
        if (!isPetSafe(product.specification?.toxicity)) {
          return false
        }
      }

      // Size match
      const productSizes = getProductSizes(product)
      if (!productSizes.includes(space)) {
        return false
      }

      // Goals match (at least one goal should match)
      if (goals.length > 0) {
        const productBenefits = getProductBenefits(product)
        const hasMatchingGoal = goals.some((goal) => productBenefits.includes(goal))
        if (!hasMatchingGoal) {
          return false
        }
      }

      return true
    })

    // Format products for response
    const formattedProducts = matchedProducts.map((product) => {
      const images = (product.images as string[]) || []
      const primaryImage = images.length > 0 ? images[0] : product.imageUrl || "/placeholder.svg"
      const productBenefits = getProductBenefits(product)
      const productSizes = getProductSizes(product)

      // Generate reason text based on why it matches
      const reasons: string[] = []
      if (product.specification?.lightRequirements) {
        reasons.push(`Thrives in ${product.specification.lightRequirements.toLowerCase()}`)
      }
      if (product.specification?.difficulty) {
        const difficulty = product.specification.difficulty.toLowerCase()
        if (difficulty.includes("easy")) {
          reasons.push("Low maintenance and beginner-friendly")
        }
      }
      if (isPetSafe(product.specification?.toxicity)) {
        reasons.push("Pet-safe")
      }

      // Generate tags
      const tags: string[] = []
      if (product.specification?.difficulty?.toLowerCase().includes("easy")) {
        tags.push("Beginner-friendly")
      }
      if (product.specification?.lightRequirements?.toLowerCase().includes("low")) {
        tags.push("Low light")
      }
      if (productBenefits.includes("air-quality")) {
        tags.push("Air-purifying")
      }
      if (isPetSafe(product.specification?.toxicity)) {
        tags.push("Pet-safe")
      }
      if (product.specification?.growthRate?.toLowerCase().includes("fast")) {
        tags.push("Fast-growing")
      }
      if (productSizes.includes("large")) {
        tags.push("Statement plant")
      }

      return {
        id: product.id,
        slug: product.slug,
        name: product.commonName || product.name,
        botanical: product.botanicalName || product.name,
        price: product.price ? Number(product.price) : null,
        image: primaryImage,
        reason: reasons.join(". ") || "Well-suited to your space and preferences",
        tags: tags.length > 0 ? tags : ["Indoor plant"],
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      count: formattedProducts.length,
    })
  } catch (error) {
    console.error("Error in plant finder API:", error)
    return NextResponse.json(
      { error: "Failed to find matching plants" },
      { status: 500 }
    )
  }
}

