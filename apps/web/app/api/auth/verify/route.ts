import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get("token_hash")
    const type = searchParams.get("type")
    const next = searchParams.get("next") ?? "/account"

    if (token_hash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error) {
        return NextResponse.redirect(new URL(`${next}?verified=true`, request.url))
      }
    }

    return NextResponse.redirect(new URL("/auth/verify?error=invalid_token", request.url))
  } catch (error) {
    console.error("Error verifying magic link:", error)
    return NextResponse.redirect(new URL("/auth/verify?error=server_error", request.url))
  }
}

