'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { deleteVideo, Video } from '@/features/videos/videosSlice';
import { repost } from '@/features/metrics/metricsSlice';
import {
  PlayIcon,
  TrashIcon,
  ArrowPathRoundedSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_LABELS: Record<string, string> = {
  META: 'Meta',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  ALL: 'Todas',
};

const PROVIDER_COLORS: Record<string, string> = {
  META: 'bg-blue-100 text-blue-700',
  TIKTOK: 'bg-gray-100 text-gray-800',
  YOUTUBE: 'bg-red-100 text-red-700',
  ALL: 'bg-purple-100 text-purple-700',
};

interface Props {
  video: Video;
}

export default function VideoCard({ video }: Props) {
  const dispatch = useAppDispatch();
  const [showRepost, setShowRepost] = useState(false);
  const [repostTargets, setRepostTargets] = useState<string[]>([]);
  const [repostLoading, setRepostLoading] = useState(false);
  const [repostResult, setRepostResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este video permanentemente?')) return;
    setDeleting(true);
    await dispatch(deleteVideo(video.id));
    setDeleting(false);
  };

  const toggleRepostTarget = (p: string) => {
    setRepostTargets((prev) => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleRepost = async () => {
    if (repostTargets.length === 0) return;
    setRepostLoading(true);
    const result = await dispatch(repost({
      brandId: video.brandId,
      content: video.description || video.title,
      targetProviders: repostTargets,
      videoUrl: video.storageUrl,
      thumbnailUrl: video.thumbnailUrl,
    }));

    if (repost.fulfilled.match(result)) {
      const r = result.payload;
      setRepostResult({
        success: r.successCount > 0,
        message: `${r.successCount}/${r.totalProviders} publicados exitosamente`,
      });
    } else {
      setRepostResult({ success: false, message: 'Error al republicar' });
    }
    setRepostLoading(false);
    setTimeout(() => { setRepostResult(null); setShowRepost(false); setRepostTargets([]); }, 4000);
  };

  const PROVIDERS = ['META', 'TIKTOK', 'YOUTUBE'].filter(
    (p) => p !== video.providerOptimized || video.providerOptimized === 'ALL'
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <PlayIcon className="h-12 w-12 text-gray-500" />
        )}
        {video.durationSeconds && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
        {video.providerOptimized && (
          <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded ${PROVIDER_COLORS[video.providerOptimized] || 'bg-gray-100'}`}>
            {PROVIDER_LABELS[video.providerOptimized]}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{video.title}</h3>
        {video.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{video.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {video.format && <span className="uppercase font-medium">{video.format}</span>}
          {video.fileSizeBytes && <span>{formatSize(video.fileSizeBytes)}</span>}
          {video.width && video.height && <span>{video.width}×{video.height}</span>}
        </div>
        {video.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.split(',').slice(0, 4).map((tag) => (
              <span key={tag.trim()} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => { setShowRepost(!showRepost); setRepostResult(null); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ArrowPathRoundedSquareIcon className="h-4 w-4" />
            Publicar en otra red
          </button>
          <a
            href={video.storageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Repost panel */}
        {showRepost && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {repostResult ? (
              <div className={`flex items-center gap-2 text-sm ${repostResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {repostResult.success
                  ? <CheckCircleIcon className="h-5 w-5" />
                  : <XCircleIcon className="h-5 w-5" />}
                {repostResult.message}
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-gray-700 mb-2">¿A qué redes publicar?</p>
                <div className="flex gap-2 mb-3">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleRepostTarget(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        repostTargets.includes(p)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRepost}
                  disabled={repostLoading || repostTargets.length === 0}
                  className="w-full py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {repostLoading ? 'Publicando...' : 'Publicar ahora'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
