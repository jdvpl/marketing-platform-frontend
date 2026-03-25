import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES, COOKIE_CONFIG } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Llamar al backend de autenticación
    const apiUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${apiUrl}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Error al registrarse' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Almacenar tokens y usuario en cookies
    const cookieStore = await cookies();

    cookieStore.set(
      COOKIE_NAMES.ACCESS_TOKEN,
      data.accessToken,
      COOKIE_CONFIG.ACCESS_TOKEN
    );

    cookieStore.set(
      COOKIE_NAMES.REFRESH_TOKEN,
      data.refreshToken,
      COOKIE_CONFIG.REFRESH_TOKEN
    );

    cookieStore.set(
      COOKIE_NAMES.USER,
      JSON.stringify(data.user),
      COOKIE_CONFIG.USER
    );

    return NextResponse.json({
      user: data.user,
      success: true,
    });
  } catch (error: unknown) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Error al procesar la solicitud';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
