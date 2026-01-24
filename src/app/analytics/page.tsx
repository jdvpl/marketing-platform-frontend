'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');

  // Datos de ejemplo - en producción vendrían del backend
  const metrics = [
    {
      name: 'Alcance Total',
      value: '125.4K',
      change: '+12.5%',
      changeType: 'positive',
      icon: EyeIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Engagement Rate',
      value: '8.4%',
      change: '+2.3%',
      changeType: 'positive',
      icon: HeartIcon,
      color: 'from-pink-500 to-rose-500',
    },
    {
      name: 'Compartidos',
      value: '3.2K',
      change: '+18.2%',
      changeType: 'positive',
      icon: ShareIcon,
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Nuevos Seguidores',
      value: '1,234',
      change: '+5.7%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-violet-500',
    },
  ];

  const platformStats = [
    { platform: 'Instagram', reach: 45000, engagement: 9.2, followers: 12500, color: 'from-purple-500 to-pink-500' },
    { platform: 'Facebook', reach: 38000, engagement: 7.8, followers: 18200, color: 'from-blue-500 to-cyan-500' },
    { platform: 'TikTok', reach: 28000, engagement: 12.5, followers: 8900, color: 'from-gray-700 to-gray-900' },
    { platform: 'YouTube', reach: 14400, engagement: 6.3, followers: 5400, color: 'from-red-500 to-orange-500' },
  ];

  const topPosts = [
    {
      platform: 'Instagram',
      content: 'Lanzamiento producto X - Foto promocional',
      reach: 15200,
      engagement: 14.5,
      date: '2026-01-02',
    },
    {
      platform: 'TikTok',
      content: 'Tutorial rápido - Video viral',
      reach: 12800,
      engagement: 18.2,
      date: '2026-01-01',
    },
    {
      platform: 'Facebook',
      content: 'Campaña de verano - Carrusel',
      reach: 9500,
      engagement: 8.9,
      date: '2025-12-30',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">
                Analiza el rendimiento de tus campañas
              </p>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Últimos 7 días</option>
              <option value="30days">Últimos 30 días</option>
              <option value="90days">Últimos 90 días</option>
              <option value="year">Último año</option>
            </select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color}`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.name}</p>
            </div>
          ))}
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Rendimiento por Plataforma</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alcance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seguidores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {platformStats.map((stat) => (
                  <tr key={stat.platform} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${stat.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-900">{stat.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.reach.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {stat.engagement}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.followers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`}
                          style={{ width: `${Math.min(stat.engagement * 8, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Posts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Mejores Publicaciones</h2>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {post.platform}
                    </span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{post.content}</p>
                </div>
                <div className="flex items-center space-x-6 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Alcance</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {post.reach.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Engagement</p>
                    <p className="text-sm font-semibold text-green-600">
                      {post.engagement}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
