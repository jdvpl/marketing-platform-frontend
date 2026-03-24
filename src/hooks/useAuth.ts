'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setCredentials, clearAuth } from '@/features/auth/authSlice';
import { getAuthFromCookies, clearAuthCookies } from '@/lib/cookies';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const reduxAuth = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (reduxAuth.hasInitialized) {
      setIsReady(true);
      return;
    }

    const cookieAuth = getAuthFromCookies();

    if (cookieAuth.isAuthenticated && cookieAuth.user) {
      dispatch(setCredentials({ user: cookieAuth.user, token: cookieAuth.token || '' }));
    } else {
      dispatch(clearAuth());
    }

    setIsReady(true);
  }, [reduxAuth.hasInitialized, dispatch]);

  const logout = useCallback(() => {
    clearAuthCookies();
    dispatch(clearAuth());
    router.replace('/login');
  }, [dispatch, router]);

  return {
    user: reduxAuth.user,
    isAuthenticated: reduxAuth.isAuthenticated,
    isLoading: !isReady,
    logout,
  };
}
