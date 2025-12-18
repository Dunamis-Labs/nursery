import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Use - The Plant Nursery",
  description: "Read our terms of use including purchase conditions, delivery policies, and legal information.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-8">Terms of Use</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">1. Use of the Site</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                The Plant Nursery website provides information about plants, gardening products, and related services.
                By accessing and using this site, you agree to comply with these terms. The site is intended for
                personal, non-commercial use. You may browse products, read guides, and place orders for your own use.
                You must provide accurate information when creating an account or placing orders.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">2. Purchases and Orders</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                When you place an order through The Plant Nursery, you are making an offer to purchase products at the
                listed prices. We reserve the right to accept or decline your order. Once your order is confirmed, you
                will receive an email with order details and expected delivery information.
              </p>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                All prices are listed in Australian Dollars and include GST where applicable. Prices may change without
                notice, but orders already placed will honor the price shown at the time of purchase. Payment is
                processed securely through our payment partners.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                Live plants are subject to availability and seasonal conditions. If a plant becomes unavailable after
                you order, we will contact you to offer a suitable alternative or provide a refund.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">3. Delivery and Returns</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We deliver plants and products across Australia. Delivery times vary based on your location and product
                availability. You will receive tracking information once your order ships. We take care to package
                plants properly, but damage may occasionally occur during transit.
              </p>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                If your plant arrives damaged or unhealthy, contact us within 48 hours with photos. We will arrange a
                replacement or refund. For non-plant products, you may return unused items in original packaging within
                30 days of delivery.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                Due to the nature of live plants, we cannot accept returns for plants that decline after delivery due to
                care conditions beyond our control. Our care guides provide clear instructions to help you keep your
                plants healthy.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">4. Limitation of Liability</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                The Plant Nursery provides plants and gardening information to the best of our ability. However, we
                cannot guarantee that every plant will thrive in every environment. Plant health depends on many factors
                including light, water, temperature, and care practices.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                We are not liable for indirect or consequential losses resulting from plant purchases. Our liability is
                limited to the purchase price of the product. The care guides and growing information on our site are
                based on our experience but should be adapted to your specific conditions.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">5. Intellectual Property</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                All content on The Plant Nursery website, including text, images, guides, and design elements, is owned
                by The Plant Nursery or licensed for our use. You may not copy, reproduce, or distribute this content
                without permission. You may share links to our pages and reference our guides with proper attribution.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">6. Governing Law</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                These terms are governed by the laws of Australia. Any disputes will be resolved under Australian law.
                If any part of these terms is found to be unenforceable, the remaining terms will continue to apply.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">7. Changes to Terms</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                We may update these terms from time to time. Changes will be posted on this page with the revision date.
                Continued use of the site after changes indicates your acceptance of the updated terms.
              </p>
            </section>

            <div className="pt-8 border-t border-[#e5e7eb] mt-12">
              <p className="text-sm text-muted-foreground">Last updated: December 2024</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
