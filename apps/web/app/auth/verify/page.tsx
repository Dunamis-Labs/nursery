import { Suspense } from "react"
import { VerifyPageClient } from "./verify-client"
import { Loader2 } from "lucide-react"

function VerifyPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#2d5016]" />
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageLoading />}>
      <VerifyPageClient />
    </Suspense>
  )
}

