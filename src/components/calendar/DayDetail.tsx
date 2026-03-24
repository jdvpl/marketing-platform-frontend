'use client';

import { ScheduledPost } from '@/features/social/socialSlice';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  META: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Meta' },
  TIKTOK: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'TikTok' },
  YOUTUBE: { bg: 'bg-red-100', text: 'text-red-700', label: 'YouTube' },
};

const STATUS_CONFIG: Record<string, { icon: typeof ClockIcon; color: string; label: string }> = {
  SCHEDULED: { icon: ClockIcon, color: 'text-blue-500', label: 'Programado' },
  POSTING: { icon: ArrowPathIcon, color: 'text-yellow-500', label: 'Publicando' },
  POSTED: { icon: CheckCircleIcon, color: 'text-green-500', label: 'Publicado' },
  FAILED: { icon: XCircleIcon, color: 'text-red-500', label: 'Fallido' },
};

interface DayDetailProps {
  date: Date;
  posts: ScheduledPost[];
  onCancel: (postId: string) => void;
}

export default function DayDetail({ date, posts, onCancel }: DayDetailProps) {
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1 capitalize">{formatDate(date)}</h3>
        <p className="text-xs text-gray-400 mt-4 text-center py-6">
          No hay publicaciones programadas para este día.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">{formatDate(date)}</h3>

      <div className="space-y-3">
        {posts.map(post => {
          const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.SCHEDULED;
          const provider = PROVIDER_BADGES[post.provider];
          const StatusIcon = status.icon;

          return (
            <div
              key={post.id}
              className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors"
            >
              {/* Header: time + provider + status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">
                    {formatTime(post.scheduledAt)}
                  </span>
                  {provider && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${provider.bg} ${provider.text}`}>
                      {provider.label}
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1 ${status.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium">{status.label}</span>
                </div>
              </div>

              {/* Content */}
              <p className="text-xs text-gray-700 line-clamp-3 mb-2">{post.content}</p>

              {/* Error message */}
              {post.status === 'FAILED' && post.errorMessage && (
                <p className="text-[10px] text-red-500 bg-red-50 rounded px-2 py-1 mb-2">
                  {post.errorMessage}
                </p>
              )}

              {/* Actions */}
              {post.status === 'SCHEDULED' && (
                <button
                  onClick={() => onCancel(post.id)}
                  className="text-[10px] text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
