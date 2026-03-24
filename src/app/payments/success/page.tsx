'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchSubscription } from '@/features/payments/paymentsSlice';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedCompanyId } = useCompanyBrand();

  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(fetchSubscription(selectedCompanyId));
    }
  }, [dispatch, selectedCompanyId]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-12 max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago exitoso!</h1>
            <p className="text-gray-500 mb-8">
              Tu suscripción ha sido activada. Ya tienes acceso completo a todas las funcionalidades de tu plan.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Ir al Dashboard
              </button>
              <button
                onClick={() => router.push('/payments')}
                className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Ver mi plan
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
