"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Check } from "lucide-react"

interface StockNotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
}

type FormStep = "contact" | "email" | "success"

export function StockNotificationModal({ open, onOpenChange, productName }: StockNotificationModalProps) {
  const [step, setStep] = useState<FormStep>("contact")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [countryCode, setCountryCode] = useState("+61")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call to save notification request
    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSubmitting(false)
    setStep("email")
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call to send magic link
    await new Promise((resolve) => setTimeout(resolve, 800))

    setIsSubmitting(false)
    setStep("success")
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after modal closes
    setTimeout(() => {
      setStep("contact")
      setFirstName("")
      setLastName("")
      setCountryCode("+61")
      setPhone("")
      setEmail("")
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "contact" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#2d5016]">Notify Me When In Stock</DialogTitle>
              <DialogDescription>
                We'll send you a notification as soon as <span className="font-semibold">{productName}</span> is back in
                stock.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                  className="focus:ring-[#87a96b]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                  className="focus:ring-[#87a96b]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+64">🇳🇿 +64</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="4XX XXX XXX"
                    className="focus:ring-[#87a96b] flex-1"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue"}
              </Button>
            </form>
          </>
        )}

        {step === "email" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#2d5016]">Create Your Account</DialogTitle>
              <DialogDescription>
                Create an account to stay up to date with new arrivals, receive personalized plant recommendations, and
                get exclusive care tips delivered to your inbox.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEmailSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="focus:ring-[#87a96b]"
                />
              </div>

              <div className="text-xs text-muted-foreground bg-[#f5f5f4] p-3 rounded-md border border-border">
                We'll send you a magic link to sign in. No password needed.
              </div>

              <Button type="submit" className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90" disabled={isSubmitting}>
                {isSubmitting ? "Sending Magic Link..." : "Send Magic Link"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setStep("contact")}
              >
                Back
              </Button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#87a96b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#87a96b]" />
            </div>

            <DialogHeader className="text-center">
              <DialogTitle className="font-serif text-2xl text-[#2d5016] mb-2">You're All Set!</DialogTitle>
              <DialogDescription className="text-base">
                Check your email at <span className="font-semibold">{email}</span> for a magic link to complete your
                account setup.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              <div className="text-sm text-muted-foreground bg-[#f5f5f4] p-4 rounded-md border border-border">
                <Bell className="w-5 h-5 text-[#87a96b] mx-auto mb-2" />
                <p className="font-medium text-foreground mb-1">We'll notify you when {productName} is back</p>
                <p className="text-xs">You'll receive a text message and email as soon as it's available.</p>
              </div>

              <Button onClick={handleClose} className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
