'use client';

import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { FilterState } from '@/hooks/useVideoEditor';

interface FiltersPanelProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
}

interface SliderConfig {
  key: keyof FilterState;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
}

const SLIDERS: SliderConfig[] = [
  { key: 'brightness', label: 'Brillo', min: 0, max: 2, step: 0.05, defaultVal: 1 },
  { key: 'contrast', label: 'Contraste', min: 0, max: 2, step: 0.05, defaultVal: 1 },
  { key: 'saturation', label: 'Saturación', min: 0, max: 3, step: 0.05, defaultVal: 1 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 1, step: 0.05, defaultVal: 0 },
  { key: 'blur', label: 'Desenfoque', min: 0, max: 10, step: 0.5, defaultVal: 0 },
];

export default function FiltersPanel({ filters, onFilterChange, onReset }: FiltersPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Filtros</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowPathIcon className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {SLIDERS.map(slider => {
          const value = filters[slider.key] as number;
          const isModified = value !== slider.defaultVal;
          return (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-600">{slider.label}</label>
                <span className={`text-xs font-mono ${isModified ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={value}
                onChange={e => onFilterChange(slider.key, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          );
        })}
      </div>

      {/* Grayscale toggle */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <label className="text-xs text-gray-600">Escala de grises</label>
        <button
          onClick={() => onFilterChange('grayscale', !filters.grayscale)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            filters.grayscale ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              filters.grayscale ? 'translate-x-4.5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
