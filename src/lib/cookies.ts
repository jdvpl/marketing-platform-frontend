/**
 * Módulo unificado para manejo de cookies con codificación
 * Funciones síncronas para usar en cliente y servidor
 */

import { COOKIE_NAMES, COOKIE_CONFIG } from '@/lib/constants';

// Clave para ofuscación simple (no es encriptación fuerte, pero evita lectura casual)
const OBFUSCATION_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'mkt-2024';

/**
 * Codifica un valor para almacenar en cookie
 */
export function encodeValue(value: string): string {
  try {
    // XOR simple + base64 para ofuscación
    const encoded = value
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)))
      .join('');
    return btoa(encodeURIComponent(encoded));
  } catch {
    return btoa(encodeURIComponent(value));
  }
}

/**
 * Decodifica un valor de cookie
 * Maneja múltiples formatos: XOR+base64, solo base64, URL-encoded, o texto plano
 */
export function decodeValue(encoded: string): string | null {
  if (!encoded) return null;

  try {
    // Si es URL-encoded (empieza con %7B para JSON), decodificar
    if (encoded.startsWith('%7B') || encoded.startsWith('%22')) {
      return decodeURIComponent(encoded);
    }

    // Si parece ser un JWT (tiene dos puntos), devolverlo tal cual
    if (encoded.includes('.') && encoded.split('.').length === 3) {
      return encoded;
    }

    // Intentar XOR + base64
    try {
      const decoded = decodeURIComponent(atob(encoded));
      return decoded
        .split('')
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length)))
        .join('');
    } catch {
      // Intentar solo base64
      try {
        return decodeURIComponent(atob(encoded));
      } catch {
        return encoded;
      }
    }
  } catch {
    return null;
  }
}

/**
 * Obtiene el valor de una cookie (cliente)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;

  const raw = match[2];

  // Try URL-decoding first (server-side cookies may be URL-encoded)
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

  const maxAge = options?.maxAge || 3600;
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
