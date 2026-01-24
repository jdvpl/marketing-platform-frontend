import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES, PROTECTED_ROUTE_PREFIXES, PROTECTED_ROUTES, AUTH_ONLY_ROUTES, PUBLIC_ROUTES } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir rutas de callback de OAuth
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const isAuthenticated = !!accessToken;

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(route =>
    pathname.startsWith(route)
  );

  // Verificar si la ruta actual es de autenticación
  const isAuthRoute = AUTH_ONLY_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Si el usuario intenta acceder a una ruta protegida sin estar autenticado
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(PUBLIC_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está autenticado e intenta acceder a login/register
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(PROTECTED_ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

// Configuración del matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
