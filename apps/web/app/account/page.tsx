import { Suspense } from "react"
import { AccountPageClient } from "./account-client"
import { Loader2 } from "lucide-react"
import { NavigationWrapper } from "@/components/layout/navigation-wrapper"
import { Footer } from "@/components/layout/footer"

export const metadata = {
  title: "My Account - The Plant Nursery",
  description: "View and manage your account details.",
}

function AccountPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#2d5016]" />
    </div>
  )
}

export default function AccountPage() {
  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <Suspense fallback={<AccountPageLoading />}>
        <AccountPageClient />
      </Suspense>
      <Footer />
    </div>
  )
}

