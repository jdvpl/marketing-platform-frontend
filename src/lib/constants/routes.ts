export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
} as const;

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

export const AUTH_ONLY_ROUTES = [
  PUBLIC_ROUTES.LOGIN,
  PUBLIC_ROUTES.REGISTER,
] as const;
