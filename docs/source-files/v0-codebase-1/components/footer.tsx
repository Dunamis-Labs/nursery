import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#2d5016] text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-footer.png" alt="The Plant Nursery" width={32} height={64} className="h-16 w-auto" />
              <span className="font-serif text-2xl font-bold">The Plant Nursery</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Your trusted source for premium plants and expert gardening advice since 2020.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-3">
              Plant recommendations are based on real-world growing experience and how plants perform in homes, not
              ideal greenhouse conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="/categories/indoor-plants" className="hover:text-white transition-colors">
                  Indoor Plants
                </a>
              </li>
              <li>
                <a href="/categories/outdoor-plants" className="hover:text-white transition-colors">
                  Outdoor Plants
                </a>
              </li>
              <li>
                <a href="/categories/pots-planters" className="hover:text-white transition-colors">
                  Pots & Planters
                </a>
              </li>
              <li>
                <a href="/categories/herbs-vegetables" className="hover:text-white transition-colors">
                  Herbs & Vegetables
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Orders</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="/account/orders" className="hover:text-white transition-colors">
                  Orders
                </a>
              </li>
              <li>
                <a href="/shipping" className="hover:text-white transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="/returns" className="hover:text-white transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="/account" className="hover:text-white transition-colors">
                  My Account
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="/plant-care" className="hover:text-white transition-colors">
                  Plant Care Guide
                </a>
              </li>
              <li>
                <a href="/guides" className="hover:text-white transition-colors">
                  Care Guides
                </a>
              </li>
              <li>
                <a href="/plant-finder" className="hover:text-white transition-colors">
                  Plant Finder
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
          <p>
            © 2025 The Plant Nursery (theplantnursery.com.au). All rights reserved. Cultivating beauty, one plant at a
            time.
          </p>
        </div>
      </div>
    </footer>
  )
}
