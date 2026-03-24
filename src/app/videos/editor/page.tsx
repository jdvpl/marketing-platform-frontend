'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import {
  fetchVideoById,
  processVideo,
  clearProcessSuccess,
  clearError,
} from '@/features/videos/videosSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoPreview from '@/components/videos/editor/VideoPreview';
import Timeline from '@/components/videos/editor/Timeline';
import TrimPanel from '@/components/videos/editor/TrimPanel';
import AspectRatioPanel from '@/components/videos/editor/AspectRatioPanel';
import FiltersPanel from '@/components/videos/editor/FiltersPanel';
import TextOverlayPanel from '@/components/videos/editor/TextOverlayPanel';
import ExportPanel from '@/components/videos/editor/ExportPanel';
import {
  ArrowLeftIcon,
  ScissorsIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftIcon,
  ArrowDownTrayIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import SubtitlesManager from '@/components/videos/SubtitlesManager';

const TABS = [
  { id: 'trim', label: 'Recortar', icon: ScissorsIcon },
  { id: 'ratio', label: 'Formato', icon: ComputerDesktopIcon },
  { id: 'filters', label: 'Filtros', icon: AdjustmentsHorizontalIcon },
  { id: 'text', label: 'Texto', icon: ChatBubbleLeftIcon },
  { id: 'subtitles', label: 'Subtitulos', icon: LanguageIcon },
  { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon },
];

function VideoEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const videoId = searchParams.get('videoId');
  const { selectedBrandId, selectedCompanyId } = useCompanyBrand();
  const { videos, isProcessing, processSuccess, processingVideoId, error } = useAppSelector(s => s.videos);

  const [activeTab, setActiveTab] = useState('trim');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const video = videos.find(v => v.id === videoId);

  const editor = useVideoEditor(duration);

  // Load video data
  useEffect(() => {
    if (videoId && !video) {
      dispatch(fetchVideoById(videoId));
    }
  }, [videoId, video, dispatch]);

  // Set initial title from video
  useEffect(() => {
    if (video && !editor.outputTitle) {
      editor.setOutputTitle(`${video.title} (editado)`);
    }
  }, [video, editor]);

  // Poll for processing status
  useEffect(() => {
    if (processingVideoId) {
      pollingRef.current = setInterval(() => {
        dispatch(fetchVideoById(processingVideoId));
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [processingVideoId, dispatch]);

  // Stop polling on success/failure
  useEffect(() => {
    if (processSuccess || (!processingVideoId && pollingRef.current)) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [processSuccess, processingVideoId]);

  // Redirect after success
  useEffect(() => {
    if (processSuccess) {
      const timeout = setTimeout(() => {
        dispatch(clearProcessSuccess());
        router.push('/videos');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [processSuccess, dispatch, router]);

  const handleDurationLoaded = useCallback((dur: number) => {
    setDuration(dur);
    editor.updateTrimEnd(dur);
    setVideoLoaded(true);
  }, [editor]);

  const handleSeek = useCallback((time: number) => {
    if (editor.videoRef.current) {
      editor.videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [editor.videoRef]);

  const handleExport = useCallback(() => {
    if (!videoId || !selectedBrandId || !selectedCompanyId) return;
    dispatch(clearError());
    const params = editor.assembleProcessParams(selectedBrandId, selectedCompanyId);
    dispatch(processVideo({ videoId, params }));
  }, [dispatch, videoId, selectedBrandId, selectedCompanyId, editor]);

  if (!videoId) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">No se especificó un video para editar.</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/videos"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editor de Video</h1>
                {video && (
                  <p className="text-sm text-gray-500 truncate max-w-md">{video.title}</p>
                )}
              </div>
            </div>
          </div>

          {!video ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Video Preview + Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <VideoPreview
                  videoUrl={video.storageUrl}
                  videoRef={editor.videoRef}
                  cssFilter={editor.getCssFilterString()}
                  aspectRatioStyle={editor.getAspectRatioStyle()}
                  textOverlays={editor.textOverlays}
                  currentTime={currentTime}
                  onTimeUpdate={setCurrentTime}
                  onDurationLoaded={handleDurationLoaded}
                  trimStart={editor.trimStart}
                  trimEnd={editor.trimEnd}
                />

                {videoLoaded && (
                  <Timeline
                    duration={duration}
                    currentTime={currentTime}
                    trimStart={editor.trimStart}
                    trimEnd={editor.trimEnd}
                    onTrimStartChange={editor.setTrimStart}
                    onTrimEndChange={editor.setTrimEnd}
                    onSeek={handleSeek}
                  />
                )}
              </div>

              {/* Right: Editing panels */}
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Panel content */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  {activeTab === 'trim' && (
                    <TrimPanel
                      trimStart={editor.trimStart}
                      trimEnd={editor.trimEnd}
                      duration={duration}
                      currentTime={currentTime}
                      onTrimStartChange={editor.setTrimStart}
                      onTrimEndChange={editor.setTrimEnd}
                    />
                  )}

                  {activeTab === 'ratio' && (
                    <AspectRatioPanel
                      selectedRatio={editor.aspectRatio}
                      onRatioChange={editor.setAspectRatio}
                    />
                  )}

                  {activeTab === 'filters' && (
                    <FiltersPanel
                      filters={editor.filters}
                      onFilterChange={editor.updateFilter}
                      onReset={editor.resetFilters}
                    />
                  )}

                  {activeTab === 'text' && (
                    <TextOverlayPanel
                      overlays={editor.textOverlays}
                      onAdd={editor.addTextOverlay}
                      onUpdate={editor.updateTextOverlay}
                      onRemove={editor.removeTextOverlay}
                      duration={duration}
                    />
                  )}

                  {activeTab === 'subtitles' && videoId && selectedBrandId && (
                    <SubtitlesManager videoId={videoId} brandId={selectedBrandId} />
                  )}

                  {activeTab === 'export' && (
                    <ExportPanel
                      outputTitle={editor.outputTitle}
                      onTitleChange={editor.setOutputTitle}
                      providerOptimized={editor.providerOptimized}
                      onProviderChange={editor.setProviderOptimized}
                      currentTime={currentTime}
                      thumbnailAtSeconds={editor.thumbnailAtSeconds}
                      onCaptureThumbnail={editor.setThumbnailAtSeconds}
                      onExport={handleExport}
                      isProcessing={isProcessing || !!processingVideoId}
                      processSuccess={processSuccess}
                      error={error}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function VideoEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <VideoEditorContent />
    </Suspense>
  );
}
