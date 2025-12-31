import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, redirectTo } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Prepare user metadata if name is provided (for new users)
    const data: Record<string, unknown> = {}
    if (firstName) data.firstName = firstName
    if (lastName) data.lastName = lastName

    // Use custom redirect URL if provided, otherwise default
    const emailRedirectTo = redirectTo 
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${redirectTo}`
      : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`

    // Send magic link using Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        data: Object.keys(data).length > 0 ? data : undefined,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: "Magic link sent" })
  } catch (error) {
    console.error("Error sending magic link:", error)
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    )
  }
}

