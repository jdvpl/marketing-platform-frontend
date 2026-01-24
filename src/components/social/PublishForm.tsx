'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { publishContent, clearPublishSuccess } from '@/features/social/socialSlice';
import FileUpload from './FileUpload';

interface PublishFormProps {
  brandId: string;
  onSuccess?: () => void;
}

export default function PublishForm({ brandId, onSuccess }: PublishFormProps) {
  const dispatch = useAppDispatch();
  const { isPublishing, error, publishSuccess } = useAppSelector((state) => state.social);

  const [content, setContent] = useState('');
  const [provider, setProvider] = useState<'META' | 'TIKTOK' | 'YOUTUBE'>('META');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const publishData = {
      brandId,
      provider,
      content: content.trim(),
      ...(mediaUrls.length > 0 && { mediaUrls }),
      ...(videoUrl && { videoUrl }),
      ...(thumbnailUrl && { thumbnailUrl }),
    };

    const result = await dispatch(publishContent(publishData));

    if (publishContent.fulfilled.match(result)) {
      setContent('');
      setMediaUrls([]);
      setVideoUrl(null);
      setThumbnailUrl(null);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        dispatch(clearPublishSuccess());
      }, 5000);
    }
  };

  const handleFileUpload = (url: string, type: 'image' | 'video') => {
    if (type === 'video') {
      setVideoUrl(url);
      setMediaUrls([]);
    } else {
      setMediaUrls([...mediaUrls, url]);
      setVideoUrl(null);
    }
  };

  const handleThumbnailUpload = (url: string) => {
    setThumbnailUrl(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Publicar Contenido</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Red Social
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="META">Meta (Facebook/Instagram)</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu mensaje aquí..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {content.length} caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media
          </label>
          <FileUpload
            onUploadComplete={handleFileUpload}
            label={videoUrl ? 'Video añadido ✓' : 'Subir imagen o video'}
          />
          {mediaUrls.length > 0 && (
            <p className="mt-2 text-sm text-green-600">
              {mediaUrls.length} imagen(es) añadida(s)
            </p>
          )}
        </div>

        {(provider === 'YOUTUBE' && videoUrl) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miniatura (opcional)
            </label>
            <FileUpload
              onUploadComplete={(url) => handleThumbnailUpload(url)}
              accept="image/*"
              label={thumbnailUrl ? 'Miniatura añadida ✓' : 'Subir miniatura'}
            />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {publishSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">
              ✓ Publicado exitosamente
            </p>
            {publishSuccess.postUrl && (
              <a
                href={publishSuccess.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                Ver publicación →
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isPublishing || !content.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isPublishing ? 'Publicando...' : 'Publicar Ahora'}
        </button>
      </form>
    </div>
  );
}
