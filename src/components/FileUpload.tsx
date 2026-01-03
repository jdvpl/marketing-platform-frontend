'use client';

import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { uploadFile, clearUpload } from '@/features/upload/uploadSlice';

interface FileUploadProps {
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({
  folder = '',
  accept = 'image/*,video/*,.pdf,.doc,.docx',
  maxSize = 10,
  onUploadSuccess,
  onUploadError,
}: FileUploadProps) {
  const dispatch = useAppDispatch();
  const { isUploading, uploadedUrl, error } = useAppSelector((state) => state.upload);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `El archivo es muy grande. Tamaño máximo: ${maxSize}MB`;
      if (onUploadError) onUploadError(errorMsg);
      alert(errorMsg);
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Upload file
    try {
      const result = await dispatch(uploadFile({ file, folder })).unwrap();
      if (onUploadSuccess) {
        onUploadSuccess(result.url);
      }
    } catch (err: any) {
      if (onUploadError) {
        onUploadError(err);
      }
    }
  };

  const handleClear = () => {
    dispatch(clearUpload());
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          {preview ? (
            <div className="relative w-full h-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-gray-500">Subiendo archivo...</p>
            </div>
          ) : uploadedUrl ? (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600 font-medium">Archivo subido exitosamente</p>
              <button
                type="button"
                onClick={handleClear}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Subir otro archivo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">
                Imágenes, videos, PDFs o documentos (máx. {maxSize}MB)
              </p>
            </div>
          )}
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {uploadedUrl && (
        <div className="mt-2 p-3 bg-gray-100 rounded">
          <p className="text-xs text-gray-600 mb-1">URL del archivo:</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 break-all"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
