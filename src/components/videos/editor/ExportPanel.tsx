'use client';

import { ArrowDownTrayIcon, CameraIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ExportPanelProps {
  outputTitle: string;
  onTitleChange: (title: string) => void;
  providerOptimized: string;
  onProviderChange: (provider: string) => void;
  currentTime: number;
  thumbnailAtSeconds: number | null;
  onCaptureThumbnail: (time: number | null) => void;
  onExport: () => void;
  isProcessing: boolean;
  processSuccess: boolean;
  error: string | null;
}

export default function ExportPanel({
  outputTitle,
  onTitleChange,
  providerOptimized,
  onProviderChange,
  currentTime,
  thumbnailAtSeconds,
  onCaptureThumbnail,
  onExport,
  isProcessing,
  processSuccess,
  error,
}: ExportPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span>Exportar</span>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nombre del video</label>
        <input
          type="text"
          value={outputTitle}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Mi video editado"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Provider */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Optimizar para</label>
        <select
          value={providerOptimized}
          onChange={e => onProviderChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="ALL">Todas las plataformas</option>
          <option value="META">Meta (Facebook/Instagram)</option>
          <option value="TIKTOK">TikTok</option>
          <option value="YOUTUBE">YouTube</option>
        </select>
      </div>

      {/* Thumbnail */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
        <div className="text-xs text-gray-600">
          {thumbnailAtSeconds !== null
            ? `Thumbnail: ${Math.floor(thumbnailAtSeconds / 60)}:${Math.floor(thumbnailAtSeconds % 60).toString().padStart(2, '0')}`
            : 'Sin thumbnail personalizado'
          }
        </div>
        <button
          onClick={() => onCaptureThumbnail(thumbnailAtSeconds !== null ? null : currentTime)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <CameraIcon className="h-3 w-3" />
          {thumbnailAtSeconds !== null ? 'Quitar' : 'Capturar'}
        </button>
      </div>

      {/* Status messages */}
      {processSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-700">Video procesado exitosamente</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <XCircleIcon className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={isProcessing || !outputTitle.trim()}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
          isProcessing
            ? 'bg-blue-400 text-white cursor-wait'
            : !outputTitle.trim()
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="h-4 w-4" />
            Exportar Video
          </>
        )}
      </button>

      {isProcessing && (
        <p className="text-xs text-gray-500 text-center">
          El video se está procesando en el servidor. Esto puede tomar unos minutos...
        </p>
      )}
    </div>
  );
}
