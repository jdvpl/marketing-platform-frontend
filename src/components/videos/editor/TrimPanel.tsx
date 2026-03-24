'use client';

import { ScissorsIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TrimPanelProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  currentTime: number;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
}

export default function TrimPanel({
  trimStart,
  trimEnd,
  duration,
  currentTime,
  onTrimStartChange,
  onTrimEndChange,
}: TrimPanelProps) {
  const formatTimeInput = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const parseTimeInput = (value: string): number => {
    const parts = value.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseFloat(value) || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <ScissorsIcon className="h-4 w-4" />
        <span>Recortar Video</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Start time */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Inicio</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={formatTimeInput(trimStart)}
              onChange={e => {
                const time = parseTimeInput(e.target.value);
                if (time >= 0 && time < trimEnd) onTrimStartChange(time);
              }}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => onTrimStartChange(currentTime)}
              className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Usar tiempo actual"
            >
              <ClockIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* End time */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fin</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={formatTimeInput(trimEnd)}
              onChange={e => {
                const time = parseTimeInput(e.target.value);
                if (time > trimStart && time <= duration) onTrimEndChange(time);
              }}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => onTrimEndChange(currentTime)}
              className="px-2 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Usar tiempo actual"
            >
              <ClockIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Clip info */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
        <span>Duración original: {formatTimeInput(duration)}</span>
        <span className="font-medium text-blue-600">
          Clip: {formatTimeInput(Math.max(0, trimEnd - trimStart))}
        </span>
      </div>
    </div>
  );
}
