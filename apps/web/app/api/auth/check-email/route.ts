import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@nursery/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if email exists in UserProfile
    const profile = await prisma.userProfile.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    return NextResponse.json({
      exists: !!profile,
    })
  } catch (error) {
    console.error("Error checking email:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}

