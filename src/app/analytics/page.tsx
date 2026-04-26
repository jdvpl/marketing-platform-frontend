'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchBrandMetrics, fetchGrowthTrend, fetchBestTimes } from '@/features/metrics/metricsSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTranslation } from '@/hooks/useTranslation';
import {
  EyeIcon,
  HeartIcon,
  ShareIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_COLORS: Record<string, string> = {
  META: 'from-blue-500 to-cyan-500',
  TIKTOK: 'from-gray-700 to-gray-900',
  YOUTUBE: 'from-red-500 to-orange-500',
};

const DAYS_VALUES = [7, 30, 90];

function fmt(n?: number) {
  if (n === undefined || n === null) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface RevenueData {
  brandId: string;
  totalEstimatedRevenueUsd: number;
  avgRpm: number;
  avgCpm: number;
  totalMonetizedViews: number;
  totalAdImpressions: number;
  byProvider: Record<string, { estimatedRevenueUsd: number; rpm: number; monetizedViews: number }>;
}

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { brandMetrics, growthTrend, bestTimes, isLoading } = useAppSelector((s) => s.metrics);
  const { t } = useTranslation();
  const DAYS_OPTIONS = [
    { value: 7, label: `7 ${t('analytics_days')}` },
    { value: 30, label: `30 ${t('analytics_days')}` },
    { value: 90, label: `90 ${t('analytics_days')}` },
  ];
  const [days, setDays] = useState(30);
  const [providerFilter, setProviderFilter] = useState('');
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [revenueDays, setRevenueDays] = useState(30);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchBrandMetrics(selectedBrandId));
      dispatch(fetchBestTimes({ brandId: selectedBrandId, provider: providerFilter || undefined }));
    }
  }, [dispatch, providerFilter, selectedBrandId]);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchGrowthTrend({ brandId: selectedBrandId, days }));
    }
  }, [dispatch, days, selectedBrandId]);

  useEffect(() => {
    if (selectedBrandId) {
      fetch(`/api/revenue/brand/${selectedBrandId}?days=${revenueDays}`)
        .then((r) => r.json())
        .then(setRevenue)
        .catch(() => null);
    }
  }, [revenueDays, selectedBrandId]);

  const handleSync = () => {
    if (!selectedBrandId) return;
    dispatch(fetchBrandMetrics(selectedBrandId));
    dispatch(fetchGrowthTrend({ brandId: selectedBrandId, days }));
  };

  const summary = brandMetrics?.summary;

  const topPosts = brandMetrics
    ? Object.values(brandMetrics.byProvider)
        .flat()
        .sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0))
        .slice(0, 5)
    : [];

  const providerEntries = brandMetrics
    ? Object.entries(brandMetrics.byProvider).map(([provider, posts]) => {
        const views = posts.reduce((s, p) => s + (p.viewsCount || 0), 0);
        const likes = posts.reduce((s, p) => s + (p.likesCount || 0), 0);
        const avgEng = posts.length > 0
          ? posts.reduce((s, p) => s + (p.engagementRate || 0), 0) / posts.length
          : 0;
        return { provider, posts: posts.length, views, likes, avgEng };
      })
    : [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('analytics_title')}</h1>
              <p className="mt-1 text-gray-500">{t('analytics_desc')}</p>
            </div>
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('analytics_sync')}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('analytics_total_views'), value: fmt(summary?.totalViews), icon: EyeIcon, color: 'from-blue-500 to-cyan-500' },
              { label: t('analytics_total_likes'), value: fmt(summary?.totalLikes), icon: HeartIcon, color: 'from-pink-500 to-rose-500' },
              { label: t('analytics_shares'), value: fmt(summary?.totalShares), icon: ShareIcon, color: 'from-green-500 to-emerald-500' },
              { label: t('analytics_avg_eng'), value: summary?.avgEngagementRate || '–', icon: ArrowTrendingUpIcon, color: 'from-purple-500 to-violet-500' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${card.color} mb-3`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-0.5">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Performance by Provider */}
          {providerEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">{t('analytics_perf_by_network')}</h2>
              <div className="space-y-4">
                {providerEntries.map((entry) => (
                  <div key={entry.provider} className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-24 text-center`}>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${PROVIDER_COLORS[entry.provider] || 'from-gray-400 to-gray-600'} text-white`}>
                        {entry.provider}
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">{t('analytics_posts')}</p>
                        <p className="font-semibold text-gray-900">{entry.posts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('analytics_views')}</p>
                        <p className="font-semibold text-gray-900">{fmt(entry.views)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('analytics_eng')}</p>
                        <p className="font-semibold text-green-600">{entry.avgEng.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${PROVIDER_COLORS[entry.provider] || 'from-gray-400 to-gray-600'} h-2 rounded-full transition-all`}
                          style={{ width: `${Math.min(entry.avgEng * 8, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Follower Growth */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-gray-900">{t('analytics_follower_growth')}</h2>
                </div>
                <div className="flex gap-1">
                  {DAYS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDays(opt.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        days === opt.value
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {growthTrend ? (
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      +{fmt(growthTrend.totalFollowersGained)}
                    </span>
                    <span className="text-sm text-gray-500">{t('analytics_followers_in')} {days} {t('analytics_days')}</span>
                  </div>

                  {growthTrend.accounts.length > 0 ? (
                    <div className="space-y-3">
                      {growthTrend.accounts.map((acc) => (
                        <div key={acc.socialAccountId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${PROVIDER_COLORS[acc.provider] || 'from-gray-400 to-gray-600'} text-white`}>
                            {acc.provider}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-900 font-medium">{fmt(acc.followersEnd)} {t('analytics_followers')}</span>
                              <span className={`font-semibold ${acc.growthRatePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {acc.growthRatePct >= 0 ? '+' : ''}{acc.growthRatePct.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              +{fmt(acc.followersGained)} {t('analytics_gained')} · Eng: {acc.currentEngagementRatePct.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">{t('analytics_no_growth')}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <UserGroupIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">{t('analytics_loading_growth')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Best Posting Times */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-bold text-gray-900">{t('analytics_best_times')}</h2>
                </div>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">{t('analytics_all_networks')}</option>
                  <option value="META">Meta</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>
              </div>

              {bestTimes ? (
                <div className="space-y-5">
                  {bestTimes.totalPostsAnalyzed === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">{t('analytics_no_best_times')}</p>
                  ) : (
                    <>
                      {/* Best Hours */}
                      {bestTimes.bestHours.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            {t('analytics_best_hours')}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {bestTimes.bestHours.map((h) => (
                              <div key={h.hour} className="flex flex-col items-center p-2 bg-orange-50 border border-orange-200 rounded-lg min-w-[56px]">
                                <span className="text-sm font-bold text-orange-700">
                                  {String(h.hour).padStart(2, '0')}:00
                                </span>
                                <span className="text-xs text-orange-500">{h.avgEngagementRate.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best Days */}
                      {bestTimes.bestDays.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            {t('analytics_best_days')}
                          </p>
                          <div className="space-y-2">
                            {bestTimes.bestDays.map((d) => (
                              <div key={d.dayOfWeek} className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700 w-24">{d.dayOfWeek}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
                                    style={{ width: `${Math.min(d.avgEngagementRate * 10, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-orange-600 w-10 text-right">
                                  {d.avgEngagementRate.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        {t('analytics_based_on')} {bestTimes.totalPostsAnalyzed} {t('analytics_posts_analyzed')}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CalendarDaysIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">{t('analytics_loading_times')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Posts */}
          {topPosts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('analytics_top_posts')}</h2>
              </div>
              <div className="space-y-3">
                {topPosts.map((post, idx) => (
                  <div key={post.id || idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-lg font-bold text-gray-300 w-6 text-center">#{idx + 1}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-gradient-to-r ${PROVIDER_COLORS[post.provider] || 'from-gray-400 to-gray-600'} text-white flex-shrink-0`}>
                      {post.provider}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate">
                        Post ID: {post.externalPostId || post.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex gap-6 text-sm flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{t('analytics_views')}</p>
                        <p className="font-semibold">{fmt(post.viewsCount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Likes</p>
                        <p className="font-semibold">{fmt(post.likesCount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{t('analytics_eng')}</p>
                        <p className="font-semibold text-green-600">{(post.engagementRate || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Monetization */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">{t('analytics_revenue')}</h2>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">YouTube + Meta</span>
              </div>
              <div className="flex gap-1">
                {DAYS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRevenueDays(opt.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      revenueDays === opt.value
                        ? 'bg-green-600 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6">
              {revenue ? (
                <div className="space-y-6">
                  {/* Revenue summary cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: t('analytics_revenue_estimated'),
                        value: `$${revenue.totalEstimatedRevenueUsd.toFixed(2)}`,
                        icon: CurrencyDollarIcon,
                        color: 'from-green-500 to-emerald-500',
                      },
                      {
                        label: t('analytics_rpm'),
                        value: `$${revenue.avgRpm.toFixed(2)}`,
                        icon: ArrowTrendingUpIcon,
                        color: 'from-blue-500 to-cyan-500',
                        subtitle: t('analytics_rpm_subtitle'),
                      },
                      {
                        label: t('analytics_monetized_views'),
                        value: fmt(revenue.totalMonetizedViews),
                        icon: EyeIcon,
                        color: 'from-purple-500 to-violet-500',
                      },
                      {
                        label: t('analytics_ad_impressions'),
                        value: fmt(revenue.totalAdImpressions),
                        icon: ChartBarIcon,
                        color: 'from-orange-500 to-red-500',
                      },
                    ].map((card) => (
                      <div key={card.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.color} mb-3`}>
                          <card.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-xl font-bold text-gray-900">{card.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        {card.subtitle && <p className="text-xs text-gray-400">{card.subtitle}</p>}
                      </div>
                    ))}
                  </div>

                  {/* By provider breakdown */}
                  {Object.keys(revenue.byProvider).length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('analytics_by_platform')}</p>
                      <div className="space-y-3">
                        {Object.entries(revenue.byProvider).map(([provider, data]) => (
                          <div key={provider} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${PROVIDER_COLORS[provider] || 'from-gray-400 to-gray-600'} text-white flex-shrink-0`}>
                              {provider}
                            </span>
                            <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-400">{t('analytics_revenue_est')}</p>
                                <p className="font-bold text-green-700">${data.estimatedRevenueUsd.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">{t('analytics_rpm_short')}</p>
                                <p className="font-semibold text-gray-900">${data.rpm.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">{t('analytics_monetized_views_short')}</p>
                                <p className="font-semibold text-gray-900">{fmt(data.monetizedViews)}</p>
                              </div>
                            </div>
                            <div className="w-28">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`bg-gradient-to-r ${PROVIDER_COLORS[provider] || 'from-gray-400 to-gray-600'} h-1.5 rounded-full`}
                                  style={{
                                    width: `${Math.min(
                                      (data.estimatedRevenueUsd / (revenue.totalEstimatedRevenueUsd || 1)) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400">{t('analytics_revenue_disclaimer')}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="text-center">
                    <BanknotesIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">{t('analytics_loading_revenue')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty state if no data at all */}
          {!isLoading && !brandMetrics && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <ChartBarIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('analytics_no_data')}</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">{t('analytics_no_data_desc')}</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
