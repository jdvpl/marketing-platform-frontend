'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  fetchVideoSubtitles,
  createSubtitle,
  burnSubtitles,
  VideoSubtitle,
} from '@/features/videos/videosSlice';

const LANGUAGES = [
  { value: 'es', label: 'Espanol' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Portugues' },
  { value: 'fr', label: 'Francais' },
];

const FORMATS = [
  { value: 'SRT', label: 'SRT' },
  { value: 'VTT', label: 'VTT' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  GENERATING: 'bg-blue-100 text-blue-800',
  READY: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  GENERATING: 'Generando',
  READY: 'Listo',
  FAILED: 'Error',
};

const LANGUAGE_LABELS: Record<string, string> = {
  es: 'Espanol',
  en: 'English',
  pt: 'Portugues',
  fr: 'Francais',
};

const SRT_EXAMPLE = `1
00:00:00,000 --> 00:00:03,000
Primer linea de subtitulo

2
00:00:03,500 --> 00:00:06,000
Segunda linea de subtitulo`;

interface SubtitlesManagerProps {
  videoId: string;
  brandId: string;
}

export default function SubtitlesManager({ videoId, brandId }: SubtitlesManagerProps) {
  const dispatch = useAppDispatch();
  const { subtitles, isLoadingSubtitles, error } = useAppSelector((s) => s.videos);

  const [showForm, setShowForm] = useState(false);
  const [language, setLanguage] = useState('es');
  const [format, setFormat] = useState('SRT');
  const [subtitleContent, setSubtitleContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [burningId, setBurningId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoSubtitles(videoId));
    }
  }, [videoId, dispatch]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.srt', '.vtt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setLocalError('Solo se permiten archivos .srt o .vtt');
      return;
    }

    // Auto-detect format from extension
    if (ext === '.srt') setFormat('SRT');
    if (ext === '.vtt') setFormat('VTT');

    const reader = new FileReader();
    reader.onload = (event) => {
      setSubtitleContent(event.target?.result as string);
      setLocalError(null);
    };
    reader.readAsText(file);
  };

  const handleCreate = async () => {
    if (!subtitleContent.trim()) {
      setLocalError('El contenido de subtitulos es requerido');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await dispatch(
        createSubtitle({
          videoId,
          brandId,
          language,
          subtitleContent,
          format,
        })
      ).unwrap();

      setShowForm(false);
      setSubtitleContent('');
      setLanguage('es');
      setFormat('SRT');
      setSuccessMsg('Subtitulos creados exitosamente');
      setTimeout(() => setSuccessMsg(null), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setLocalError(err || 'Error al crear subtitulos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBurn = async (subtitleId: string) => {
    setBurningId(subtitleId);
    setLocalError(null);

    try {
      await dispatch(burnSubtitles({ videoId, subtitleId })).unwrap();
      setSuccessMsg('Subtitulos enviados a quemar en el video. El proceso puede tardar unos minutos.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setLocalError(err || 'Error al quemar subtitulos');
    } finally {
      setBurningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Subtitulos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Agregar Subtitulos'}
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Error message */}
      {(localError || error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{localError || error}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Formato
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FORMATS.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subir archivo .srt / .vtt
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              O pegar contenido de subtitulos
            </label>
            <textarea
              value={subtitleContent}
              onChange={(e) => setSubtitleContent(e.target.value)}
              rows={6}
              placeholder={SRT_EXAMPLE}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          {/* SRT format help */}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700 font-medium">
              Ejemplo de formato SRT
            </summary>
            <pre className="mt-2 bg-white border border-gray-200 rounded-lg p-3 font-mono text-xs whitespace-pre-wrap">
              {SRT_EXAMPLE}
            </pre>
          </details>

          <button
            onClick={handleCreate}
            disabled={isSubmitting || !subtitleContent.trim()}
            className="w-full py-2 px-4 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Creando...
              </span>
            ) : (
              'Crear Subtitulos'
            )}
          </button>
        </div>
      )}

      {/* Subtitles list */}
      {isLoadingSubtitles ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : subtitles.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No hay subtitulos para este video</p>
          <p className="text-xs text-gray-400 mt-1">
            Agrega subtitulos para mejorar la accesibilidad de tu contenido
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {subtitles.map((sub: VideoSubtitle) => (
            <div
              key={sub.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {LANGUAGE_LABELS[sub.language] || sub.language}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {sub.format}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[sub.status] || sub.status}
                    </span>
                    {sub.generatedBy && (
                      <span className="text-xs text-gray-400">
                        {sub.generatedBy === 'AI'
                          ? 'Generado por IA'
                          : sub.generatedBy === 'MANUAL'
                          ? 'Manual'
                          : 'Subido'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sub.status === 'READY' && (
                  <button
                    onClick={() => handleBurn(sub.id)}
                    disabled={burningId === sub.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                  >
                    {burningId === sub.id ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full" />
                        Procesando...
                      </span>
                    ) : (
                      'Quemar en Video'
                    )}
                  </button>
                )}
                {sub.subtitleUrl && (
                  <a
                    href={sub.subtitleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Descargar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
