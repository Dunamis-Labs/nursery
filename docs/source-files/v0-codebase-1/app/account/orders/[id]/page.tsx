import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Order Details - The Plant Nursery",
  description: "View detailed information about your order including items, delivery address, and tracking.",
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  // Mock data - in real app this would be fetched based on params.id
  const order = {
    id: params.id,
    date: "2024-12-10",
    status: "Delivered",
    total: "$127.50",
    trackingNumber: "AU1234567890",
    items: [
      {
        name: "Monstera Deliciosa",
        size: "Medium",
        price: "$45.99",
        quantity: 1,
        image: "/monstera-deliciosa-full-plant-pot.jpg",
      },
      { name: "Snake Plant", size: "Large", price: "$32.99", quantity: 2, image: "/snake-plant-sansevieria-pot.jpg" },
    ],
    shippingAddress: {
      name: "John Smith",
      address: "123 Garden Street",
      city: "Melbourne",
      state: "VIC",
      postcode: "3000",
      country: "Australia",
    },
    timeline: [
      { status: "Order Placed", date: "Dec 10, 2024 10:30 AM", completed: true },
      { status: "Processing", date: "Dec 10, 2024 2:15 PM", completed: true },
      { status: "Shipped", date: "Dec 11, 2024 9:00 AM", completed: true },
      { status: "Delivered", date: "Dec 13, 2024 3:45 PM", completed: true },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-[#2d5016]">
              ← Back to Orders
            </Link>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-2">Order {order.id}</h1>
              <p className="text-muted-foreground">Placed on {order.date}</p>
            </div>
            <Badge className="bg-[#87a96b] text-white hover:bg-[#87a96b]/90">{order.status}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#2d5016]">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#2d5016]">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-[#2d5016]">{order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="font-semibold">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postcode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                  <p className="font-mono text-sm font-semibold mb-4">{order.trackingNumber}</p>
                  <a
                    href={`https://auspost.com.au/mypost/track/#/details/${order.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#2d5016] hover:underline"
                  >
                    Track with Australia Post →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#2d5016]">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed ? "bg-[#87a96b]" : "bg-gray-200"
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className={`w-0.5 h-12 ${event.completed ? "bg-[#87a96b]" : "bg-gray-200"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="font-semibold">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
