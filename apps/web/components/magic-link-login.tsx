"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type Step = "email" | "name" | "success"

export function MagicLinkLogin() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if email exists
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!checkResponse.ok) {
        throw new Error("Failed to check email")
      }

      const { exists } = await checkResponse.json()

      if (exists) {
        // Existing user - send magic link directly
        await sendMagicLink()
      } else {
        // New user - collect name first
        setStep("name")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await sendMagicLink(firstName, lastName)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const sendMagicLink = async (nameFirst?: string, nameLast?: string) => {
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName: nameFirst,
        lastName: nameLast,
      }),
    })

    if (response.ok) {
      setStep("success")
    } else {
      const data = await response.json()
      throw new Error(data.error || "Failed to send magic link. Please try again.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-serif text-3xl text-[#2d5016]">Sign In</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          {step === "email" && "Enter your email to receive a secure sign-in link"}
          {step === "name" && "Please provide your name to create your account"}
          {step === "success" && "Check your email for the magic link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#2c2c2c]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="focus:ring-[#87a96b]"
              />
            </div>

            <Alert className="bg-[#87a96b]/10 border-[#87a96b]">
              <Mail className="h-4 w-4 text-[#2d5016]" />
              <AlertDescription className="text-[#2c2c2c]">
                We'll send you a magic link for secure, password-free authentication.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Continue
                </>
              )}
            </Button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-[#2c2c2c]">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  disabled={loading}
                  className="focus:ring-[#87a96b]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-[#2c2c2c]">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  disabled={loading}
                  className="focus:ring-[#87a96b]"
                />
              </div>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("email")
                  setError(null)
                }}
                disabled={loading}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !firstName || !lastName}
                className="flex-1 bg-[#2d5016] hover:bg-[#2d5016]/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "success" && (
          <Alert className="bg-[#87a96b]/10 border-[#87a96b]">
            <Mail className="h-4 w-4 text-[#2d5016]" />
            <AlertDescription className="text-[#2c2c2c]">
              We've sent you a magic link! Please check your email and click the link to sign in.
            </AlertDescription>
          </Alert>
        )}

        {step === "email" && (
          <>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e5e7eb]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">WHY MAGIC LINKS?</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium text-[#2c2c2c]">Secure and convenient:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>No passwords to remember or manage</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>More secure than traditional passwords</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Quick sign-in from any device</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

