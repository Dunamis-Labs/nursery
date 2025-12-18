import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata = {
  title: "Order History - The Plant Nursery",
  description: "View all your past orders and track their delivery status.",
}

export default function OrdersPage() {
  const orders = [
    { id: "ORD-2024-001", date: "2024-12-10", status: "Delivered", total: "$127.50", items: 3 },
    { id: "ORD-2024-002", date: "2024-11-28", status: "Shipped", total: "$85.00", items: 2 },
    { id: "ORD-2024-003", date: "2024-11-15", status: "Processing", total: "$156.25", items: 4 },
    { id: "ORD-2024-004", date: "2024-10-22", status: "Delivered", total: "$92.00", items: 2 },
    { id: "ORD-2024-005", date: "2024-09-30", status: "Delivered", total: "$215.75", items: 5 },
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

          <h1 className="font-serif text-4xl font-bold text-[#2d5016] mb-8">Order History</h1>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#2d5016]">All Orders</CardTitle>
              <CardDescription>View details and track the status of your purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link key={order.id} href={`/account/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-4 border border-[#e5e7eb] rounded-lg hover:bg-[#87a96b]/5 transition-colors group">
                      <div className="flex-1">
                        <p className="font-semibold text-[#2d5016]">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.items} {order.items === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{order.status}</p>
                          <p className="text-sm text-muted-foreground">{order.total}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#2d5016] transition-colors" />
                      </div>
                    </div>
                  </Link>
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
