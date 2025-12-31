"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const error = searchParams.get("error")
      if (error) {
        setStatus("error")
        switch (error) {
          case "invalid_token":
            setErrorMessage("Invalid or expired verification token.")
            break
          default:
            setErrorMessage("An error occurred during verification.")
        }
        return
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus("success")
        setTimeout(() => {
          router.push("/account?verified=true")
        }, 2000)
      } else {
        setStatus("error")
        setErrorMessage("Verification failed. Please try requesting a new magic link.")
      }
    }

    checkSession()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-[#2d5016] text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[#2d5016] mx-auto" />
              <CardDescription>Verifying your email...</CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-[#87a96b] mx-auto" />
              <CardDescription className="text-[#2d5016]">
                Email verified successfully! Redirecting to your account...
              </CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <CardDescription className="text-red-600">
                {errorMessage}
              </CardDescription>
              <button
                onClick={() => router.push("/account")}
                className="text-sm text-[#2d5016] hover:underline"
              >
                Go to Account
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

