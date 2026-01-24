'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ShareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const stats = [
    {
      name: 'Campañas Activas',
      value: '12',
      change: '+4.75%',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Total Alcance',
      value: '45.2K',
      change: '+12.5%',
      changeType: 'positive',
      icon: EyeIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Engagement',
      value: '8.4%',
      change: '+2.3%',
      changeType: 'positive',
      icon: ShareIcon,
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Conversiones',
      value: '1,234',
      change: '+18.2%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const recentCampaigns = [
    {
      name: 'Campaña de Verano 2026',
      status: 'Activa',
      platform: 'Multi-plataforma',
      reach: '12.5K',
      engagement: '7.2%'
    },
    {
      name: 'Lanzamiento Producto X',
      status: 'Activa',
      platform: 'Instagram & Facebook',
      reach: '8.3K',
      engagement: '9.1%'
    },
    {
      name: 'Black Friday Preventa',
      status: 'Programada',
      platform: 'TikTok & YouTube',
      reach: '-',
      engagement: '-'
    }
  ];

  const quickActions = [
    {
      name: 'Nueva Campaña',
      description: 'Crea una nueva campaña de marketing',
      icon: ChartBarIcon,
      href: '/dashboard/campaigns/new',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Generar Contenido IA',
      description: 'Usa GPT-4 para crear contenido',
      icon: SparklesIcon,
      href: '/dashboard/ai',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Conectar Red Social',
      description: 'Vincula una nueva cuenta social',
      icon: ShareIcon,
      href: '/social',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Ver Analytics',
      description: 'Analiza el rendimiento',
      icon: ChartBarIcon,
      href: '/dashboard/analytics',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenido de nuevo! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Aquí tienes un resumen de tu actividad de marketing
          </p>
        </div>

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
                <span className={`text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
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
              <a
                key={action.name}
                href={action.href}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Campaigns Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Campañas Recientes</h2>
            <a href="/dashboard/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Ver todas →
            </a>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaña
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plataforma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alcance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCampaigns.map((campaign, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          campaign.status === 'Activa'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.reach}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.engagement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <ChartBarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Nueva campaña creada</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ShareIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Cuenta de Instagram conectada</p>
                  <p className="text-xs text-gray-500">Hace 5 horas</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Contenido generado con IA</p>
                  <p className="text-xs text-gray-500">Hace 1 día</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Plataformas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Instagram</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Facebook</span>
                  <span className="text-sm text-gray-500">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">TikTok</span>
                  <span className="text-sm text-gray-500">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">YouTube</span>
                  <span className="text-sm text-gray-500">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
