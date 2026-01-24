'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface FileUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = 'image/*,video/*',
  maxSizeMB = 10,
  label = 'Subir archivo',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`El archivo debe ser menor a ${maxSizeMB}MB`);
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'social-media');

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir archivo');
      }

      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      onUploadComplete(data.url, fileType);
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Subiendo...' : label}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Eliminar
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {preview && (
        <div className="mt-3">
          {preview.startsWith('data:video/') ? (
            <video src={preview} controls className="max-w-xs rounded-md" />
          ) : (
            <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
          )}
        </div>
      )}
    </div>
  );
}
