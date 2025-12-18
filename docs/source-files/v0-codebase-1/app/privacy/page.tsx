import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy - The Plant Nursery",
  description:
    "Learn how we collect, use, and protect your personal information in accordance with Australian privacy laws.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">1. Information We Collect</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                The Plant Nursery collects information that you provide directly when you create an account, place an
                order, or contact us. This includes your name, email address, phone number, delivery address, and
                payment information.
              </p>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We also collect information automatically when you use our website. This includes your IP address,
                browser type, pages you visit, and how you interact with the site. This information helps us understand
                how people use the site and improve the experience.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                If you subscribe to our newsletter or contact us with questions, we collect the information you provide
                in those communications.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">2. How We Use Your Information</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We use your information to process and fulfill your orders. This includes sending confirmation emails,
                arranging delivery, and providing customer support. We use your contact information to communicate about
                your orders and respond to your questions.
              </p>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We analyze site usage data to understand which plants and products are popular, which guides are
                helpful, and how we can improve the site. This analysis uses aggregated data and does not identify
                individual users.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                If you opt in to marketing communications, we may send you information about new plants, seasonal
                offerings, and care tips. You can unsubscribe from these emails at any time.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">
                3. How We Store and Protect Your Information
              </h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                Your information is stored securely on servers located in Australia. We use industry-standard security
                measures including encryption and secure connections to protect your data. Payment information is
                processed through secure payment partners and is not stored on our servers.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                We retain your information for as long as your account is active or as needed to provide services. If
                you close your account, we will delete or anonymize your personal information, except where we need to
                retain it for legal or business purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">4. Sharing Your Information</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We do not sell your personal information. We share information only when necessary to fulfill orders and
                operate the business. This includes sharing delivery details with shipping partners and processing
                payments through secure payment providers.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                We may share aggregated, non-identifiable data for business analysis. We may also disclose information
                if required by law or to protect our rights and safety.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">5. Your Rights and Choices</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                Under Australian privacy law, you have the right to access the personal information we hold about you.
                You can request a copy of your data or ask us to correct inaccurate information. You can also request
                that we delete your information, subject to legal requirements.
              </p>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                You can update your account information at any time by logging into your account. You can opt out of
                marketing emails by clicking the unsubscribe link in any email we send.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                To exercise these rights or if you have privacy questions, contact us using the details provided on our
                contact page.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">6. Cookies and Tracking</h2>
              <p className="leading-relaxed text-[#2c2c2c] mb-4">
                We use cookies and similar technologies to remember your preferences, keep you logged in, and analyze
                site usage. Essential cookies are necessary for the site to function. Analytics cookies help us
                understand how people use the site.
              </p>
              <p className="leading-relaxed text-[#2c2c2c]">
                You can control cookies through your browser settings. Disabling cookies may affect some site
                functionality.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">7. Children's Privacy</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                The Plant Nursery is not directed to children under 18. We do not knowingly collect information from
                children. If we learn that we have collected information from a child, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">8. Changes to This Policy</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                We may update this privacy policy from time to time. Changes will be posted on this page with the
                revision date. Continued use of the site after changes indicates your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">9. Contact Us</h2>
              <p className="leading-relaxed text-[#2c2c2c]">
                If you have questions about this privacy policy or how we handle your information, please contact us
                through our contact page or email us directly.
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
