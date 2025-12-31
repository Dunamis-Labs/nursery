import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@nursery/db"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const token_hash = requestUrl.searchParams.get("token_hash")
    const type = requestUrl.searchParams.get("type")
    const next = requestUrl.searchParams.get("next") ?? "/account"
    const productId = requestUrl.searchParams.get("productId")

    console.log("Auth callback received:", { code: !!code, token_hash: !!token_hash, type, next, productId })

    const supabase = await createClient()
    let user = null
    let session = null

    // Handle PKCE flow (code parameter)
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/auth/verify?error=exchange_failed", request.url))
      }

      if (!data?.user) {
        console.error("No user data after code exchange")
        return NextResponse.redirect(new URL("/auth/verify?error=no_user", request.url))
      }

      user = data.user
      session = data.session
      console.log("Code exchange successful. User ID:", user.id, "Session:", !!session)
    }
    // Handle OTP flow (token_hash and type parameters)
    else if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error("Error verifying OTP:", error)
        return NextResponse.redirect(new URL("/auth/verify?error=otp_verification_failed", request.url))
      }

      if (!data?.user) {
        console.error("No user data after OTP verification")
        return NextResponse.redirect(new URL("/auth/verify?error=no_user", request.url))
      }

      user = data.user
      session = data.session
      console.log("OTP verification successful. User ID:", user.id, "Session:", !!session)
    } else {
      console.error("Missing authentication parameters. Code:", !!code, "Token hash:", !!token_hash, "Type:", type)
      return NextResponse.redirect(new URL("/auth/verify?error=missing_params", request.url))
    }

    if (!user) {
      return NextResponse.redirect(new URL("/auth/verify?error=no_user", request.url))
    }

    if (!session) {
      console.error("No session after authentication")
      return NextResponse.redirect(new URL("/auth/verify?error=no_session", request.url))
    }

    // Create or update user profile
    const userMetadata = user.user_metadata || {}
    
    try {
      // First, check if there's an existing profile with this email but different ID
      // This handles the case where we created a temporary profile before authentication
      const existingByEmail = await prisma.userProfile.findUnique({
        where: { email: user.email! },
      })
      
      if (existingByEmail && existingByEmail.id !== user.id) {
        // There's a temporary profile - we need to migrate it
        // Update the temporary profile's ID to the auth user ID
        // But first, we need to handle any StockNotifications linked to the old ID
        const oldUserId = existingByEmail.id
        
        // Update StockNotifications to use the new user ID
        await prisma.stockNotification.updateMany({
          where: { userId: oldUserId },
          data: { userId: user.id },
        })
        
        // Delete the old temporary profile
        await prisma.userProfile.delete({
          where: { id: oldUserId },
        })
        
        console.log("Migrated temporary profile to authenticated user:", {
          oldId: oldUserId,
          newId: user.id,
          email: user.email,
        })
      }
      
      // Now upsert the profile with the correct auth user ID
      // Build update data - use metadata if available, otherwise preserve existing values
      const updateData: {
        email: string
        firstName?: string | null
        lastName?: string | null
        phone?: string | null
        phoneCountryCode?: string | null
      } = {
        email: user.email!,
      }
      
      // Only update fields that are in metadata, otherwise keep existing values
      if (userMetadata.firstName !== undefined) {
        updateData.firstName = userMetadata.firstName || null
      }
      if (userMetadata.lastName !== undefined) {
        updateData.lastName = userMetadata.lastName || null
      }
      if (userMetadata.phone !== undefined) {
        updateData.phone = userMetadata.phone || null
      }
      if (userMetadata.phoneCountryCode !== undefined) {
        updateData.phoneCountryCode = userMetadata.phoneCountryCode || null
      }
      
      await prisma.userProfile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          // Use metadata if available, otherwise try to preserve existing data from temporary profile
          firstName: userMetadata.firstName || existingByEmail?.firstName || null,
          lastName: userMetadata.lastName || existingByEmail?.lastName || null,
          phone: userMetadata.phone || existingByEmail?.phone || null,
          phoneCountryCode: userMetadata.phoneCountryCode || existingByEmail?.phoneCountryCode || null,
        },
        update: updateData,
      })
      console.log("User profile upserted successfully")
    } catch (prismaError) {
      console.error("Error upserting user profile:", prismaError)
      // Continue anyway - user might already exist
    }

    // If productId is present, create stock notification
    if (productId) {
      try {
        await prisma.stockNotification.upsert({
          where: {
            userId_productId: {
              userId: user.id,
              productId,
            },
          },
          create: {
            userId: user.id,
            productId,
          },
          update: {
            notified: false,
            notifiedAt: null,
          },
        })
        console.log("Stock notification created successfully")
      } catch (notificationError) {
        console.error("Error creating stock notification:", notificationError)
        // Continue anyway - notification creation is not critical
      }
    }

    // Verify session is still valid before redirecting
    const { data: { session: verifySession } } = await supabase.auth.getSession()
    if (!verifySession) {
      console.error("Session not found after profile creation")
      return NextResponse.redirect(new URL("/auth/verify?error=session_lost", request.url))
    }

    console.log("Redirecting to:", `${next}?verified=true`)
    // Use the origin from the request to ensure we stay on the same domain (production or local)
    const origin = requestUrl.origin
    const redirectUrl = new URL(`${next}?verified=true`, origin)
    const response = NextResponse.redirect(redirectUrl)
    
    // Ensure cookies are set in the response
    const cookieStore = await import('next/headers').then(m => m.cookies())
    const cookies = cookieStore.getAll()
    console.log("Cookies in response:", cookies.length)
    
    return response
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack)
    }
    return NextResponse.redirect(new URL("/auth/verify?error=server_error", request.url))
  }
}

