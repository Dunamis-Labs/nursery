import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const metadata = {
  title: "Contact Us - The Plant Nursery",
  description: "Get in touch with The Plant Nursery for order questions, plant care advice, and delivery support.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">Contact Us</h1>

          <div className="space-y-12">
            {/* Intro */}
            <section>
              <div className="prose prose-lg max-w-none">
                <p className="text-foreground/80 leading-relaxed">
                  The Plant Nursery is available to help with questions about orders, plant selection, care advice, and
                  delivery. Whether you need guidance before making a purchase or support after receiving your plants,
                  the nursery provides practical and responsive assistance.
                </p>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Details */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Get in Touch</h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a
                        href="mailto:hello@theplantnursery.com.au"
                        className="text-foreground/70 hover:text-primary transition-colors"
                      >
                        hello@theplantnursery.com.au
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">For general inquiries and order questions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <a href="tel:+61299999999" className="text-foreground/70 hover:text-primary transition-colors">
                        (02) 9999 9999
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">Monday to Friday, 9am - 5pm AEST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-foreground/70">Australia-wide online nursery</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Shipping to all Australian states and territories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                      <p className="text-foreground/70">Within 1-2 business days</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We aim to provide helpful, practical responses to all inquiries
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Form */}
              <section>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Send a Message</h2>

                <form className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" type="text" placeholder="Your name" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" type="text" placeholder="What is your message about?" className="mt-2" />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us how we can help..." rows={6} className="mt-2" />
                  </div>

                  <Button type="submit" className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white">
                    Send Message
                  </Button>
                </form>

                <p className="text-sm text-muted-foreground mt-4">
                  Your message will be reviewed and responded to within 1-2 business days. For urgent order issues,
                  please include your order number.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
