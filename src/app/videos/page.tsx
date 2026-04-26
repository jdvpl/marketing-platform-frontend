'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useTranslation } from '@/hooks/useTranslation';
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

const PROVIDER_KEYS: Array<{ value: string; key: string }> = [
  { value: '', key: 'videos_filter_all' },
  { value: 'META', key: 'videos_filter_meta' },
  { value: 'TIKTOK', key: 'videos_filter_tiktok' },
  { value: 'YOUTUBE', key: 'videos_filter_youtube' },
  { value: 'ALL', key: 'videos_filter_multi' },
];

export default function VideosPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId, selectedCompanyId } = useCompanyBrand();
  const { t } = useTranslation();
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
              <h1 className="text-3xl font-bold text-gray-900">{t('videos_title')}</h1>
              <p className="mt-1 text-gray-500">{t('videos_desc')}</p>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              {t('videos_upload')}
            </button>
          </div>

          {/* Upload Form */}
          {showUpload && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">{t('videos_modal_title')}</h2>
                <button onClick={() => setShowUpload(false)}>
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_file')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/avi,video/webm,video/x-matroska"
                      required
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-400">{t('videos_field_file_info')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_title')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={t('videos_field_title_placeholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_target')}
                    </label>
                    <select
                      value={uploadForm.providerOptimized}
                      onChange={(e) => setUploadForm({ ...uploadForm, providerOptimized: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">{t('videos_target_unspecified')}</option>
                      <option value="META">{t('videos_target_meta')}</option>
                      <option value="TIKTOK">{t('videos_target_tiktok')}</option>
                      <option value="YOUTUBE">{t('videos_target_youtube')}</option>
                      <option value="ALL">{t('videos_target_all')}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_desc')}
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={t('videos_field_desc_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_tags')}
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={t('videos_field_tags_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('videos_field_duration')}
                    </label>
                    <input
                      type="number"
                      value={uploadForm.durationSeconds}
                      onChange={(e) => setUploadForm({ ...uploadForm, durationSeconds: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder={t('videos_field_duration_placeholder')}
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
                    {isUploading ? t('videos_uploading') : t('videos_upload')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('videos_cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{t('videos_filter_label')}</span>
            <div className="flex gap-2">
              {PROVIDER_KEYS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setProviderFilter(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    providerFilter === p.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {t(p.key)}
                </button>
              ))}
            </div>
            <span className="ml-auto text-sm text-gray-400">{videos.length} {t('videos_count_suffix')}</span>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
              <FilmIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('videos_no_videos')}</h3>
              <p className="text-gray-500 mb-6 text-sm">{t('videos_no_videos_desc')}</p>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                {t('videos_upload')}
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
