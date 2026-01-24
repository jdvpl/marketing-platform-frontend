import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    // Eliminar cookies de autenticación
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);

    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
