import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAMES, COOKIE_CONFIG } from '@/lib/constants';

// Decodificar JWT payload
function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Tokens required' }, { status: 400 });
    }

    // Extraer info del usuario del JWT
    const payload = decodeJwt(accessToken);
    const user = payload ? {
      id: payload.sub,
      email: payload.email || payload.upn,
      provider: payload.provider || 'GOOGLE',
      roles: payload.roles || [],
    } : null;

    // Crear response
    const response = NextResponse.json({ success: true, user });

    // Setear cookies server-side (sin encoding para simplificar)
    response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, COOKIE_CONFIG.ACCESS_TOKEN);
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, COOKIE_CONFIG.REFRESH_TOKEN);

    if (user) {
      response.cookies.set(COOKIE_NAMES.USER, JSON.stringify(user), COOKIE_CONFIG.USER);
    }

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // Limpiar todas las cookies de sesión
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
  response.cookies.delete(COOKIE_NAMES.USER);

  return response;
}
