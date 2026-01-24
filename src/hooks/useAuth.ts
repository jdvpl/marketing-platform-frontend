import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setCredentials, clearAuth } from '@/features/auth/authSlice';
import { COOKIE_NAMES } from '@/lib/crypto';

// Cookie helpers - ejecutan de manera síncrona
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (!match) return null;
  try {
    return atob(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Verificación síncrona de autenticación
function checkAuthSync(): { isAuthenticated: boolean; user: any | null } {
  const userJson = getCookieValue('_mkt_user');
  const hasToken = !!getCookieValue(COOKIE_NAMES.ACCESS_TOKEN);

  if (userJson && hasToken) {
    try {
      return { isAuthenticated: true, user: JSON.parse(userJson) };
    } catch {
      return { isAuthenticated: false, user: null };
    }
  }
  return { isAuthenticated: false, user: null };
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reduxState = useAppSelector((state) => state.auth);

  // Verificación síncrona: si Redux no tiene datos, leer de cookies
  const authState = useMemo(() => {
    if (reduxState.hasInitialized) {
      return {
        user: reduxState.user,
        isAuthenticated: reduxState.isAuthenticated,
        isLoading: false,
      };
    }

    // Primera carga: verificar cookies síncronamente
    const cookieAuth = checkAuthSync();

    // Actualizar Redux si encontramos auth en cookies
    if (cookieAuth.isAuthenticated && cookieAuth.user) {
      // Esto se ejecutará en el siguiente tick
      setTimeout(() => {
        dispatch(setCredentials({ user: cookieAuth.user, token: 'cookie' }));
      }, 0);
    } else {
      setTimeout(() => {
        dispatch(clearAuth());
      }, 0);
    }

    return {
      user: cookieAuth.user,
      isAuthenticated: cookieAuth.isAuthenticated,
      isLoading: false,
    };
  }, [reduxState.hasInitialized, reduxState.user, reduxState.isAuthenticated, dispatch]);

  const logout = useCallback(() => {
    deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
    deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
    deleteCookie('_mkt_user');
    dispatch(clearAuth());
    router.replace('/login');
  }, [dispatch, router]);

  return {
    ...authState,
    logout,
  };
}
