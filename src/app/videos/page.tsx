'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchVideos, uploadVideo, clearUploadSuccess } from '@/features/videos/videosSlice';
import VideoCard from '@/components/videos/VideoCard';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  FilmIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const PROVIDERS = [
  { value: '', label: 'Todos' },
  { value: 'META', label: 'Meta' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'ALL', label: 'Multi-plataforma' },
];

export default function VideosPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId, selectedCompanyId } = useCompanyBrand();
  const { videos, isLoading, isUploading, error, uploadSuccess } = useAppSelector((s) => s.videos);

  const [providerFilter, setProviderFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    providerOptimized: '',
    durationSeconds: '',
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchVideos({ brandId: selectedBrandId, provider: providerFilter || undefined }));
    }
  }, [dispatch, providerFilter, selectedBrandId]);

  useEffect(() => {
    if (uploadSuccess) {
      setShowUpload(false);
      setUploadForm({ title: '', description: '', tags: '', providerOptimized: '', durationSeconds: '' });
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => dispatch(clearUploadSuccess()), 3000);
    }
  }, [uploadSuccess, dispatch]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadForm.title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('brandId', selectedBrandId!);
    formData.append('companyId', selectedCompanyId!);
    formData.append('title', uploadForm.title);
    if (uploadForm.description) formData.append('description', uploadForm.description);
    if (uploadForm.tags) formData.append('tags', uploadForm.tags);
    if (uploadForm.providerOptimized) formData.append('providerOptimized', uploadForm.providerOptimized);
    if (uploadForm.durationSeconds) formData.append('durationSeconds', uploadForm.durationSeconds);

    dispatch(uploadVideo(formData));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Librería de Videos</h1>
              <p className="mt-1 text-gray-500">
                Gestiona y publica tus videos en todas las redes sociales
              </p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              Subir Video
            </button>
          </div>

          {/* Upload Form */}
          {showUpload && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Subir nuevo video</h2>
                <button onClick={() => setShowUpload(false)}>
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo de video <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/avi,video/webm,video/x-matroska"
                      required
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-400">MP4, MOV, AVI, WebM, MKV — máx. 4GB</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Nombre del video"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Red objetivo
                    </label>
                    <select
                      value={uploadForm.providerOptimized}
                      onChange={(e) => setUploadForm({ ...uploadForm, providerOptimized: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Sin especificar</option>
                      <option value="META">Meta (Facebook/Instagram)</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="YOUTUBE">YouTube</option>
                      <option value="ALL">Todas las redes</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Descripción del video (usada como caption al publicar)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (separados por comas)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="marketing, producto, viral"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duración (segundos)
                    </label>
                    <input
                      type="number"
                      value={uploadForm.durationSeconds}
                      onChange={(e) => setUploadForm({ ...uploadForm, durationSeconds: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="60"
                      min="1"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? 'Subiendo...' : 'Subir Video'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filtrar por red:</span>
            <div className="flex gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProviderFilter(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    providerFilter === p.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-gray-400">{videos.length} video(s)</span>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
              <FilmIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin videos todavía</h3>
              <p className="text-gray-500 mb-6 text-sm">
                Sube tu primer video para publicarlo en todas tus redes sociales
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                Subir Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
