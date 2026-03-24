'use client';

import { PlusIcon, TrashIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { TextOverlayState } from '@/hooks/useVideoEditor';

interface TextOverlayPanelProps {
  overlays: TextOverlayState[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<TextOverlayState>) => void;
  onRemove: (id: string) => void;
  duration: number;
}

export default function TextOverlayPanel({ overlays, onAdd, onUpdate, onRemove, duration }: TextOverlayPanelProps) {
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <ChatBubbleLeftIcon className="h-4 w-4" />
          <span>Texto</span>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
        >
          <PlusIcon className="h-3 w-3" />
          Agregar
        </button>
      </div>

      {overlays.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          No hay textos. Agrega uno para sobreponer en el video.
        </p>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {overlays.map((overlay, index) => (
          <div key={overlay.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Texto #{index + 1}</span>
              <button
                onClick={() => onRemove(overlay.id)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Text content */}
            <input
              type="text"
              value={overlay.text}
              onChange={e => onUpdate(overlay.id, { text: e.target.value })}
              placeholder="Escribe tu texto..."
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Position + Size + Color */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Posición</label>
                <select
                  value={overlay.position}
                  onChange={e => onUpdate(overlay.id, { position: e.target.value as 'top' | 'center' | 'bottom' })}
                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md"
                >
                  <option value="top">Arriba</option>
                  <option value="center">Centro</option>
                  <option value="bottom">Abajo</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Tamaño</label>
                <input
                  type="number"
                  value={overlay.fontSize}
                  onChange={e => onUpdate(overlay.id, { fontSize: parseInt(e.target.value) || 48 })}
                  min={12}
                  max={200}
                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Color</label>
                <input
                  type="color"
                  value={overlay.fontColor}
                  onChange={e => onUpdate(overlay.id, { fontColor: e.target.value })}
                  className="w-full h-7 rounded-md cursor-pointer border border-gray-300"
                />
              </div>
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Desde (seg)</label>
                <input
                  type="number"
                  value={overlay.showFromSeconds}
                  onChange={e => onUpdate(overlay.id, { showFromSeconds: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Hasta (seg)</label>
                <input
                  type="number"
                  value={overlay.showToSeconds}
                  onChange={e => onUpdate(overlay.id, { showToSeconds: parseFloat(e.target.value) || 0 })}
                  min={0}
                  max={duration}
                  step={0.1}
                  className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="text-[10px] text-gray-400">
              Visible: {formatTime(overlay.showFromSeconds)} - {formatTime(overlay.showToSeconds)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
