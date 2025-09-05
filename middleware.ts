// Restored middleware enforcing auth & onboarding (Issue #24)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const EXEMPT_PATHS = new Set(['/reset-password', '/auth/callback'])
const LOGIN_PATH = '/login'
const PUBLIC_FILE = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml|map|woff2?|ttf|eot)$/i

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	// Skip static & exempt
	if (
		pathname.startsWith('/_next') ||
		pathname === '/favicon.ico' ||
		PUBLIC_FILE.test(pathname) ||
		[...EXEMPT_PATHS].some((p) => pathname.startsWith(p))
	) {
		return NextResponse.next()
	}

	const res = NextResponse.next()
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	// Simulation mode for E2E
	if (process.env.E2E_MODE === '1') {
		const e2eAuth = req.cookies.get('e2e-auth')?.value === '1'
		const e2eOnboarded = req.cookies.get('e2e-onboarded')?.value === '1'

		if (!e2eAuth) {
			if (pathname === LOGIN_PATH || [...EXEMPT_PATHS].some((p) => pathname.startsWith(p))) {
				return res
			}
			return NextResponse.redirect(new URL(LOGIN_PATH, req.url))
		}
		if (e2eAuth && !e2eOnboarded && pathname !== '/onboarding') {
			return NextResponse.redirect(new URL('/onboarding', req.url))
		}
		if (e2eAuth && e2eOnboarded && pathname === LOGIN_PATH) {
			return NextResponse.redirect(new URL('/profile', req.url))
		}
		return res
	}

		// Fast unauth check (expanded cookie pattern). If absent, still attempt server user fetch
			// (Auth helpers will populate cookies; we always attempt user fetch below.)

	// Env missing → skip deeper checks but allow (already considered authed)
	if (!supabaseUrl || !supabaseAnonKey) return res

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return req.cookies.get(name)?.value
			},
			set(name: string, value: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
				res.cookies.set({ name, value, ...options })
			},
			remove(name: string, options: Parameters<NextResponse['cookies']['set']>[2]) {
				res.cookies.set({ name, value: '', ...options, expires: new Date(0) })
			},
		},
	})

	const {
		data: { user },
	} = await supabase.auth.getUser().catch(() => ({ data: { user: null } as any }))

		if (!user) {
			if (pathname !== LOGIN_PATH) {
				const redirect = NextResponse.redirect(new URL(LOGIN_PATH, req.url))
				res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
				return redirect
			}
			return res // already on login
		}

	let onboardingCompleted = false
	try {
		const { data: profile, error } = await supabase
			.from('profiles')
			.select('onboarding_completed')
			.eq('id', user.id)
			.maybeSingle()
		if (!error) onboardingCompleted = Boolean(profile?.onboarding_completed)
	} catch {
		onboardingCompleted = false
	}

	if (!onboardingCompleted && pathname !== '/onboarding') {
		const redirect = NextResponse.redirect(new URL('/onboarding', req.url))
		res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
		return redirect
	}

	if (onboardingCompleted && pathname === LOGIN_PATH) {
		const redirect = NextResponse.redirect(new URL('/profile', req.url))
		res.cookies.getAll().forEach((c) => redirect.cookies.set(c))
		return redirect
	}

	return res
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
