import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/cookies';

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
    cookieStore.delete(COOKIE_NAMES.USER);

    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error: unknown) {
    console.error('Logout error:', error);
    const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
