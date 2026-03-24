'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchBrandHashtags, fetchTrendingHashtags, HashtagPerformance } from '@/features/hashtags/hashtagsSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  HashtagIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  META: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Meta' },
  TIKTOK: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'TikTok' },
  YOUTUBE: { bg: 'bg-red-100', text: 'text-red-700', label: 'YouTube' },
};

const SORT_OPTIONS = [
  { value: 'USAGE', label: 'Más usados' },
  { value: 'ENGAGEMENT', label: 'Mayor engagement' },
  { value: 'RECENT', label: 'Más recientes' },
];

const DAYS_OPTIONS = [
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
];

function fmt(n?: number) {
  if (n === undefined || n === null) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function HashtagCard({ tag, rank }: { tag: HashtagPerformance; rank?: number }) {
  const provider = PROVIDER_BADGES[tag.provider];
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`#${tag.hashtag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {rank !== undefined && (
            <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
              rank <= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {rank}
            </span>
          )}
          <span className="text-sm font-semibold text-blue-600">#{tag.hashtag}</span>
        </div>
        <div className="flex items-center gap-2">
          {provider && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${provider.bg} ${provider.text}`}>
              {provider.label}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copiar hashtag"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
          </button>
          {copied && <span className="text-[10px] text-green-500 font-medium">Copiado</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-gray-500">
          <HashtagIcon className="h-3.5 w-3.5" />
          <span>{tag.usageCount} usos</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <EyeIcon className="h-3.5 w-3.5" />
          <span>{fmt(tag.totalViews)} vistas</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <HeartIcon className="h-3.5 w-3.5" />
          <span>{fmt(tag.totalLikes)} likes</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
          <span>{fmt(tag.totalComments)} comentarios</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <ShareIcon className="h-3.5 w-3.5" />
          <span>{fmt(tag.totalShares)} shares</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-600 font-medium">
          <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
          <span>{tag.avgEngagementRate.toFixed(2)}% eng.</span>
        </div>
      </div>

      {tag.lastUsedAt && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400">
          Último uso: {new Date(tag.lastUsedAt).toLocaleDateString('es')}
        </div>
      )}
    </div>
  );
}

export default function HashtagsPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { hashtags, trending, isLoading } = useAppSelector(s => s.hashtags);

  const [activeTab, setActiveTab] = useState<'all' | 'trending'>('trending');
  const [sortBy, setSortBy] = useState('USAGE');
  const [providerFilter, setProviderFilter] = useState('');
  const [trendingDays, setTrendingDays] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedBrandId) return;
    dispatch(fetchBrandHashtags({
      brandId: selectedBrandId,
      sortBy,
      provider: providerFilter || undefined,
      limit: 50,
    }));
  }, [dispatch, selectedBrandId, sortBy, providerFilter]);

  useEffect(() => {
    if (!selectedBrandId) return;
    dispatch(fetchTrendingHashtags({
      brandId: selectedBrandId,
      days: trendingDays,
      limit: 20,
    }));
  }, [dispatch, selectedBrandId, trendingDays]);

  const displayedHashtags = useMemo(() => {
    const source = activeTab === 'trending' ? trending : hashtags;
    if (!searchTerm) return source;
    return source.filter(h => h.hashtag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeTab, hashtags, trending, searchTerm]);

  // Summary stats
  const stats = useMemo(() => {
    const all = hashtags;
    const uniqueHashtags = new Set(all.map(h => h.hashtag)).size;
    const totalUsage = all.reduce((s, h) => s + h.usageCount, 0);
    const totalViews = all.reduce((s, h) => s + h.totalViews, 0);
    const avgEngagement = all.length > 0
      ? all.reduce((s, h) => s + h.avgEngagementRate, 0) / all.length
      : 0;
    return { uniqueHashtags, totalUsage, totalViews, avgEngagement };
  }, [hashtags]);

  // Top 5 for quick copy
  const top5 = useMemo(() => {
    return [...hashtags].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 5);
  }, [hashtags]);

  const [copiedAll, setCopiedAll] = useState(false);
  const handleCopyTop5 = () => {
    const text = top5.map(h => `#${h.hashtag}`).join(' ');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HashtagIcon className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hashtag Trends</h1>
                <p className="text-sm text-gray-500">Analiza el rendimiento de tus hashtags por plataforma</p>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Hashtags únicos', value: stats.uniqueHashtags, icon: HashtagIcon, color: 'text-blue-600' },
              { label: 'Usos totales', value: stats.totalUsage, icon: FireIcon, color: 'text-orange-500' },
              { label: 'Vistas totales', value: fmt(stats.totalViews), icon: EyeIcon, color: 'text-green-600' },
              { label: 'Eng. promedio', value: `${stats.avgEngagement.toFixed(2)}%`, icon: ArrowTrendingUpIcon, color: 'text-purple-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Top 5 quick copy bar */}
          {top5.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700">Top 5 hashtags (mejor engagement):</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {top5.map(h => (
                      <span key={h.id} className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        #{h.hashtag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCopyTop5}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  {copiedAll ? 'Copiados!' : 'Copiar todos'}
                </button>
              </div>
            </div>
          )}

          {/* Tabs + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'trending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                  Trending
                </span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <HashtagIcon className="h-3.5 w-3.5" />
                  Todos
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <input
                type="text"
                placeholder="Buscar hashtag..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              />

              {/* Provider filter */}
              <div className="flex items-center gap-1">
                <FunnelIcon className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={providerFilter}
                  onChange={e => setProviderFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="META">Meta</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>
              </div>

              {/* Sort (all tab) or Days (trending tab) */}
              {activeTab === 'all' ? (
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={trendingDays}
                  onChange={e => setTrendingDays(Number(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : displayedHashtags.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <HashtagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {searchTerm ? 'No se encontraron hashtags' : 'No hay hashtags aún'}
              </h3>
              <p className="text-xs text-gray-500">
                {searchTerm
                  ? `No hay resultados para "${searchTerm}"`
                  : 'Los hashtags se registran automáticamente cuando publicas contenido con # en tus redes sociales.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedHashtags.map((tag, i) => (
                <HashtagCard
                  key={tag.id}
                  tag={tag}
                  rank={activeTab === 'trending' ? i + 1 : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
