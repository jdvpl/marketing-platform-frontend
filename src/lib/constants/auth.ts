/**
 * Constantes de autenticación
 * Nombres de cookies y configuración relacionada
 */

export const COOKIE_NAMES = {
  ACCESS_TOKEN: '_mkt_sid',
  REFRESH_TOKEN: '_mkt_rid',
  USER: '_mkt_user',
} as const;

export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    httpOnly: false, // Cliente necesita acceso para API calls
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60, // 1 hora
  },
  REFRESH_TOKEN: {
    httpOnly: true, // Más seguro
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
  USER: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60, // 1 hora
  },
} as const;

export type CookieName = typeof COOKIE_NAMES[keyof typeof COOKIE_NAMES];
