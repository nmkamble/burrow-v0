import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error("[v0] middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/list-item/:path*",
    "/my-rentals/:path*",
    "/my-listings/:path*",
    "/requests/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
}
