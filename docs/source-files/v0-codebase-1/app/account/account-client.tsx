"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Package, User, MapPin, LogOut, Edit2, Save, X, Mail } from "lucide-react"

export function AccountPageClient() {
  // State management for inline editing
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [firstName, setFirstName] = useState("John")
  const [lastName, setLastName] = useState("Smith")
  const [email, setEmail] = useState("john.smith@example.com")
  const [phonePrefix, setPhonePrefix] = useState("+61")
  const [phoneNumber, setPhoneNumber] = useState("412345678")
  const [isSaving, setIsSaving] = useState(false)
  const [showMagicLinkSent, setShowMagicLinkSent] = useState(false)

  const handleSaveName = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setIsEditingName(false)
  }

  const handleSaveEmail = async () => {
    setIsSaving(true)
    // Simulate API call to send magic link
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setIsEditingEmail(false)
    setShowMagicLinkSent(true)
    // Hide notification after 5 seconds
    setTimeout(() => setShowMagicLinkSent(false), 5000)
  }

  const handleSavePhone = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setIsEditingPhone(false)
  }

  const handleCancelName = () => {
    setFirstName("John")
    setLastName("Smith")
    setIsEditingName(false)
  }

  const handleCancelEmail = () => {
    setEmail("john.smith@example.com")
    setIsEditingEmail(false)
  }

  const handleCancelPhone = () => {
    setPhonePrefix("+61")
    setPhoneNumber("412345678")
    setIsEditingPhone(false)
  }

  const recentOrders = [
    { id: "ORD-2024-001", date: "2024-12-10", status: "Delivered", total: "$127.50" },
    { id: "ORD-2024-002", date: "2024-11-28", status: "Shipped", total: "$85.00" },
    { id: "ORD-2024-003", date: "2024-11-15", status: "Processing", total: "$156.25" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-8">My Account</h1>

          {showMagicLinkSent && (
            <Alert className="mb-6 border-[#87a96b] bg-[#87a96b]/10">
              <Mail className="h-4 w-4 text-[#2d5016]" />
              <AlertDescription className="text-[#2c2c2c]">
                A magic link has been sent to your new email address. Please check your inbox and click the link to
                confirm the change.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#87a96b]/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-[#2d5016]" />
                  </div>
                  <CardTitle className="text-lg">Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">View your order history and track shipments.</p>
                <Link href="/account/orders">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#87a96b]/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-[#2d5016]" />
                  </div>
                  <CardTitle className="text-lg">Account Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Update your name, email, and password.</p>
                <Link href="/account/details">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Edit Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#87a96b]/20 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#2d5016]" />
                  </div>
                  <CardTitle className="text-lg">Addresses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Manage your saved delivery addresses.</p>
                <Link href="/account/addresses">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Manage Addresses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#2d5016]">Account Information</CardTitle>
              <CardDescription>View and edit your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  {!isEditingName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      className="h-8 text-[#2d5016] hover:text-[#2d5016]/80"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingName ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="focus:ring-[#87a96b]"
                      />
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="focus:ring-[#87a96b]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveName}
                        disabled={isSaving}
                        className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                        size="sm"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancelName} variant="outline" size="sm" disabled={isSaving}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base">
                    {firstName} {lastName}
                  </p>
                )}
              </div>

              {/* Email Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  {!isEditingEmail && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingEmail(true)}
                      className="h-8 text-[#2d5016] hover:text-[#2d5016]/80"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingEmail ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="focus:ring-[#87a96b]"
                    />
                    <p className="text-xs text-muted-foreground">
                      A magic link will be sent to your new email address to confirm this change.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEmail}
                        disabled={isSaving}
                        className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                        size="sm"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {isSaving ? "Sending Link..." : "Save & Send Link"}
                      </Button>
                      <Button onClick={handleCancelEmail} variant="outline" size="sm" disabled={isSaving}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base">{email}</p>
                )}
              </div>

              {/* Phone Number Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                  {!isEditingPhone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPhone(true)}
                      className="h-8 text-[#2d5016] hover:text-[#2d5016]/80"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingPhone ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                        <SelectTrigger className="w-32">
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
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="412345678"
                        className="flex-1 focus:ring-[#87a96b]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSavePhone}
                        disabled={isSaving}
                        className="bg-[#2d5016] hover:bg-[#2d5016]/90"
                        size="sm"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancelPhone} variant="outline" size="sm" disabled={isSaving}>
                        <X className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base">
                    {phonePrefix} {phoneNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#2d5016]">Recent Orders</CardTitle>
              <CardDescription>Your latest purchases and their delivery status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-lg hover:bg-[#87a96b]/5 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2d5016]">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{order.status}</p>
                          <p className="text-sm text-muted-foreground">{order.total}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/account/orders">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-center">
            <Button variant="ghost" className="text-muted-foreground hover:text-[#2d5016]">
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
