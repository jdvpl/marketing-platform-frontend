'use client';

import { useState, useCallback, useRef } from 'react';
import { VideoProcessParams, TextOverlayParams } from '@/features/videos/videosSlice';

export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  sepia: number;
  blur: number;
}

export interface TextOverlayState extends TextOverlayParams {
  id: string;
}

export interface EditorState {
  trimStart: number;
  trimEnd: number;
  aspectRatio: string | null;
  filters: FilterState;
  textOverlays: TextOverlayState[];
  outputTitle: string;
  providerOptimized: string;
  thumbnailAtSeconds: number | null;
}

const DEFAULT_FILTERS: FilterState = {
  brightness: 1.0,
  contrast: 1.0,
  saturation: 1.0,
  grayscale: false,
  sepia: 0,
  blur: 0,
};

export function useVideoEditor(videoDuration: number = 0) {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(videoDuration);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [textOverlays, setTextOverlays] = useState<TextOverlayState[]>([]);
  const [outputTitle, setOutputTitle] = useState('');
  const [providerOptimized, setProviderOptimized] = useState('ALL');
  const [thumbnailAtSeconds, setThumbnailAtSeconds] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const updateTrimEnd = useCallback((duration: number) => {
    setTrimEnd(prev => prev === 0 ? duration : prev);
  }, []);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const addTextOverlay = useCallback(() => {
    const newOverlay: TextOverlayState = {
      id: crypto.randomUUID(),
      text: 'Nuevo texto',
      position: 'center',
      fontSize: 48,
      fontColor: '#FFFFFF',
      showFromSeconds: trimStart,
      showToSeconds: trimEnd || videoDuration,
    };
    setTextOverlays(prev => [...prev, newOverlay]);
  }, [trimStart, trimEnd, videoDuration]);

  const updateTextOverlay = useCallback((id: string, updates: Partial<TextOverlayState>) => {
    setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  const removeTextOverlay = useCallback((id: string) => {
    setTextOverlays(prev => prev.filter(o => o.id !== id));
  }, []);

  const getCssFilterString = useCallback(() => {
    const parts: string[] = [];
    if (filters.brightness !== 1.0) parts.push(`brightness(${filters.brightness})`);
    if (filters.contrast !== 1.0) parts.push(`contrast(${filters.contrast})`);
    if (filters.saturation !== 1.0) parts.push(`saturate(${filters.saturation})`);
    if (filters.grayscale) parts.push('grayscale(1)');
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia})`);
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
    return parts.length > 0 ? parts.join(' ') : 'none';
  }, [filters]);

  const getAspectRatioStyle = useCallback(() => {
    if (!aspectRatio) return {};
    const [w, h] = aspectRatio.split(':').map(Number);
    return { aspectRatio: `${w}/${h}` };
  }, [aspectRatio]);

  const assembleProcessParams = useCallback((brandId: string, companyId: string): VideoProcessParams => {
    const params: VideoProcessParams = {
      brandId,
      companyId,
      title: outputTitle || 'Video editado',
      providerOptimized,
    };

    if (trimStart > 0) params.trimStartSeconds = trimStart;
    if (trimEnd > 0 && trimEnd < videoDuration) params.trimEndSeconds = trimEnd;
    if (aspectRatio) params.aspectRatio = aspectRatio;

    if (filters.brightness !== 1.0) params.brightness = filters.brightness;
    if (filters.contrast !== 1.0) params.contrast = filters.contrast;
    if (filters.saturation !== 1.0) params.saturation = filters.saturation;
    if (filters.grayscale) params.grayscale = true;
    if (filters.sepia > 0) params.sepia = filters.sepia;
    if (filters.blur > 0) params.blur = filters.blur;

    if (textOverlays.length > 0) {
      params.textOverlays = textOverlays.map(({ id, ...rest }) => rest);
    }

    if (thumbnailAtSeconds !== null) params.thumbnailAtSeconds = thumbnailAtSeconds;

    return params;
  }, [trimStart, trimEnd, aspectRatio, filters, textOverlays, outputTitle, providerOptimized, thumbnailAtSeconds, videoDuration]);

  return {
    // Trim
    trimStart, setTrimStart,
    trimEnd, setTrimEnd, updateTrimEnd,
    // Aspect ratio
    aspectRatio, setAspectRatio,
    // Filters
    filters, updateFilter, resetFilters, getCssFilterString,
    // Text overlays
    textOverlays, addTextOverlay, updateTextOverlay, removeTextOverlay,
    // Output
    outputTitle, setOutputTitle,
    providerOptimized, setProviderOptimized,
    thumbnailAtSeconds, setThumbnailAtSeconds,
    // Helpers
    getAspectRatioStyle,
    assembleProcessParams,
    videoRef,
  };
}
