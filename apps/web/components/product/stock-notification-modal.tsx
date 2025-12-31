"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Bell, Loader2 } from "lucide-react"
import { Product } from "@prisma/client"

interface StockNotificationModalProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3

const COUNTRY_CODES = [
  { value: "+61", label: "Australia (+61)" },
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+64", label: "New Zealand (+64)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+852", label: "Hong Kong (+852)" },
]

export function StockNotificationModal({ product, open, onOpenChange }: StockNotificationModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  
  // Step 1: Contact Information
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState("+61")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Step 2: Create Account
  const [email, setEmail] = useState("")
  
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (firstName && lastName && phoneNumber) {
      setStep(2)
    }
  }
  
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    try {
      // First, create the stock notification (this will save name and phone)
      // The notification route will handle creating the profile
      const response = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          firstName,
          lastName,
          phoneCountryCode,
          phoneNumber,
          email,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        
        // Check if it's a rate limit error
        if (error.error?.includes("security purposes") || error.error?.includes("rate limit")) {
          // Extract the wait time if available
          const waitMatch = error.error.match(/(\d+)\s+seconds?/i)
          const waitTime = waitMatch ? parseInt(waitMatch[1]) : 60
          
          alert(`Please wait ${waitTime} seconds before requesting another magic link. Your notification has been saved with your name and phone number.`)
          setStep(3) // Still show success since notification is saved
          return
        }
        
        // If it requires verification, that's okay - user will complete after clicking magic link
        if (error.requiresVerification) {
          setStep(3)
          return
        }
        
        throw new Error(error.error || "Failed to create notification")
      }

      const result = await response.json()
      
      // If notification was created successfully, send magic link
      if (result.success) {
        try {
          // Send magic link via Supabase Auth (only if notification was created)
          // Include productId in the redirect URL so callback can link the notification
          const magicLinkResponse = await fetch("/api/auth/magic-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email,
              firstName,
              lastName,
              redirectTo: `/auth/callback?next=/account&productId=${product.id}`,
            }),
          })

          if (!magicLinkResponse.ok) {
            const error = await magicLinkResponse.json()
            
            // Handle rate limit errors gracefully
            if (error.error?.includes("security purposes") || error.error?.includes("rate limit")) {
              const waitMatch = error.error.match(/(\d+)\s+seconds?/i)
              const waitTime = waitMatch ? parseInt(waitMatch[1]) : 60
              
              alert(`Your notification has been saved! However, please wait ${waitTime} seconds before requesting another magic link. Check your email - you may have already received one.`)
            } else {
              // For other errors, just log but don't fail - notification is already saved
              console.warn("Magic link error (notification already saved):", error.error)
            }
          }
        } catch (magicLinkError) {
          // Magic link errors are not critical - notification is already saved
          console.warn("Magic link error (notification already saved):", magicLinkError)
        }
        
        setStep(3)
      } else if (result.requiresVerification) {
        setStep(3)
      }
    } catch (error) {
      console.error("Error creating notification:", error)
      alert(error instanceof Error ? error.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    setStep(1)
    setFirstName("")
    setLastName("")
    setPhoneCountryCode("+61")
    setPhoneNumber("")
    setEmail("")
    setLoading(false)
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#2d5016]">
                Notify Me When In Stock
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex gap-2">
                  <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((code) => (
                        <SelectItem key={code.value} value={code.value}>
                          {code.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90">
                Continue
              </Button>
            </form>
          </>
        )}
        
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#2d5016]">
                Create Account
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create an account to stay up to date with new arrivals, receive personalized plant recommendations, and get exclusive care tips directly to your inbox.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back
              </Button>
            </form>
          </>
        )}
        
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#2d5016]">
                Success!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-[#87a96b]" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Notification Added
                </p>
                <p className="text-sm text-muted-foreground">
                  We'll notify you via text and email when <strong>{product.commonName || product.name}</strong> is back in stock.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your email for a magic link to complete your account setup.
                </p>
              </div>
              <Button
                onClick={handleClose}
                className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90"
              >
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

