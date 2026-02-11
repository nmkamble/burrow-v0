import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PROTECTED_PATHS = ["/list-item", "/my-rentals", "/my-listings"]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = "/auth/login"
  return NextResponse.redirect(url)
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] updateSession v3 - url exists:", !!supabaseUrl, "key exists:", !!supabaseAnonKey, "path:", request.nextUrl.pathname)

  // If Supabase env vars are not configured, skip session handling
  // but still enforce redirects for protected paths
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] env vars missing, skipping supabase client creation")
    if (isProtectedPath(request.nextUrl.pathname)) {
      return redirectToLogin(request)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    return redirectToLogin(request)
  }

  return supabaseResponse
}
