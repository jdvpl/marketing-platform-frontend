'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setCredentials } from '@/features/auth/authSlice';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const error = searchParams.get('error');
      if (error) {
        window.location.href = `/login?error=${encodeURIComponent(error)}`;
        return;
      }

      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        window.location.href = '/login?error=tokens_missing';
        return;
      }

      try {
        // Crear sesión via API route (setea cookies server-side)
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const { user } = await response.json();

        // Actualizar Redux
        if (user) {
          dispatch(setCredentials({ user, token: accessToken }));
        }

        // Redirigir al dashboard usando window.location para forzar nueva request
        // Esto asegura que el middleware vea las cookies recién seteadas
        window.location.href = '/dashboard';
      } catch (err) {
        console.error('Auth callback error:', err);
        window.location.href = '/login?error=session_failed';
      }
    };

    handleCallback();
  }, [searchParams, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Autenticando...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
