"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import Link from "next/link"

interface FlowState {
  light: string
  careEffort: string
  petSafe: string
  space: string
  goals: string[]
}

interface PlantFinderResultsProps {
  answers: FlowState
  onRestart: () => void
}

// Plant database with attributes for matching
const plantDatabase = [
  {
    id: 1,
    name: "Snake Plant",
    botanical: "Sansevieria trifasciata",
    price: 32.99,
    image: "/snake-plant-sansevieria-pot.jpg",
    light: ["low", "medium", "bright-indirect"],
    careLevel: "easiest",
    petSafe: false,
    size: ["small", "medium"],
    benefits: ["alive", "minimal", "air-quality"],
    reason: "Tolerates low light and missed watering",
    tags: ["Beginner-friendly", "Low light", "Air-purifying"],
  },
  {
    id: 2,
    name: "Spider Plant",
    botanical: "Chlorophytum comosum",
    price: 22.99,
    image: "/spider-plant-hanging-pot.jpg",
    light: ["medium", "bright-indirect"],
    careLevel: "easiest",
    petSafe: true,
    size: ["small"],
    benefits: ["alive", "minimal", "air-quality"],
    reason: "Safe for pets and incredibly forgiving",
    tags: ["Pet-safe", "Beginner-friendly", "Air-purifying"],
  },
  {
    id: 3,
    name: "Pothos",
    botanical: "Epipremnum aureum",
    price: 24.99,
    image: "/pothos-hanging-plant-pot.jpg",
    light: ["low", "medium", "bright-indirect"],
    careLevel: "easiest",
    petSafe: false,
    size: ["small", "medium"],
    benefits: ["alive", "minimal", "air-quality", "texture"],
    reason: "Thrives in various light conditions with minimal care",
    tags: ["Beginner-friendly", "Low light", "Fast-growing"],
  },
  {
    id: 4,
    name: "ZZ Plant",
    botanical: "Zamioculcas zamiifolia",
    price: 36.99,
    image: "/zz-plant-zamioculcas-pot.jpg",
    light: ["low", "medium", "bright-indirect"],
    careLevel: "easiest",
    petSafe: false,
    size: ["small", "medium"],
    benefits: ["alive", "minimal"],
    reason: "Extremely drought-tolerant and low maintenance",
    tags: ["Beginner-friendly", "Low light", "Drought-tolerant"],
  },
  {
    id: 5,
    name: "Peace Lily",
    botanical: "Spathiphyllum",
    price: 29.99,
    image: "/peace-lily-white-flower-pot.jpg",
    light: ["low", "medium"],
    careLevel: "basic",
    petSafe: false,
    size: ["small", "medium"],
    benefits: ["alive", "air-quality", "texture"],
    reason: "Blooms indoors and purifies air effectively",
    tags: ["Flowering", "Air-purifying", "Low light"],
  },
  {
    id: 6,
    name: "Rubber Plant",
    botanical: "Ficus elastica",
    price: 39.99,
    image: "/rubber-plant-ficus-elastica-pot.jpg",
    light: ["bright-indirect"],
    careLevel: "basic",
    petSafe: false,
    size: ["medium", "large"],
    benefits: ["alive", "privacy", "texture"],
    reason: "Fast-growing with bold glossy foliage",
    tags: ["Fast-growing", "Statement plant"],
  },
  {
    id: 7,
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 45.99,
    image: "/monstera-deliciosa-full-plant-pot.jpg",
    light: ["medium", "bright-indirect"],
    careLevel: "basic",
    petSafe: false,
    size: ["medium", "large"],
    benefits: ["alive", "privacy", "texture"],
    reason: "Iconic tropical look with easy care requirements",
    tags: ["Statement plant", "Fast-growing"],
  },
  {
    id: 8,
    name: "Fiddle Leaf Fig",
    botanical: "Ficus lyrata",
    price: 68.99,
    image: "/fiddle-leaf-fig-tree-pot.jpg",
    light: ["bright-indirect"],
    careLevel: "hobby",
    petSafe: false,
    size: ["large"],
    benefits: ["alive", "privacy", "texture"],
    reason: "Dramatic statement plant with architectural presence",
    tags: ["Statement plant", "Large"],
  },
]

// Canonical decision statements for common scenarios
const decisionStatements = {
  "low-easiest": {
    title: "Low Light, Minimal Care Plants",
    explanation:
      "These plants thrive in low-light conditions and tolerate infrequent watering. They have adapted to survive with limited resources, making them resilient to missed waterings and low humidity. Their slow growth rate means less frequent repotting and pruning.",
  },
  "bright-indirect-basic": {
    title: "Bright Indirect Light, Basic Care Plants",
    explanation:
      "These plants grow well in bright indirect light and respond to consistent basic care. They benefit from regular watering schedules and occasional fertilizing, producing faster growth and fuller foliage than low-light varieties. They adapt well to typical indoor conditions.",
  },
  "pet-safe": {
    title: "Pet-Safe Plants",
    explanation:
      "These plants are non-toxic to cats and dogs. They contain no harmful compounds that cause digestive upset or toxicity if chewed or ingested. Pet-safe plants allow you to add greenery without worry in homes with curious animals.",
  },
  "small-space": {
    title: "Small Space Plants",
    explanation:
      "These plants stay compact and grow slowly, making them suitable for desks, shelves, and windowsills. Their root systems remain manageable in small pots, and their growth habit does not require frequent pruning or large containers.",
  },
  "large-statement": {
    title: "Statement Plants for Bright Spaces",
    explanation:
      "These plants grow tall with bold architectural foliage, creating visual impact in bright spaces. They require more light to support their larger leaf area and faster growth rate. Statement plants fill vertical space and serve as focal points in room design.",
  },
}

function getDecisionExplanation(answers: FlowState): { title: string; explanation: string } {
  // Match canonical scenarios
  if (answers.light === "low" && answers.careEffort === "easiest") {
    return decisionStatements["low-easiest"]
  }
  if (answers.light === "bright-indirect" && answers.careEffort === "basic") {
    return decisionStatements["bright-indirect-basic"]
  }
  if (answers.petSafe === "yes") {
    return decisionStatements["pet-safe"]
  }
  if (answers.space === "small") {
    return decisionStatements["small-space"]
  }
  if (answers.space === "large" && (answers.light === "bright-indirect" || answers.light === "bright-direct")) {
    return decisionStatements["large-statement"]
  }

  // Generate dynamic explanation for other combinations
  const lightDescriptions: Record<string, string> = {
    "bright-direct": "direct sunlight",
    "bright-indirect": "bright indirect light",
    medium: "medium light",
    low: "low light",
  }

  const careDescriptions: Record<string, string> = {
    easiest: "minimal maintenance",
    basic: "basic care routines",
    hobby: "active plant care",
  }

  const spaceDescriptions: Record<string, string> = {
    small: "compact spaces",
    medium: "medium-sized areas",
    large: "larger spaces",
  }

  const lightText = lightDescriptions[answers.light]
  const careText = careDescriptions[answers.careEffort]
  const spaceText = spaceDescriptions[answers.space]

  let explanation = `These plants are well-suited to ${lightText} conditions and thrive with ${careText}. `

  if (answers.careEffort === "easiest") {
    explanation += "They tolerate occasional missed waterings and do not require frequent attention. "
  } else if (answers.careEffort === "hobby") {
    explanation += "They respond well to consistent care routines and benefit from regular observation. "
  }

  if (answers.petSafe === "yes") {
    explanation += "All recommended plants are non-toxic to pets. "
  }

  explanation += `They fit ${spaceText} and perform reliably in typical home conditions.`

  return {
    title: "Why These Plants Work",
    explanation,
  }
}

export function PlantFinderResults({ answers, onRestart }: PlantFinderResultsProps) {
  // Filter plants based on answers
  const matchedPlants = plantDatabase.filter((plant) => {
    // Light match
    if (!plant.light.includes(answers.light)) return false

    // Care level match (easiest matches all, basic matches basic+hobby, hobby matches hobby)
    if (answers.careEffort === "easiest" && plant.careLevel !== "easiest") return false
    if (answers.careEffort === "basic" && plant.careLevel === "hobby") return false

    // Pet safe filter
    if (answers.petSafe === "yes" && !plant.petSafe) return false

    // Size match
    if (!plant.size.includes(answers.space)) return false

    // Goals match (at least one goal should match)
    if (answers.goals.length > 0) {
      const hasMatchingGoal = answers.goals.some((goal) => plant.benefits.includes(goal))
      if (!hasMatchingGoal) return false
    }

    return true
  })

  // Generate summary text
  const getSummaryText = () => {
    const lightText = {
      "bright-direct": "bright direct light",
      "bright-indirect": "bright indirect light",
      medium: "medium light",
      low: "low light",
    }[answers.light]

    const careText = {
      easiest: "minimal maintenance",
      basic: "basic care",
      hobby: "active plant care",
    }[answers.careEffort]

    const spaceText = {
      small: "compact space",
      medium: "medium-sized area",
      large: "large space",
    }[answers.space]

    const petText = answers.petSafe === "yes" ? " and pet-safe requirements" : ""

    return `Based on your ${lightText} conditions, preference for ${careText}, ${spaceText}${petText}, these plants are well-suited to thrive in your home with minimal adjustment.`
  }

  const { title: decisionTitle, explanation: decisionExplanation } = getDecisionExplanation(answers)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-6">Plants That Fit Your Space</h1>
        </div>

        <Card className="p-8 border-[#e5e7eb] mb-12 bg-[#faf9f6]">
          <h2 className="font-serif text-2xl font-bold text-[#2c2c2c] mb-4">{decisionTitle}</h2>
          <p className="text-[#2c2c2c] leading-relaxed">{decisionExplanation}</p>
        </Card>

        {matchedPlants.length === 0 ? (
          <Card className="p-12 text-center border-[#e5e7eb]">
            <p className="text-lg text-[#6b7280] mb-6">
              We could not find plants that match all your criteria. Try adjusting your preferences to see more options.
            </p>
            <Button onClick={onRestart} className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white">
              Restart Plant Finder
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {matchedPlants.map((plant) => (
                <Card
                  key={plant.id}
                  className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105 border-[#e5e7eb]"
                >
                  <Link href={`/products/${plant.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={plant.image || "/placeholder.svg"}
                        alt={plant.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-1">{plant.name}</h3>
                      <p className="font-mono text-sm italic text-[#6b7280] mb-2">{plant.botanical}</p>
                      <p className="text-sm text-[#6b7280] mb-3 line-clamp-2">{plant.reason}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plant.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs bg-[#87a96b]/20 text-[#2d5016]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#2d5016]">${plant.price}</span>
                        <Button
                          size="sm"
                          className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white rounded-md"
                          onClick={(e) => e.preventDefault()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onRestart}
                variant="outline"
                size="lg"
                className="border-[#e5e7eb] hover:bg-[#87a96b]/10 bg-transparent"
              >
                Restart Plant Finder
              </Button>
              <Link href="/categories/indoor-plants">
                <Button size="lg" className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white w-full sm:w-auto">
                  View All Matching Plants
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
