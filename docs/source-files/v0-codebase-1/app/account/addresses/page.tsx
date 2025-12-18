import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus, MapPin } from "lucide-react"

export const metadata = {
  title: "Saved Addresses - The Plant Nursery",
  description: "Manage your saved delivery addresses for faster checkout.",
}

export default function AddressesPage() {
  const addresses = [
    {
      id: 1,
      name: "Home",
      recipient: "John Smith",
      address: "123 Garden Street",
      city: "Melbourne",
      state: "VIC",
      postcode: "3000",
      isDefault: true,
    },
    {
      id: 2,
      name: "Work",
      recipient: "John Smith",
      address: "456 Office Lane",
      city: "Melbourne",
      state: "VIC",
      postcode: "3001",
      isDefault: false,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/account" className="text-sm text-muted-foreground hover:text-[#2d5016]">
              ← Back to Account
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-4xl font-bold text-[#2d5016]">Saved Addresses</h1>
            <Button className="bg-[#2d5016] hover:bg-[#2d5016]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className={address.isDefault ? "border-[#2d5016] border-2" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#2d5016]" />
                      <CardTitle className="text-lg">{address.name}</CardTitle>
                    </div>
                    {address.isDefault && (
                      <span className="text-xs bg-[#87a96b] text-white px-2 py-1 rounded-md">Default</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1 mb-4">
                    <p className="font-semibold">{address.recipient}</p>
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.postcode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
