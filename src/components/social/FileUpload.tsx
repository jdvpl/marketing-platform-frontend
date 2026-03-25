'use client';

import { useState, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onUploadComplete: (url: string, type: 'image' | 'video') => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({ onUploadComplete, accept, label = 'Subir archivo' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al subir');

      const type = file.type.startsWith('video/') ? 'video' : 'image';
      onUploadComplete(data.url, type);
    } catch (err: any) {
      setError(err.message || 'Error al subir archivo');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm"
      >
        <CloudArrowUpIcon className="h-5 w-5 text-gray-400" />
        {isUploading ? 'Subiendo...' : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept || 'image/*,video/*'}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
