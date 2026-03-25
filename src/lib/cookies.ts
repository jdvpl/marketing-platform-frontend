/**
 * Módulo para manejo de cookies - sin encriptación
 * Valores se guardan en texto plano (el JWT ya viene firmado por el backend)
 */

import { COOKIE_NAMES, COOKIE_CONFIG } from '@/lib/constants';

/**
 * Obtiene el valor de una cookie (cliente)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;

  const raw = match[2];

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Establece una cookie (cliente)
 */
export function setCookie(name: string, value: string, options?: { maxAge?: number; path?: string }): void {
  if (typeof document === 'undefined') return;

  const maxAge = options?.maxAge || COOKIE_CONFIG.ACCESS_TOKEN.maxAge;
  const path = options?.path || '/';

  document.cookie = `${name}=${encodeURIComponent(value)};path=${path};max-age=${maxAge};SameSite=Lax`;
}

/**
 * Elimina una cookie (cliente)
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Obtiene los datos del usuario de la cookie
 */
export function getUserFromCookie(): { id: string; email: string; roles: any[] } | null {
  const userJson = getCookie(COOKIE_NAMES.USER);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Verifica si hay un token de acceso válido
 */
export function hasAccessToken(): boolean {
  return !!getCookie(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Obtiene el estado de autenticación desde cookies
 */
export function getAuthFromCookies(): { isAuthenticated: boolean; user: any | null; token: string | null } {
  const user = getUserFromCookie();
  const token = getCookie(COOKIE_NAMES.ACCESS_TOKEN);

  return {
    isAuthenticated: !!user && !!token,
    user,
    token,
  };
}

/**
 * Limpia todas las cookies de autenticación
 */
export function clearAuthCookies(): void {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAMES.USER);
}

// Re-exportar constantes
export { COOKIE_NAMES, COOKIE_CONFIG };
