import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package, User, MapPin, LogOut } from "lucide-react"

export const metadata = {
  title: "My Account - The Plant Nursery",
  description: "View and manage your account, orders, and saved addresses.",
}

export default function AccountPage() {
  // Mock data - in real app this would come from authentication
  const user = {
    name: "John Smith",
    email: "john.smith@example.com",
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
              <CardTitle className="font-serif text-2xl text-[#2d5016]">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user.email}</p>
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
