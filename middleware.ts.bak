import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Paths that should bypass auth checks
const EXEMPT_PATHS = new Set(['/login', '/reset-password', '/auth/callback'])
const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|map|woff2?|ttf|eot)$/i

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow Next internals, public assets, API routes, and explicit exempt paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname) ||
    [...EXEMPT_PATHS].some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If envs are missing, skip auth (dev fallback)
  if (!supabaseUrl || !supabaseAnonKey) {
    return res
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
        // Write back to the response so the browser receives updated cookies
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
        res.cookies.set({ name, value: '', ...options, expires: new Date(0) })
      },
    },
  })

  // Check session
  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } as any }))

  // Unauthenticated → /login
  if (!user) {
    const url = new URL('/login', req.url)
    const redirect = NextResponse.redirect(url)
    // propagate cookies set on res
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  // Authenticated: check onboarding status
  // Expect profiles table to have onboarding_completed boolean
  let onboardingCompleted = false
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()
    if (!error) {
      onboardingCompleted = Boolean(profile?.onboarding_completed)
    }
  } catch {
    // Ignore errors and treat as not completed
    onboardingCompleted = false
  }

  // If not completed and not already on /onboarding, redirect there
  if (!onboardingCompleted && pathname !== '/onboarding') {
    const url = new URL('/onboarding', req.url)
    const redirect = NextResponse.redirect(url)
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  // If completed and trying to access /login, send to /profile
  if (onboardingCompleted && pathname === '/login') {
    const url = new URL('/profile', req.url)
    const redirect = NextResponse.redirect(url)
    res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  return res
}

export const config = {
  // Run on all paths except for static files we already skip in code; matcher keeps overhead low
  matcher: ['/((?!_next).*)'],
}
