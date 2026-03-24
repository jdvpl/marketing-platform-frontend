import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/crypto';

function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Failed to decode JWT');
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const encodedToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    if (!encodedToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decode base64 token
    const accessToken = Buffer.from(decodeURIComponent(encodedToken), 'base64').toString('utf-8');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decodificar el JWT para obtener la información del usuario
    const payload = decodeJWT(accessToken);

    // Verificar si el token ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      );
    }

    // Extraer información del usuario del token
    const user = {
      id: payload.sub,
      email: payload.email || payload.upn,
      provider: payload.provider,
      roles: Array.isArray(payload.roles) ? payload.roles.map((r: string) => ({ role: r })) : [],
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 }
    );
  }
}
