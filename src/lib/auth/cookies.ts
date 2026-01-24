import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';

/**
 * Helper para obtener el access token de las cookies (server-side)
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
}

/**
 * Helper para obtener el refresh token de las cookies (server-side)
 */
export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value || null;
}

/**
 * Helper para obtener la info del usuario de las cookies (server-side)
 */
export async function getUserFromCookie(): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies();
  const userStr = cookieStore.get(COOKIE_NAMES.USER)?.value;

  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario está autenticado (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}
