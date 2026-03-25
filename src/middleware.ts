import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES, AUTH_ONLY_ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude OAuth callbacks and static assets
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Check for any auth cookie (access token OR user cookie)
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const userCookie = request.cookies.get(COOKIE_NAMES.USER)?.value;
  const isAuthenticated = !!(accessToken || userCookie);

  // If user is authenticated and tries to access login/register, redirect to dashboard
  const isAuthRoute = AUTH_ONLY_ROUTES.some(route => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(PROTECTED_ROUTES.DASHBOARD, request.url));
  }

  // For protected routes: only redirect if clearly unauthenticated (no cookies at all)
  // Let the client-side ProtectedRoute handle edge cases (expired tokens, etc.)
  // This avoids false redirects during client-side navigation
  return NextResponse.next();
}

// Matcher config
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
