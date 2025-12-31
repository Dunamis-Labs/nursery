import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@nursery/db"
import { createClient } from "@/lib/supabase/server"

async function getCurrentUser() {
  try {
    // Verify prisma client is initialized
    if (!prisma) {
      console.error("Prisma client is not initialized")
      throw new Error("Prisma client is not initialized")
    }

    // Verify userProfile model exists
    if (!prisma.userProfile) {
      console.error("Prisma userProfile model is not available. Available models:", Object.keys(prisma).filter(key => !key.startsWith('_')))
      throw new Error("Prisma userProfile model is not available. Please run: npm run db:generate")
    }

    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error("Error getting auth user:", authError)
      return null
    }

    if (!authUser) {
      console.log("No auth user found")
      return null
    }

    console.log("Auth user found:", authUser.id, authUser.email)

    // Use upsert to handle race conditions (profile might already exist from callback)
    const profile = await prisma.userProfile.upsert({
      where: { id: authUser.id },
      create: {
        id: authUser.id,
        email: authUser.email!,
      },
      update: {
        // Update email in case it changed
        email: authUser.email!,
      },
    })

    console.log("User profile retrieved/created:", profile.id)

    return {
      ...profile,
      emailVerified: authUser.email_confirmed_at !== null,
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack)
    }
    throw error
  }
}

export async function GET() {
  try {
    console.log("GET /api/account called")
    const user = await getCurrentUser()

    if (!user) {
      console.log("No user returned from getCurrentUser")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("Returning user data:", { id: user.id, email: user.email })
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching account:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json(
      { 
        error: "Failed to fetch account",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phoneCountryCode, phoneNumber, email } = body

    const supabase = await createClient()
    const updateData: {
      firstName?: string
      lastName?: string
      phone?: string
      phoneCountryCode?: string
    } = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phoneCountryCode !== undefined && phoneNumber !== undefined) {
      updateData.phone = `${phoneCountryCode}${phoneNumber}`
      updateData.phoneCountryCode = phoneCountryCode
    }

    // Handle email change - requires verification via Supabase
    let emailChangePending = false
    if (email !== undefined && email !== user.email) {
      const { error } = await supabase.auth.updateUser({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
        },
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }

      emailChangePending = true
    }

    // Update profile
    const updatedUser = await prisma.userProfile.update({
      where: { id: user.id },
      data: updateData,
    })

    // Get updated auth user to check email verification
    const { data: { user: authUser } } = await supabase.auth.getUser()

    return NextResponse.json({
      ...updatedUser,
      emailVerified: authUser?.email_confirmed_at !== null,
      emailChangePending,
    })
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    )
  }
}

