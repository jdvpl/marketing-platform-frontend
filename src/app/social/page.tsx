'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchSocialAccounts } from '@/features/social/socialSlice';
import SocialAccountCard from '@/components/social/SocialAccountCard';
import ConnectSocialButton from '@/components/social/ConnectSocialButton';
import PublishForm from '@/components/social/PublishForm';
import ScheduleForm from '@/components/social/ScheduleForm';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SocialPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { accounts, isLoading, error } = useAppSelector((state) => state.social);
  const [selectedTab, setSelectedTab] = useState<'accounts' | 'publish' | 'schedule'>('accounts');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchSocialAccounts(selectedBrandId));
    }
  }, [dispatch, selectedBrandId]);

  // Simular brandId por ahora - en producción vendría del contexto o selección del usuario
  useEffect(() => {
    if (!selectedBrandId) {
      setSelectedBrandId('550e8400-e29b-41d4-a716-446655440000');
    }
  }, [selectedBrandId]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Redes Sociales</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus cuentas y publica contenido en redes sociales
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('accounts')}
                className={`${
                  selectedTab === 'accounts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Cuentas Conectadas
              </button>
              <button
                onClick={() => setSelectedTab('publish')}
                className={`${
                  selectedTab === 'publish'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Publicar
              </button>
              <button
                onClick={() => setSelectedTab('schedule')}
                className={`${
                  selectedTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Programar
              </button>
            </nav>
          </div>
        </div>

        {selectedTab === 'accounts' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Cuentas Conectadas ({accounts.length})
              </h2>
              <ConnectSocialButton brandId={selectedBrandId} />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600 mb-4">
                  No tienes cuentas conectadas todavía
                </p>
                <ConnectSocialButton brandId={selectedBrandId} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <SocialAccountCard key={account.id} account={account} />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'publish' && (
          <div className="max-w-2xl mx-auto">
            <PublishForm
              brandId={selectedBrandId}
              onSuccess={() => {
                dispatch(fetchSocialAccounts(selectedBrandId));
              }}
            />
          </div>
        )}

        {selectedTab === 'schedule' && (
          <div className="max-w-2xl mx-auto">
            <ScheduleForm
              campaignId="550e8400-e29b-41d4-a716-446655440001"
              onSuccess={() => {
                setSelectedTab('accounts');
              }}
            />
          </div>
        )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
