'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { crossPost, clearCrossPostResult } from '@/features/metrics/metricsSlice';
import {
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const PROVIDERS = [
  { id: 'META', label: 'Meta (Facebook/Instagram)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'TIKTOK', label: 'TikTok', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { id: 'YOUTUBE', label: 'YouTube', color: 'bg-red-100 text-red-800 border-red-300' },
];

interface Props {
  brandId: string;
  onSuccess?: () => void;
}

export default function CrossPostForm({ brandId, onSuccess }: Props) {
  const dispatch = useAppDispatch();
  const { isCrossPosting, crossPostResult, error } = useAppSelector((s) => s.metrics);

  const [content, setContent] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [publishAll, setPublishAll] = useState(true);

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const result = await dispatch(crossPost({
      brandId,
      content: content.trim(),
      providers: publishAll ? [] : selectedProviders,
    }));

    if (crossPost.fulfilled.match(result)) {
      setContent('');
      setSelectedProviders([]);
      if (onSuccess) onSuccess();
      setTimeout(() => dispatch(clearCrossPostResult()), 8000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <GlobeAltIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Publicar en todas las redes</h2>
          <p className="text-sm text-gray-500">Un solo post, todas tus redes simultáneamente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            placeholder="Escribe tu publicación aquí..."
            required
          />
          <p className="mt-1 text-xs text-gray-400">{content.length} caracteres</p>
        </div>

        {/* Target Networks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Redes destino</label>

          <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-500 bg-blue-50 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={publishAll}
              onChange={(e) => {
                setPublishAll(e.target.checked);
                if (e.target.checked) setSelectedProviders([]);
              }}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <GlobeAltIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Todas las redes conectadas</span>
          </label>

          {!publishAll && (
            <div className="space-y-2">
              {PROVIDERS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProviders.includes(p.id)
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(p.id)}
                    onChange={() => toggleProvider(p.id)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${p.color}`}>
                    {p.id}
                  </span>
                  <span className="text-sm text-gray-700">{p.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {crossPostResult && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Resultado del cross-post</span>
              <span className="text-xs text-gray-500">
                {crossPostResult.successCount}/{crossPostResult.totalProviders} exitosos
              </span>
            </div>
            {crossPostResult.results.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                {r.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  r.provider === 'META' ? 'bg-blue-100 text-blue-700' :
                  r.provider === 'TIKTOK' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>{r.provider}</span>
                <span className="text-sm text-gray-700">
                  {r.success ? 'Publicado exitosamente' : r.error?.message || 'Error'}
                </span>
                {r.postUrl && (
                  <a href={r.postUrl} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-blue-600 hover:underline ml-auto">
                    Ver →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isCrossPosting || !content.trim() || (!publishAll && selectedProviders.length === 0)}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCrossPosting
            ? 'Publicando en todas las redes...'
            : publishAll
            ? 'Publicar en todas las redes'
            : `Publicar en ${selectedProviders.length} red(es) seleccionada(s)`}
        </button>
      </form>
    </div>
  );
}
