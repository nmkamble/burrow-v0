import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log("[v0] middleware v2 running for:", request.nextUrl.pathname)
  console.log("[v0] SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("[v0] SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  try {
    return await updateSession(request)
  } catch (error) {
    console.error("[v0] Middleware caught error:", error)
    // If middleware crashes, let the request through rather than returning 500/404
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
