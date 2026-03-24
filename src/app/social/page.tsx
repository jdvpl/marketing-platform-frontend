'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchSocialAccounts } from '@/features/social/socialSlice';
import SocialAccountCard from '@/components/social/SocialAccountCard';
import ConnectSocialButton from '@/components/social/ConnectSocialButton';
import PublishForm from '@/components/social/PublishForm';
import ScheduleForm from '@/components/social/ScheduleForm';
import CrossPostForm from '@/components/social/CrossPostForm';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  ShareIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

type Tab = 'accounts' | 'publish' | 'cross-post' | 'schedule';

const TABS: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'accounts', label: 'Cuentas', icon: ShareIcon, description: 'Redes conectadas' },
  { id: 'publish', label: 'Publicar', icon: MegaphoneIcon, description: 'Una red' },
  { id: 'cross-post', label: 'Publicar en todas', icon: GlobeAltIcon, description: 'Todas las redes' },
  { id: 'schedule', label: 'Programar', icon: CalendarDaysIcon, description: 'Agendar' },
];

export default function SocialPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { accounts: socialAccounts, isLoading: socialLoading, error: socialError } = useAppSelector((state) => state.social);
  const [selectedTab, setSelectedTab] = useState<Tab>('accounts');

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchSocialAccounts(selectedBrandId));
    }
  }, [dispatch, selectedBrandId]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Redes Sociales</h1>
              <p className="mt-1 text-gray-500">
                Gestiona y publica en todas tus redes desde un solo lugar
              </p>
            </div>
            {selectedTab === 'accounts' && (
              <ConnectSocialButton brandId={selectedBrandId!} />
            )}
          </div>

          {/* Connected accounts quick summary */}
          {socialAccounts.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {socialAccounts.map((acc) => (
                <span
                  key={acc.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    acc.provider === 'META' ? 'bg-blue-100 text-blue-700' :
                    acc.provider === 'TIKTOK' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  {acc.provider} — @{acc.providerUsername || 'conectado'}
                </span>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex flex-col items-center py-4 px-2 text-sm font-medium transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-b from-blue-50 to-white border-b-2 border-blue-600 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mb-1 ${selectedTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-semibold">{tab.label}</span>
                  <span className="text-xs text-gray-400 hidden sm:block">{tab.description}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Accounts Tab */}
              {selectedTab === 'accounts' && (
                <div>
                  {socialError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{socialError}</p>
                    </div>
                  )}
                  {socialLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                    </div>
                  ) : socialAccounts.length === 0 ? (
                    <div className="text-center py-12">
                      <ShareIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin cuentas conectadas</h3>
                      <p className="text-gray-500 mb-6 text-sm">
                        Conecta tus redes sociales para publicar y gestionar todo desde aquí
                      </p>
                      <ConnectSocialButton brandId={selectedBrandId!} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {socialAccounts.map((account) => (
                        <SocialAccountCard key={account.id} account={account} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Publish Tab (single network) */}
              {selectedTab === 'publish' && (
                <div className="max-w-2xl mx-auto">
                  <PublishForm
                    brandId={selectedBrandId!}
                    onSuccess={() => dispatch(fetchSocialAccounts(selectedBrandId!))}
                  />
                </div>
              )}

              {/* Cross-post Tab (all networks) */}
              {selectedTab === 'cross-post' && (
                <div className="max-w-2xl mx-auto">
                  <CrossPostForm
                    brandId={selectedBrandId!}
                    onSuccess={() => dispatch(fetchSocialAccounts(selectedBrandId!))}
                  />
                </div>
              )}

              {/* Schedule Tab */}
              {selectedTab === 'schedule' && (
                <div className="max-w-2xl mx-auto">
                  <ScheduleForm
                    onSuccess={() => setSelectedTab('accounts')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
