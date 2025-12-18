import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Shield, Clock, TreeDeciduous, Package, Mail } from "lucide-react"

export const metadata = {
  title: "Returns & Plant Guarantee - The Plant Nursery",
  description: "Understand our plant guarantee, return policies, and support for living plants and trees.",
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Returns & Plant Guarantee</h1>

          <div className="space-y-12">
            {/* Overview */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Overview</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed">
                  Plants and trees are living products that require appropriate care after purchase. The Plant Nursery
                  recognizes that establishing a new plant takes time and that some issues may arise despite best
                  efforts. Return and guarantee policies are designed to be fair to both the customer and the nursery,
                  accounting for the realities of growing live plants rather than selling manufactured goods.
                </p>
              </div>
            </section>

            {/* Plant Guarantee */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Plant Guarantee</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  All plants sold by The Plant Nursery are guaranteed to arrive alive and in good condition. If a plant
                  arrives damaged, diseased, or dead, the nursery will replace it or issue a refund within 30 days of
                  delivery. This guarantee assumes the customer has followed basic care instructions appropriate for the
                  plant type.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The guarantee covers issues present at the time of sale or arising from transit, but does not extend
                  to problems caused by improper care after delivery. This includes overwatering, underwatering,
                  incorrect light exposure, pest infestations introduced in the customer's environment, or physical
                  damage after receipt.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Customers are encouraged to contact the nursery if they are uncertain whether an issue falls under the
                  guarantee. In most cases, photos and a brief description of care provided are sufficient to assess the
                  situation.
                </p>
              </div>
            </section>

            {/* Trees & Long-Term Plants */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <TreeDeciduous className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Trees & Long-Term Plants</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Trees and large shrubs have an extended establishment period that can last several months. During this
                  time, some leaf drop, slow growth, or temporary stress is normal as the plant adapts to its new
                  location. The guarantee for trees covers the first 90 days after delivery, provided the tree has been
                  planted correctly and watered appropriately.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Trees that fail to establish within this period will be assessed on a case-by-case basis. Factors such
                  as planting depth, soil conditions, watering frequency, and seasonal timing all affect establishment
                  success. The nursery may request photos of the planting site and details about care provided.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Customers who are unsure about tree establishment or have concerns during the first few months are
                  encouraged to contact the nursery for guidance. Early intervention can often prevent issues from
                  becoming severe.
                </p>
              </div>
            </section>

            {/* Non-Living Items */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">Non-Living Items</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed">
                  Pots, planters, tools, and other non-living items can be returned within 30 days of delivery if they
                  are unused and in their original condition. Customers are responsible for return shipping costs unless
                  the item arrived damaged or was incorrect. Refunds are processed within 7 business days of the nursery
                  receiving the returned item.
                </p>
              </div>
            </section>

            {/* How to Request a Return */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-foreground">How to Request a Return</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed mb-4">
                  To request a return or report an issue with a plant, contact the nursery by email at
                  returns@theplantnursery.com.au or through the contact form on this website. Include your order number,
                  photos of the plant or item, and a brief description of the issue or reason for return.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The nursery typically responds to return requests within 1-2 business days. If a return is approved,
                  instructions will be provided for sending the item back or disposing of a plant that cannot be
                  returned due to quarantine regulations.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Refunds are issued to the original payment method within 7 business days of approval. Replacements are
                  dispatched within 3-5 business days and follow the same shipping timeframes as new orders.
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
