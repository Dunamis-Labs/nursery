"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ProductImageGallery } from "@/components/product-image-gallery"
import { ProductInfo } from "@/components/product-info"
import { ProductTabs } from "@/components/product-tabs"
import { ProductFAQ } from "@/components/product-faq"
import { RelatedProducts } from "@/components/related-products"
import { useParams } from "next/navigation"

export default function ProductPage() {
  const params = useParams()
  const product = {
    id: params.id,
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 45.99,
    description:
      "Monstera Deliciosa is a tropical indoor plant native to Central America, known for its iconic split leaves and climbing growth habit. It thrives in bright, indirect light and moderate watering, making it relatively low-maintenance. This plant is ideal for beginners seeking a fast-growing statement plant with minimal care requirements. As it matures, the Monstera develops distinctive leaf perforations called fenestrations, which have made it one of the most recognizable houseplants worldwide. We often recommend this plant to customers who want visible growth and clear feedback when light or watering conditions need adjustment.",
    inStock: params.id !== "2", // Product ID 2 is out of stock for testing
    images: [
      "/monstera-deliciosa-full-plant-pot.jpg",
      "/monstera-closeup.png",
      "/monstera-deliciosa-plant-from-side.jpg",
      "/monstera-deliciosa-new-growth.jpg",
    ],
    sizes: ['Small (6" pot)', 'Medium (8" pot)', 'Large (10" pot)', 'Extra Large (12" pot)'],
    specifications: {
      "Light Requirements": "Bright, indirect light",
      Watering: "Water when top 2 inches of soil are dry",
      Humidity: "Prefers 60-80% humidity",
      Temperature: "65-85°F (18-29°C)",
      "Growth Rate": "Fast growing",
      Difficulty: "Easy to moderate",
      Toxicity: "Toxic to pets",
      Origin: "Central America",
    },
    careInstructions: `
      <h3>Light</h3>
      <p>Monstera Deliciosa thrives in bright, indirect light near an east- or north-facing window, or positioned several feet back from a south- or west-facing exposure. While it can tolerate lower light conditions, growth will slow significantly and the iconic leaf splits may not develop properly. Avoid placing in direct sunlight, which can scorch and yellow the leaves within days.</p>
      
      <h3>Water</h3>
      <p>Water your Monstera when the top 2-3 inches of soil feel dry to the touch, typically once per week during spring and summer, less frequently in fall and winter. Check soil moisture by inserting your finger knuckle-deep before watering. Ensure the pot has drainage holes to prevent root rot, and allow excess water to drain completely after each watering.</p>
      
      <h3>Humidity</h3>
      <p>Native to tropical rainforests, Monstera Deliciosa appreciates humidity levels of 60% or higher. Increase humidity by running a humidifier within 3-4 feet of the plant, misting leaves in the morning several times per week, or placing the pot on a pebble tray filled with water below the pot base. Brown, crispy leaf edges often indicate insufficient humidity.</p>
      
      <h3>Temperature</h3>
      <p>Keep your Monstera in environments between 65-85°F (18-29°C) for optimal growth. The plant is not cold-hardy and should be kept away from cold drafts, air conditioning vents, and temperatures below 60°F, which can cause leaf damage within hours and stunted growth over time.</p>
      
      <h3>Difficulty</h3>
      <p>Monstera Deliciosa is rated as easy to moderate difficulty, making it suitable for beginners. The plant is forgiving of occasional neglect and will communicate its needs through visible signs like drooping leaves when thirsty or yellowing leaves when overwatered.</p>
      
      <div style="margin-top: 24px; padding: 16px; background-color: #f5f5f4; border-left: 3px solid #87a96b; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; font-weight: 600; color: #2c2c2c;">Grower's Note</h4>
        <p style="margin: 0; color: #6b7280; line-height: 1.6;">If leaves stop splitting, the plant is usually asking for more light rather than more water. Moving it closer to a window often restarts fenestration development within a few weeks.</p>
      </div>
    `,
    idealFor: [
      "Beginners and first-time plant owners",
      "Bright indoor spaces with indirect light",
      "Homes looking for a bold statement plant",
      "Plant enthusiasts who enjoy watching rapid growth",
    ],
    notIdealFor: [
      "Very low-light rooms without windows",
      "Homes with pets that chew leaves (plant is toxic)",
      "Spaces with limited vertical room for climbing growth",
    ],
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-8 px-4">
        <div className="container mx-auto">
          {/* Product Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 mb-16">
            <ProductImageGallery images={product.images} name={product.name} />
            <ProductInfo product={product} />
          </div>

          {/* Product Details Tabs */}
          <ProductTabs
            description={product.description}
            specifications={product.specifications}
            careInstructions={product.careInstructions}
            idealFor={product.idealFor}
            notIdealFor={product.notIdealFor}
          />

          {/* FAQ Section */}
          <ProductFAQ />

          {/* Related Products */}
          <RelatedProducts currentProductId={product.id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
