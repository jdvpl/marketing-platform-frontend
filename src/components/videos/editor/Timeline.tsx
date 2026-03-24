'use client';

import { useRef, useCallback, useState } from 'react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
  onSeek: (time: number) => void;
}

export default function Timeline({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onTrimStartChange,
  onTrimEndChange,
  onSeek,
}: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const getTimeFromPosition = useCallback((clientX: number) => {
    if (!containerRef.current || duration === 0) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleMouseDown = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const time = getTimeFromPosition(moveEvent.clientX);
      if (handle === 'start') {
        onTrimStartChange(Math.min(time, trimEnd - 0.5));
      } else {
        onTrimEndChange(Math.max(time, trimStart + 0.5));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [getTimeFromPosition, onTrimStartChange, onTrimEndChange, trimStart, trimEnd]);

  const handleBarClick = useCallback((e: React.MouseEvent) => {
    if (dragging) return;
    const time = getTimeFromPosition(e.clientX);
    onSeek(time);
  }, [dragging, getTimeFromPosition, onSeek]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (duration === 0) return null;

  const startPercent = (trimStart / duration) * 100;
  const endPercent = (trimEnd / duration) * 100;
  const playheadPercent = (currentTime / duration) * 100;

  return (
    <div className="w-full">
      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
        <span>{formatTime(trimStart)}</span>
        <span className="font-medium text-gray-700">{formatTime(currentTime)}</span>
        <span>{formatTime(trimEnd)}</span>
      </div>

      {/* Timeline bar */}
      <div
        ref={containerRef}
        className="relative h-10 bg-gray-200 rounded-lg cursor-pointer select-none"
        onClick={handleBarClick}
      >
        {/* Inactive zones */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gray-300/70 rounded-l-lg"
          style={{ width: `${startPercent}%` }}
        />
        <div
          className="absolute top-0 bottom-0 right-0 bg-gray-300/70 rounded-r-lg"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Active zone */}
        <div
          className="absolute top-0 bottom-0 bg-blue-100 border-y-2 border-blue-400"
          style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>

        {/* Start handle */}
        <div
          className={`absolute top-0 bottom-0 w-3 bg-blue-600 rounded-l cursor-ew-resize z-20 hover:bg-blue-700 transition-colors ${
            dragging === 'start' ? 'bg-blue-800' : ''
          }`}
          style={{ left: `calc(${startPercent}% - 6px)` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded" />
        </div>

        {/* End handle */}
        <div
          className={`absolute top-0 bottom-0 w-3 bg-blue-600 rounded-r cursor-ew-resize z-20 hover:bg-blue-700 transition-colors ${
            dragging === 'end' ? 'bg-blue-800' : ''
          }`}
          style={{ left: `calc(${endPercent}% - 6px)` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded" />
        </div>
      </div>

      {/* Duration info */}
      <div className="flex justify-center mt-1">
        <span className="text-xs text-gray-500">
          Duración del clip: {formatTime(trimEnd - trimStart)}
        </span>
      </div>
    </div>
  );
}
