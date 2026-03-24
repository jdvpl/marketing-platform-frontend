'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useSubscription } from '@/hooks/useSubscription';
import { fetchCampaigns } from '@/features/campaigns/campaignsSlice';
import { fetchBrandMetrics, fetchGrowthTrend } from '@/features/metrics/metricsSlice';
import { fetchSocialAccounts } from '@/features/social/socialSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UpgradeBanner from '@/components/UpgradeBanner';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ShareIcon,
  SparklesIcon,
  HeartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

function fmt(n?: number) {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId, selectedCompany, selectedBrand } = useCompanyBrand();
  const { isFreePlan, planName } = useSubscription();
  const { campaigns, isLoading: campaignsLoading } = useAppSelector((s) => s.campaigns);
  const { brandMetrics, growthTrend, isLoading: metricsLoading } = useAppSelector((s) => s.metrics);
  const { accounts: socialAccounts } = useAppSelector((s) => s.social);
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchCampaigns(selectedBrandId));
      dispatch(fetchBrandMetrics(selectedBrandId));
      dispatch(fetchGrowthTrend({ brandId: selectedBrandId, days: 30 }));
      dispatch(fetchSocialAccounts(selectedBrandId));
    }
  }, [selectedBrandId, dispatch]);

  const summary = brandMetrics?.summary;
  const activeCampaigns = campaigns.filter((c) => c.status?.toUpperCase() === 'ACTIVE');
  const isLoading = campaignsLoading || metricsLoading;

  const stats = [
    {
      name: 'Campañas Activas',
      value: String(activeCampaigns.length),
      total: `${campaigns.length} total`,
      icon: ChartBarIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Total Vistas',
      value: fmt(summary?.totalViews),
      total: `${fmt(summary?.totalLikes)} likes`,
      icon: EyeIcon,
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Engagement',
      value: summary?.avgEngagementRate || '0%',
      total: `${fmt(summary?.totalShares)} compartidos`,
      icon: ArrowTrendingUpIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Seguidores Ganados',
      value: growthTrend ? `+${fmt(growthTrend.totalFollowersGained)}` : '0',
      total: '30 días',
      icon: UserGroupIcon,
      color: 'from-orange-500 to-red-500',
    },
  ];

  const quickActions = [
    { name: 'Nueva Campaña', description: 'Crea una nueva campaña', icon: ChartBarIcon, href: '/campaigns', color: 'from-blue-500 to-cyan-500' },
    { name: 'Generar Contenido IA', description: 'Crea contenido con IA', icon: SparklesIcon, href: '/content-ai', color: 'from-purple-500 to-pink-500' },
    { name: 'Conectar Red Social', description: 'Vincula una cuenta', icon: ShareIcon, href: '/social', color: 'from-green-500 to-emerald-500' },
    { name: 'Ver Analytics', description: 'Analiza el rendimiento', icon: ChartBarIcon, href: '/analytics', color: 'from-orange-500 to-red-500' },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Hola, {user?.email?.split('@')[0] || 'usuario'}!
            </h1>
            <p className="text-blue-100 text-lg">
              {selectedCompany ? (
                <>
                  {selectedCompany.name}
                  {selectedBrand ? ` — ${selectedBrand.name}` : ''}
                  <span className="ml-3 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">{planName}</span>
                </>
              ) : (
                'Crea una empresa para comenzar'
              )}
            </p>
          </div>

          {/* Free plan banner */}
          {isFreePlan && <UpgradeBanner />}

          {/* Loading */}
          {isLoading && !summary && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">{stat.total}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Connected Accounts */}
          {socialAccounts.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-500 mr-2 self-center">Redes conectadas:</span>
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
                  {acc.provider}
                </span>
              ))}
            </div>
          )}

          {/* Recent Campaigns Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Campañas Recientes</h2>
              <Link href="/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Ver todas →
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No hay campañas todavía</p>
                  <Link href="/campaigns" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Crear primera campaña →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaña</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programada</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.slice(0, 5).map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                              {campaign.status || 'DRAFT'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.objective || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString('es-ES') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth by Provider */}
            {growthTrend && growthTrend.accounts.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <UserGroupIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Crecimiento (30 días)</h3>
                </div>
                <div className="space-y-3">
                  {growthTrend.accounts.map((acc) => (
                    <div key={acc.socialAccountId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className={`text-xs font-bold px-2 py-1 rounded text-white ${
                        acc.provider === 'META' ? 'bg-blue-500' :
                        acc.provider === 'TIKTOK' ? 'bg-gray-800' : 'bg-red-500'
                      }`}>
                        {acc.provider}
                      </span>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{fmt(acc.followersEnd)} seg.</span>
                      </div>
                      <span className={`text-sm font-semibold ${acc.growthRatePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {acc.growthRatePct >= 0 ? '+' : ''}{acc.growthRatePct.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Platforms */}
            {brandMetrics && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento por Red</h3>
                <div className="space-y-4">
                  {Object.entries(brandMetrics.byProvider).map(([provider, posts]) => {
                    const totalViews = posts.reduce((s, p) => s + (p.viewsCount || 0), 0);
                    const allViews = summary?.totalViews || 1;
                    const pct = Math.round((totalViews / allViews) * 100);
                    return (
                      <div key={provider}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{provider}</span>
                          <span className="text-sm text-gray-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              provider === 'META' ? 'bg-blue-500' :
                              provider === 'TIKTOK' ? 'bg-gray-800' :
                              provider === 'YOUTUBE' ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
