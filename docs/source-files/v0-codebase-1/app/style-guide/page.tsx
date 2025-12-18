import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { AlertCircle, Package, Loader2 } from "lucide-react"

export const metadata = {
  title: "Component & State Guide - The Plant Nursery",
  description: "Authoritative reference for components, states, and behavior patterns across The Plant Nursery site.",
}

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Component & State Guide</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              This is the authoritative reference for UI components, user states, and behavior patterns across The Plant
              Nursery site. This guide functions as a contract for consistent experiences, not a mood board.
            </p>
          </div>

          {/* Quick Navigation */}
          <Card className="mb-12 bg-[#87a96b]/5 border-[#87a96b]/20">
            <CardHeader>
              <CardTitle className="text-lg">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <a href="#principles" className="text-[#2d5016] hover:underline">
                  1. UI Principles
                </a>
                <a href="#auth-states" className="text-[#2d5016] hover:underline">
                  2. Authentication States
                </a>
                <a href="#account-components" className="text-[#2d5016] hover:underline">
                  3. Account Components
                </a>
                <a href="#component-states" className="text-[#2d5016] hover:underline">
                  4. Component States
                </a>
                <a href="#messaging" className="text-[#2d5016] hover:underline">
                  5. System Messaging
                </a>
                <a href="#legal-support" className="text-[#2d5016] hover:underline">
                  6. Legal & Support
                </a>
                <a href="#loading-states" className="text-[#2d5016] hover:underline">
                  7. Loading & Errors
                </a>
                <a href="#reuse-rules" className="text-[#2d5016] hover:underline">
                  8. Reuse Rules
                </a>
              </div>
            </CardContent>
          </Card>

          {/* 1. Global UI Principles */}
          <section id="principles" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">1. Global UI Principles</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Calm, Neutral, Professional Tone</h3>
                  <p className="text-sm text-muted-foreground">
                    All UI text uses plain language. No promotional language in system surfaces. State facts clearly
                    without embellishment.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Familiar Patterns Over Novelty</h3>
                  <p className="text-sm text-muted-foreground">
                    Use standard ecommerce patterns. Users should recognize how to navigate and interact without
                    learning new systems.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Consistency Over Cleverness</h3>
                  <p className="text-sm text-muted-foreground">
                    The same action should look and behave the same way everywhere. Predictability builds trust.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">State Visibility Over Hidden Logic</h3>
                  <p className="text-sm text-muted-foreground">
                    Always show the user what state they are in. No surprise redirects or unexplained restrictions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 2. Authentication State Model */}
          <section id="auth-states" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">2. Authentication State Model</h2>
            <div className="space-y-6">
              {/* State Definitions */}
              <Card>
                <CardHeader>
                  <CardTitle>User States</CardTitle>
                  <CardDescription>
                    The site recognizes four distinct user states. All features must handle each state appropriately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-[#87a96b] pl-4">
                    <h3 className="font-semibold mb-1">State A: Signed Out</h3>
                    <p className="text-sm text-muted-foreground">
                      User has no account or is not currently signed in. Can browse, search, and use Plant Finder.
                      Cannot access account pages or checkout.
                    </p>
                  </div>
                  <div className="border-l-4 border-[#87a96b] pl-4">
                    <h3 className="font-semibold mb-1">State B: Signed In</h3>
                    <p className="text-sm text-muted-foreground">
                      User is authenticated. Full site access including account pages and checkout.
                    </p>
                  </div>
                  <div className="border-l-4 border-[#87a96b] pl-4">
                    <h3 className="font-semibold mb-1">State C: Signed In + Orders Exist</h3>
                    <p className="text-sm text-muted-foreground">
                      User has order history. Order pages show list view with past purchases.
                    </p>
                  </div>
                  <div className="border-l-4 border-[#87a96b] pl-4">
                    <h3 className="font-semibold mb-1">State D: Signed In + No Orders</h3>
                    <p className="text-sm text-muted-foreground">
                      User account exists but no orders yet. Order pages show empty state with clear next action.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Behavior */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Behavior by State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Signed Out (State A)</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Show "Sign In" link in header</li>
                        <li>Show "Register" link in header</li>
                        <li>Hide "My Account" link</li>
                        <li>Allow browsing all product and content pages</li>
                        <li>Clicking cart or checkout redirects to sign in</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Signed In (States B, C, D)</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Replace "Sign In / Register" with "My Account" icon</li>
                        <li>Show account dropdown with Orders, Details, Log Out</li>
                        <li>Full access to all account pages</li>
                        <li>Cart and checkout function normally</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Page Access Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Page Access Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Public Pages (All States)</h3>
                      <p className="text-sm text-muted-foreground mb-2">Accessible without authentication:</p>
                      <p className="text-sm font-mono">
                        /, /categories/*, /products/*, /guides, /blog/*, /plant-finder, /about, /plant-care, /shipping,
                        /returns, /contact, /terms, /privacy
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Protected Pages (Signed In Only)</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Require authentication, redirect to /account/sign-in if not signed in:
                      </p>
                      <p className="text-sm font-mono">
                        /account, /account/orders, /account/orders/[id], /account/details, /account/addresses, /checkout
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 3. Account-Related Components */}
          <section id="account-components" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">3. Account-Related Components</h2>
            <div className="space-y-6">
              {/* Sign In Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Sign In Form</CardTitle>
                  <CardDescription>Standard authentication form. Used on /account/sign-in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-w-md space-y-4 border p-4 rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="demo-email">Email</Label>
                      <Input id="demo-email" type="email" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="demo-password">Password</Label>
                      <Input id="demo-password" type="password" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <a href="#" className="text-[#2d5016] hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    <Button className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90">Sign In</Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{" "}
                      <a href="#" className="text-[#2d5016] hover:underline font-medium">
                        Create one
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Email and password fields with labels</li>
                      <li>"Forgot password?" link (routes to /account/reset-password)</li>
                      <li>Inline validation on submit</li>
                      <li>Link to register page at bottom</li>
                      <li>Neutral error messaging (no blame)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Register Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Register Form</CardTitle>
                  <CardDescription>Account creation form. Used on /account/register</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-w-md space-y-4 border p-4 rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input placeholder="Smith" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" />
                    </div>
                    <Button className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90">Create Account</Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Already have an account?{" "}
                      <a href="#" className="text-[#2d5016] hover:underline font-medium">
                        Sign in
                      </a>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Optional first/last name fields</li>
                      <li>Required email field</li>
                      <li>Password and confirm password with validation</li>
                      <li>Clear success confirmation after submission</li>
                      <li>Link to sign in page at bottom</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* My Account Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle>My Account Dashboard</CardTitle>
                  <CardDescription>Account overview and navigation hub. Used on /account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Components:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Three icon cards: Orders, Account Details, Addresses</li>
                      <li>Account overview section showing name and email</li>
                      <li>Recent orders list (shows last 3 orders)</li>
                      <li>Log out button at bottom</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Order History States */}
              <Card>
                <CardHeader>
                  <CardTitle>Order History List</CardTitle>
                  <CardDescription>Three distinct states based on user order history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Empty State (State D: No Orders)</h4>
                    <div className="border p-6 rounded-lg bg-muted/30 text-center space-y-3">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="font-semibold">No orders yet</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't placed any orders. Browse our plants to get started.
                      </p>
                      <Button size="sm" className="bg-[#2d5016] hover:bg-[#2d5016]/90">
                        Browse Plants
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Must explain what's missing, offer clear next step, avoid blame.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">List State (State C: Has Orders)</h4>
                    <p className="text-sm text-muted-foreground">
                      Display orders as cards showing order ID, date, status, and total. Each card links to order detail
                      page.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Loading State</h4>
                    <div className="border p-6 rounded-lg bg-muted/30 text-center">
                      <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
                      <p className="text-sm text-muted-foreground mt-3">Loading your orders...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 4. Component States */}
          <section id="component-states" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">4. Component States (Mandatory)</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>State Requirements</CardTitle>
                <CardDescription>Every interactive component must define these states</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Default:</span>
                    <span className="text-muted-foreground">Component at rest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Hover:</span>
                    <span className="text-muted-foreground">Mouse over the component</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Focus:</span>
                    <span className="text-muted-foreground">Keyboard navigation highlight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Disabled:</span>
                    <span className="text-muted-foreground">Cannot be interacted with</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Loading:</span>
                    <span className="text-muted-foreground">Async operation in progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Empty:</span>
                    <span className="text-muted-foreground">No data to display</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold w-24 flex-shrink-0">Error:</span>
                    <span className="text-muted-foreground">Something went wrong</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Button States */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">States</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button disabled>Disabled</Button>
                    <Button>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Input States */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Form Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default State</Label>
                  <Input placeholder="Enter text" />
                </div>
                <div className="space-y-2">
                  <Label>Disabled State</Label>
                  <Input placeholder="Cannot edit" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Error State</Label>
                  <Input placeholder="Invalid input" className="border-red-500" />
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    This field is required
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Used for status indicators, availability, and categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Out of Stock</Badge>
                  <Badge className="bg-green-600 hover:bg-green-600">In Stock</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>Standard container for grouped content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Card Title</CardTitle>
                    <CardDescription>Supporting description text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Card content goes here. Use cards to group related information and actions.
                    </p>
                  </CardContent>
                </Card>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Usage:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Product information</li>
                    <li>Form containers</li>
                    <li>Content sections</li>
                    <li>Navigation groups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 5. System Messaging */}
          <section id="messaging" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">5. System Messaging & Copy Rules</h2>
            <Card>
              <CardHeader>
                <CardTitle>Writing Rules</CardTitle>
                <CardDescription>All system messages follow these principles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Rules:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use plain language</li>
                    <li>Write short sentences</li>
                    <li>No emojis</li>
                    <li>No exclamation points</li>
                    <li>Be reassuring but factual</li>
                    <li>Never blame the user</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Examples:</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-[#87a96b] pl-4">
                      <p className="text-sm font-medium">✓ Good: "You're not signed in."</p>
                      <p className="text-xs text-muted-foreground">Clear, neutral, states the fact</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className="text-sm font-medium">✗ Bad: "Oops! Looks like you forgot to sign in!"</p>
                      <p className="text-xs text-muted-foreground">
                        Overly casual, uses exclamation, implies user error
                      </p>
                    </div>
                    <div className="border-l-4 border-[#87a96b] pl-4">
                      <p className="text-sm font-medium">✓ Good: "You don't have any orders yet."</p>
                      <p className="text-xs text-muted-foreground">Simple statement of state</p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <p className="text-sm font-medium">✗ Bad: "Your order history is empty."</p>
                      <p className="text-xs text-muted-foreground">Too technical, implies something missing</p>
                    </div>
                    <div className="border-l-4 border-[#87a96b] pl-4">
                      <p className="text-sm font-medium">✓ Good: "This action requires an account."</p>
                      <p className="text-xs text-muted-foreground">Explains requirement clearly</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 6. Legal & Support Components */}
          <section id="legal-support" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">6. Legal & Support Components</h2>
            <Card>
              <CardHeader>
                <CardTitle>Content Pages</CardTitle>
                <CardDescription>Terms, Privacy, Shipping, Returns, Contact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Design Principles:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Use body typography (Inter font)</li>
                    <li>Avoid card-heavy layouts</li>
                    <li>Prioritize readability with proper line height</li>
                    <li>Use headings to structure long content</li>
                    <li>Keep paragraphs short (3-4 sentences max)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Required Pages:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-mono">/terms</span> - Terms of Use
                    </p>
                    <p>
                      <span className="font-mono">/privacy</span> - Privacy Policy
                    </p>
                    <p>
                      <span className="font-mono">/shipping</span> - Shipping Information
                    </p>
                    <p>
                      <span className="font-mono">/returns</span> - Returns & Refunds
                    </p>
                    <p>
                      <span className="font-mono">/contact</span> - Contact Form
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 7. Loading, Error, Empty States */}
          <section id="loading-states" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">7. Loading, Error, and Empty States</h2>
            <div className="space-y-6">
              {/* Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Page Loading</h4>
                    <div className="border p-8 rounded-lg bg-muted/30 text-center">
                      <Loader2 className="h-10 w-10 text-[#2d5016] mx-auto animate-spin" />
                      <p className="text-sm text-muted-foreground mt-4">Loading...</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Button Loading</h4>
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Principles:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Show loading indicator immediately</li>
                      <li>Disable interactive elements during loading</li>
                      <li>Use spinner icon for visual feedback</li>
                      <li>Keep loading text brief and calm</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Error States */}
              <Card>
                <CardHeader>
                  <CardTitle>Error States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900 mb-1">Something went wrong</h4>
                        <p className="text-sm text-red-700">We couldn't process your request. Please try again.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Error Message Rules:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Be calm and reassuring</li>
                      <li>Avoid technical jargon</li>
                      <li>Never blame the user</li>
                      <li>Provide clear next step when possible</li>
                      <li>Use neutral language ("couldn't" not "failed")</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Empty States */}
              <Card>
                <CardHeader>
                  <CardTitle>Empty States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border p-8 rounded-lg bg-muted/30 text-center space-y-3">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h4 className="font-semibold">No items yet</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You haven't added anything here. Browse our collection to get started.
                    </p>
                    <Button size="sm" className="bg-[#2d5016] hover:bg-[#2d5016]/90">
                      Browse Plants
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Empty State Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Icon representing the empty collection</li>
                      <li>Clear heading stating what's missing</li>
                      <li>Brief explanation of why it's empty</li>
                      <li>Actionable button with clear next step</li>
                      <li>No promotional language or blame</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 8. Reuse Rules */}
          <section id="reuse-rules" className="mb-16 scroll-mt-20">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">8. Reuse Rules (Important)</h2>
            <Card className="border-[#2d5016]">
              <CardHeader>
                <CardTitle>Extension, Not Invention</CardTitle>
                <CardDescription>These rules maintain consistency across the site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#87a96b]/10 border-l-4 border-[#2d5016] p-4 rounded">
                  <h4 className="font-semibold mb-2">Do NOT Create:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>New authentication patterns</li>
                    <li>New button styles or variants</li>
                    <li>Alternate form layouts</li>
                    <li>Different card styles for similar content</li>
                    <li>Custom loading indicators</li>
                    <li>Non-standard empty states</li>
                  </ul>
                </div>
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <h4 className="font-semibold mb-2">Always:</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Use existing components from this guide</li>
                    <li>Follow established state patterns</li>
                    <li>Match existing messaging tone</li>
                    <li>Extend components through props, not duplication</li>
                    <li>Reference this guide before building new features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Typography Reference */}
          <section className="mb-16">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">Typography Reference</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Playfair Display - Headings</p>
                  <h1 className="font-serif text-5xl font-bold mb-2">Page Title (5xl)</h1>
                  <h2 className="font-serif text-4xl font-bold mb-2">Section Title (4xl)</h2>
                  <h3 className="font-serif text-3xl font-bold mb-2">Subsection (3xl)</h3>
                  <h4 className="font-serif text-2xl font-bold">Component Title (2xl)</h4>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Inter - Body Text</p>
                  <p className="text-lg mb-2">Large body text (18px) - For emphasis</p>
                  <p className="text-base mb-2">Default body text (16px) - Standard paragraphs</p>
                  <p className="text-sm mb-2">Small text (14px) - Supporting info, captions</p>
                  <p className="text-xs">Extra small (12px) - Legal, footnotes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">JetBrains Mono - Botanical Names</p>
                  <p className="font-mono italic text-lg">Monstera deliciosa</p>
                  <p className="font-mono italic text-base">Sansevieria trifasciata</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Color Reference */}
          <section className="mb-16">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[#2d5016]">Color System</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="h-24 rounded-lg bg-[#2d5016] mb-2"></div>
                <p className="font-semibold">Forest Green</p>
                <p className="text-sm font-mono text-muted-foreground">#2d5016</p>
                <p className="text-xs text-muted-foreground">Primary actions, headings</p>
              </div>
              <div>
                <div className="h-24 rounded-lg bg-[#87a96b] mb-2"></div>
                <p className="font-semibold">Sage Green</p>
                <p className="text-sm font-mono text-muted-foreground">#87a96b</p>
                <p className="text-xs text-muted-foreground">Secondary elements, hover</p>
              </div>
              <div>
                <div className="h-24 rounded-lg bg-[#8b6f47] mb-2"></div>
                <p className="font-semibold">Warm Earth</p>
                <p className="text-sm font-mono text-muted-foreground">#8b6f47</p>
                <p className="text-xs text-muted-foreground">Accent, highlights</p>
              </div>
              <div>
                <div className="h-24 rounded-lg bg-[#faf9f6] border mb-2"></div>
                <p className="font-semibold">Cream White</p>
                <p className="text-sm font-mono text-muted-foreground">#faf9f6</p>
                <p className="text-xs text-muted-foreground">Background</p>
              </div>
              <div>
                <div className="h-24 rounded-lg bg-[#2c2c2c] mb-2"></div>
                <p className="font-semibold">Charcoal</p>
                <p className="text-sm font-mono text-muted-foreground">#2c2c2c</p>
                <p className="text-xs text-muted-foreground">Body text</p>
              </div>
            </div>
          </section>

          {/* Success Criteria */}
          <Card className="bg-[#87a96b]/10 border-[#87a96b]">
            <CardHeader>
              <CardTitle>Success Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">A designer, engineer, or AI agent should be able to:</p>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Build any new page without inventing UI patterns</li>
                <li>Understand how components behave in every user state</li>
                <li>Write system messages that match the established tone</li>
                <li>Know which components to reuse vs extend</li>
                <li>Infer: "This site has a consistent, state-aware UI system"</li>
              </ul>
              <p className="text-sm font-semibold mt-6 text-[#2d5016]">
                This guide is authoritative. Consistency over creativity.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
