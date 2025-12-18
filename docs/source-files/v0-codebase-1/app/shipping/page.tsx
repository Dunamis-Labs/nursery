import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Package, MapPin, Clock, DollarSign, Home } from "lucide-react"

export const metadata = {
  title: "Shipping Information - The Plant Nursery",
  description: "Learn how plants and trees are shipped safely across Australia with detailed delivery information.",
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Shipping Information</h1>

          <div className="space-y-12">
            {/* Overview */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Overview</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed">
                  Shipping live plants and trees requires careful handling to ensure they arrive healthy and ready to
                  establish in their new environment. The Plant Nursery uses specialized packaging designed to protect
                  plants during transit while allowing adequate air circulation. Plants are secured to prevent shifting,
                  and root systems are kept moist but not waterlogged. Delivery timing varies based on location and the
                  type of plant being shipped, with priority given to minimizing time in transit for more delicate
                  specimens.
                </p>
              </div>
            </section>

            {/* Shipping Locations */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Shipping Locations</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed">
                  The Plant Nursery ships plants and trees throughout Australia. Most regions are serviced via standard
                  courier networks, though some remote or northern tropical areas may have restrictions during extreme
                  weather periods. If your location has specific delivery limitations, this will be indicated during
                  checkout. Trees and larger plants may have additional regional considerations due to size and weight.
                </p>
              </div>
            </section>

            {/* Shipping Times */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Shipping Times</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Most orders are dispatched within 2-3 business days of being placed. Once dispatched, delivery
                  typically takes 3-7 business days depending on your location. Metropolitan areas generally receive
                  deliveries faster than regional locations.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Trees and large shrubs may require additional handling time and are typically dispatched within 5-7
                  business days. These items often travel on separate freight services to ensure they arrive undamaged.
                  Customers are notified when larger plants are dispatched and can expect delivery within 5-10 business
                  days from that point.
                </p>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Shipping Costs</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Shipping costs are calculated based on order weight, size, and destination. The exact cost is
                  displayed during checkout before payment is required. Small to medium plants typically incur standard
                  parcel rates, while trees and large plants may require freight services with higher associated costs.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Orders over $150 qualify for free standard shipping to most metropolitan areas. This threshold does
                  not apply to oversized items such as mature trees or bulk soil orders, which are quoted separately.
                </p>
              </div>
            </section>

            {/* Receiving Your Plants */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Receiving Your Plants</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  When your plants arrive, unpack them as soon as possible and place them in a location appropriate for
                  their light requirements. Some leaf drooping or minor stress after shipping is normal and typically
                  resolves within a few days as the plant adjusts.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Water the plant lightly if the soil feels dry, but avoid overwatering immediately after arrival.
                  Plants that have been in transit benefit from a brief acclimatization period before being placed in
                  their permanent location or exposed to full sun.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  If a plant arrives damaged or appears unhealthy beyond normal transit stress, contact the nursery
                  within 48 hours with photos. Most issues can be resolved quickly, and the nursery stands behind the
                  quality of what is shipped.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
