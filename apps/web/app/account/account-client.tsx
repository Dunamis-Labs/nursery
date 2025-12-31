"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, Edit2, X, Check, Mail, LogOut } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { MagicLinkLogin } from "@/components/magic-link-login"

const COUNTRY_CODES = [
  { value: "+61", label: "Australia (+61)" },
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+64", label: "New Zealand (+64)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+852", label: "Hong Kong (+852)" },
]

type EditableField = "firstName" | "lastName" | "email" | "phone" | null

interface User {
  id: string
  email: string
  emailVerified: boolean
  firstName: string | null
  lastName: string | null
  phone: string | null
  phoneCountryCode: string | null
}

export function AccountPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<EditableField>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [emailChangeAlert, setEmailChangeAlert] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState("+61")
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    fetchAccount()
  }, [])

  // Refetch account when verified=true is in the URL (after magic link verification)
  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      setSuccessMessage("Email verified! Welcome to your account.")
      
      // First check if we have a session on the client side
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Session check after verification:", !!session, session?.user?.email)
        
        if (session) {
          // Session exists, fetch account
          await fetchAccount()
        } else {
          // No session yet, wait a bit longer and try again
          console.log("No session found, waiting...")
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession()
            console.log("Retry session check:", !!retrySession)
            if (retrySession) {
              await fetchAccount()
            } else {
              console.error("Still no session after retry")
              setSuccessMessage(null)
            }
          }, 2000)
        }
      }
      
      // Small delay to ensure session is established in cookies
      const timer = setTimeout(() => {
        checkSession()
        // Remove the verified param from URL to clean it up
        router.replace("/account", { scroll: false })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router, supabase])

  const fetchAccount = async () => {
    try {
      console.log("Fetching account...")
      const response = await fetch("/api/account", {
        credentials: 'include', // Ensure cookies are sent
      })
      console.log("Account API response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Account data received:", { id: data.id, email: data.email })
        setUser(data)
        setFirstName(data.firstName || "")
        setLastName(data.lastName || "")
        setEmail(data.email || "")
        setPhoneCountryCode(data.phoneCountryCode || "+61")
        setPhoneNumber(data.phone ? data.phone.replace(data.phoneCountryCode || "", "") : "")
      } else if (response.status === 401) {
        console.error("Unauthorized - no session found")
        // Not logged in - user will remain null, showing the login form
        setUser(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Account fetch failed:", response.status, errorData)
        setUser(null)
      }
    } catch (error) {
      console.error("Error fetching account:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field: EditableField) => {
    setEditingField(field)
    setSuccessMessage(null)
    setEmailChangeAlert(null)
  }

  const handleCancel = () => {
    setEditingField(null)
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setEmail(user.email || "")
      setPhoneCountryCode(user.phoneCountryCode || "+61")
      setPhoneNumber(user.phone ? user.phone.replace(user.phoneCountryCode || "", "") : "")
    }
  }

  const handleSave = async (field: EditableField) => {
    if (!user) return

    setSaving(true)
    setSuccessMessage(null)
    setEmailChangeAlert(null)

    try {
      const updateData: Record<string, string> = {}
      
      if (field === "firstName") updateData.firstName = firstName
      if (field === "lastName") updateData.lastName = lastName
      if (field === "email") updateData.email = email
      if (field === "phone") {
        updateData.phoneCountryCode = phoneCountryCode
        updateData.phoneNumber = phoneNumber
      }

      const response = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setEditingField(null)
        setSuccessMessage("Changes saved successfully!")

        // Show email change alert if email was changed
        if (field === "email" && data.emailChangePending) {
          setEmailChangeAlert(data.email)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save changes")
      }
    } catch (error) {
      console.error("Error saving changes:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSendMagicLink = async () => {
    if (!user) return

    setSaving(true)
    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        setSuccessMessage("Magic link sent! Check your email.")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to send magic link")
      }
    } catch (error) {
      console.error("Error sending magic link:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2d5016]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 py-16 px-4">
          <div className="container mx-auto max-w-md">
            <MagicLinkLogin />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
        <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-8">My Account</h1>

        {successMessage && (
          <Alert className="mb-6 bg-[#87a96b]/10 border-[#87a96b]">
            <CheckCircle className="h-4 w-4 text-[#87a96b]" />
            <AlertDescription className="text-[#2d5016]">{successMessage}</AlertDescription>
          </Alert>
        )}

        {emailChangeAlert && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              A magic link has been sent to <strong>{emailChangeAlert}</strong> to verify your email address.
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-[#2d5016]">Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>First Name</Label>
                  {editingField !== "firstName" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit("firstName")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === "firstName" ? (
                  <div className="space-y-2">
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave("firstName")}
                        disabled={saving}
                        className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {user.firstName || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Last Name</Label>
                  {editingField !== "lastName" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit("lastName")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === "lastName" ? (
                  <div className="space-y-2">
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave("lastName")}
                        disabled={saving}
                        className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {user.lastName || "Not set"}
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email</Label>
                {editingField !== "email" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("email")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingField === "email" ? (
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave("email")}
                      disabled={saving}
                      className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  {user.email} {user.emailVerified && <span className="text-[#87a96b]">(Verified)</span>}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phone Number</Label>
                {editingField !== "phone" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("phone")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingField === "phone" ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode} disabled={saving}>
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
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                      className="flex-1"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave("phone")}
                      disabled={saving}
                      className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  {user.phone || "Not set"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-[#2d5016]">Account Security</CardTitle>
            <CardDescription>
              We use magic link authentication for secure, password-free access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSendMagicLink}
              disabled={saving}
              className="bg-[#2d5016] hover:bg-[#2d5016]/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send New Magic Link"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-[#2d5016] hover:bg-[#87a96b]/10 active:bg-[#87a96b]/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

