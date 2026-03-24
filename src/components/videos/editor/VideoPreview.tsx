'use client';

import { useEffect, useCallback, RefObject } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { TextOverlayState } from '@/hooks/useVideoEditor';

interface VideoPreviewProps {
  videoUrl: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  cssFilter: string;
  aspectRatioStyle: React.CSSProperties;
  textOverlays: TextOverlayState[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationLoaded: (duration: number) => void;
  trimStart: number;
  trimEnd: number;
}

export default function VideoPreview({
  videoUrl,
  videoRef,
  cssFilter,
  aspectRatioStyle,
  textOverlays,
  currentTime,
  onTimeUpdate,
  onDurationLoaded,
  trimStart,
  trimEnd,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    onTimeUpdate(time);

    // Enforce trim bounds
    if (trimEnd > 0 && time >= trimEnd) {
      videoRef.current.pause();
      videoRef.current.currentTime = trimStart;
      setIsPlaying(false);
    }
  }, [videoRef, onTimeUpdate, trimStart, trimEnd]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    onDurationLoaded(dur);
  }, [videoRef, onDurationLoaded]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (videoRef.current.currentTime < trimStart || (trimEnd > 0 && videoRef.current.currentTime >= trimEnd)) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [videoRef, isPlaying, trimStart, trimEnd]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [videoRef, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => setIsPlaying(false);
    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [videoRef]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getOverlayPosition = (position: string) => {
    switch (position) {
      case 'top': return 'top-4';
      case 'bottom': return 'bottom-4';
      default: return 'top-1/2 -translate-y-1/2';
    }
  };

  const visibleOverlays = textOverlays.filter(o => {
    if (o.showFromSeconds !== undefined && o.showToSeconds !== undefined) {
      return currentTime >= o.showFromSeconds && currentTime <= o.showToSeconds;
    }
    return true;
  });

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Video container */}
      <div
        className="relative bg-black rounded-lg overflow-hidden w-full max-w-2xl"
        style={aspectRatioStyle}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          style={{ filter: cssFilter }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
        />

        {/* Text overlays */}
        {visibleOverlays.map(overlay => (
          <div
            key={overlay.id}
            className={`absolute left-0 right-0 flex justify-center ${getOverlayPosition(overlay.position)}`}
          >
            <span
              style={{
                fontSize: `${overlay.fontSize}px`,
                color: overlay.fontColor,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                fontWeight: 'bold',
              }}
            >
              {overlay.text}
            </span>
          </div>
        ))}

        {/* Play button overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          >
            <PlayIcon className="h-16 w-16 text-white/80" />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full max-w-2xl px-2">
        <button onClick={togglePlay} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          {isPlaying ? <PauseIcon className="h-5 w-5 text-gray-700" /> : <PlayIcon className="h-5 w-5 text-gray-700" />}
        </button>

        <span className="text-sm text-gray-600 font-mono min-w-[80px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>

        <button onClick={toggleMute} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          {isMuted ? <SpeakerXMarkIcon className="h-5 w-5 text-gray-700" /> : <SpeakerWaveIcon className="h-5 w-5 text-gray-700" />}
        </button>
      </div>
    </div>
  );
}
