import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@nursery/db"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, firstName, lastName, phoneCountryCode, phoneNumber, email } = body

    if (!productId || !firstName || !lastName || !phoneNumber || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify product exists with retry logic for connection issues
    let product
    let retries = 3
    while (retries > 0) {
      try {
        product = await prisma.product.findUnique({
          where: { id: productId },
        })
        break
      } catch (dbError: any) {
        retries--
        if (retries === 0) {
          console.error("Database connection error after retries:", dbError)
          // Check if it's a connection error
          if (dbError.message?.includes("Can't reach database server") || 
              dbError.message?.includes("pooler.supabase.com")) {
            return NextResponse.json(
              { 
                error: "Database connection failed. Please check if your Supabase database is running.",
                details: "The database server may be paused or unreachable. Please check your Supabase dashboard."
              },
              { status: 503 }
            )
          }
          throw dbError
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)))
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const supabase = await createClient()
    const fullPhone = `${phoneCountryCode}${phoneNumber}`

    // Check if user exists in Supabase Auth
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    let userId: string

    if (authUser) {
      // User is already authenticated
      userId = authUser.id
      
      // Update or create user profile
      try {
        const updatedProfile = await prisma.userProfile.upsert({
          where: { id: userId },
          create: {
            id: userId,
            email,
            firstName,
            lastName,
            phone: fullPhone,
            phoneCountryCode,
          },
          update: {
            firstName,
            lastName,
            phone: fullPhone,
            phoneCountryCode,
          },
        })
        console.log("User profile updated:", {
          id: updatedProfile.id,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phone: updatedProfile.phone,
        })
      } catch (dbError: any) {
        console.error("Database error upserting user profile:", dbError)
        if (dbError.message?.includes("Can't reach database server")) {
          return NextResponse.json(
            { 
              error: "Database connection failed. Please try again later.",
              details: "The database server may be paused or unreachable."
            },
            { status: 503 }
          )
        }
        throw dbError
      }
    } else {
      // User is not authenticated - check if profile exists by email
      let existingProfile
      try {
        existingProfile = await prisma.userProfile.findUnique({
          where: { email },
        })
      } catch (dbError: any) {
        console.error("Database error checking user profile:", dbError)
        if (dbError.message?.includes("Can't reach database server")) {
          return NextResponse.json(
            { 
              error: "Database connection failed. Please try again later.",
              details: "The database server may be paused or unreachable."
            },
            { status: 503 }
          )
        }
        throw dbError
      }

      if (existingProfile) {
        // Profile exists but user isn't authenticated - update profile with new info
        userId = existingProfile.id
        
        // Update the profile with the new name and phone information
        try {
          const updatedProfile = await prisma.userProfile.update({
            where: { id: userId },
            data: {
              firstName,
              lastName,
              phone: fullPhone,
              phoneCountryCode,
            },
          })
          console.log("Existing profile updated with new info:", {
            id: updatedProfile.id,
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
            phone: updatedProfile.phone,
          })
        } catch (dbError: any) {
          console.error("Database error updating existing profile:", dbError)
          if (dbError.message?.includes("Can't reach database server")) {
            return NextResponse.json(
              { 
                error: "Database connection failed. Please try again later.",
                details: "The database server may be paused or unreachable."
              },
              { status: 503 }
            )
          }
          // Continue anyway - we can still create the notification
        }
      } else {
        // New user - create a temporary profile to save name and phone
        // The magic link is already sent by the frontend, so we don't need to send it again here
        // We'll use a temporary UUID that will be updated when they authenticate
        const { randomUUID } = await import('crypto')
        const tempUserId = randomUUID()
        
        try {
          // Create a temporary profile with the name and phone
          // When they authenticate, we'll find this by email and update the ID
          await prisma.userProfile.create({
            data: {
              id: tempUserId,
              email,
              firstName,
              lastName,
              phone: fullPhone,
              phoneCountryCode,
            },
          })
          
          userId = tempUserId
          console.log("Temporary profile created for unauthenticated user:", {
            id: userId,
            email,
            firstName,
            lastName,
            phone: fullPhone,
          })
        } catch (profileError: any) {
          // If profile creation fails (e.g., email already exists), try to find and update it
          if (profileError.code === 'P2002') {
            // Unique constraint violation - email already exists
            // Try to find existing profile by email
            const existingByEmail = await prisma.userProfile.findUnique({
              where: { email },
            })
            
            if (existingByEmail) {
              // Update existing profile with new name and phone
              await prisma.userProfile.update({
                where: { email },
                data: {
                  firstName,
                  lastName,
                  phone: fullPhone,
                  phoneCountryCode,
                },
              })
              userId = existingByEmail.id
              console.log("Updated existing profile by email:", {
                id: userId,
                email,
                firstName,
                lastName,
                phone: fullPhone,
              })
            } else {
              throw profileError
            }
          } else {
            console.error("Error creating temporary profile:", profileError)
            // If we can't create the profile, we can still proceed
            // The callback route will handle creating the profile when they verify
            // For now, we'll return an error but suggest they check their email
            return NextResponse.json({
              success: false,
              requiresVerification: true,
              message: "Please check your email for the magic link. Your notification will be set up after you verify your email.",
            })
          }
        }
      }
    }

    // Create or update stock notification
    try {
      await prisma.stockNotification.upsert({
        where: {
          userId_productId: {
            userId,
            productId: product.id,
          },
        },
        create: {
          userId,
          productId: product.id,
        },
        update: {
          notified: false, // Reset if already notified
          notifiedAt: null,
        },
      })
    } catch (dbError: any) {
      console.error("Database error creating stock notification:", dbError)
      if (dbError.message?.includes("Can't reach database server")) {
        return NextResponse.json(
          { 
            error: "Database connection failed. Please try again later.",
            details: "The database server may be paused or unreachable."
          },
          { status: 503 }
        )
      }
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating stock notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

