/**
 * Constantes de rutas de la aplicación
 */

// Rutas públicas (no requieren autenticación)
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
} as const;

// Rutas protegidas (requieren autenticación)
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  COMPANIES: '/companies',
  BRANDS: '/brands',
  CAMPAIGNS: '/campaigns',
  SOCIAL: '/social',
  ANALYTICS: '/analytics',
  CONTENT_AI: '/content-ai',
  PAYMENTS: '/payments',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// Lista de rutas protegidas para el middleware
export const PROTECTED_ROUTE_PREFIXES = [
  PROTECTED_ROUTES.DASHBOARD,
  PROTECTED_ROUTES.COMPANIES,
  PROTECTED_ROUTES.BRANDS,
  PROTECTED_ROUTES.CAMPAIGNS,
  PROTECTED_ROUTES.SOCIAL,
  PROTECTED_ROUTES.ANALYTICS,
  PROTECTED_ROUTES.CONTENT_AI,
  PROTECTED_ROUTES.PAYMENTS,
  PROTECTED_ROUTES.SETTINGS,
  PROTECTED_ROUTES.PROFILE,
] as const;

// Rutas de autenticación (solo accesibles sin estar autenticado)
export const AUTH_ONLY_ROUTES = [
  PUBLIC_ROUTES.LOGIN,
  PUBLIC_ROUTES.REGISTER,
] as const;

// Rutas de API
export const API_ROUTES = {
  // Auth
  AUTH_SESSION: '/api/auth/session',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',

  // Social
  SOCIAL_ACCOUNTS: '/api/social/accounts',
  SOCIAL_CONNECT: '/api/social/connect',
  SOCIAL_PUBLISH: '/api/social/publish',
  SOCIAL_SCHEDULE: '/api/social/schedule',

  // AI
  AI_GENERATE_TEXT: '/api/ai/generate-text',
  AI_GENERATE_IMAGE: '/api/ai/generate-image',

  // Storage
  STORAGE_UPLOAD: '/api/storage/upload',
} as const;

export type ProtectedRoute = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES];
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
