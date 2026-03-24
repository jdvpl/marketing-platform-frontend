'use client';

import { DevicePhoneMobileIcon, ComputerDesktopIcon, Square2StackIcon } from '@heroicons/react/24/outline';

interface AspectRatioPanelProps {
  selectedRatio: string | null;
  onRatioChange: (ratio: string | null) => void;
}

const RATIOS = [
  { value: '9:16', label: 'TikTok / Reels', desc: '1080x1920', icon: DevicePhoneMobileIcon, w: 9, h: 16 },
  { value: '16:9', label: 'YouTube', desc: '1920x1080', icon: ComputerDesktopIcon, w: 16, h: 9 },
  { value: '1:1', label: 'Instagram', desc: '1080x1080', icon: Square2StackIcon, w: 1, h: 1 },
  { value: '4:5', label: 'Feed', desc: '1080x1350', icon: Square2StackIcon, w: 4, h: 5 },
];

export default function AspectRatioPanel({ selectedRatio, onRatioChange }: AspectRatioPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <ComputerDesktopIcon className="h-4 w-4" />
        <span>Formato de Video</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {RATIOS.map(ratio => {
          const isSelected = selectedRatio === ratio.value;
          return (
            <button
              key={ratio.value}
              onClick={() => onRatioChange(isSelected ? null : ratio.value)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {/* Aspect ratio visual */}
              <div
                className={`border-2 rounded ${isSelected ? 'border-blue-500' : 'border-gray-400'}`}
                style={{
                  width: `${Math.min(24, ratio.w * 3)}px`,
                  height: `${Math.min(32, ratio.h * 3)}px`,
                }}
              />
              <div className="text-left">
                <div className="text-xs font-medium">{ratio.value}</div>
                <div className="text-[10px] text-gray-500">{ratio.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Original button */}
      <button
        onClick={() => onRatioChange(null)}
        className={`w-full py-2 text-sm rounded-lg border-2 transition-all ${
          !selectedRatio
            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
            : 'border-gray-200 hover:border-gray-300 text-gray-500'
        }`}
      >
        Original
      </button>
    </div>
  );
}
