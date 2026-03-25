'use client';

import { useState, useEffect, useRef } from 'react';
import { SparklesIcon, PhotoIcon, DocumentTextIcon, VideoCameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';

type TabType = 'text' | 'image' | 'video';

export default function ContentAIPage() {
  const { selectedBrandId } = useCompanyBrand();
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [videoJobId, setVideoJobId] = useState<string>('');
  const [videoStatus, setVideoStatus] = useState<string>('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Text form
  const [textPrompt, setTextPrompt] = useState('');
  const [contentType, setContentType] = useState('social-post');
  const [tone, setTone] = useState('casual');
  const [language, setLanguage] = useState('es');

  // Image form
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');

  // Video form
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoStyle, setVideoStyle] = useState('cinematic');

  const { toast, showToast, hideToast } = useToast();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleGenerateText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          prompt: textPrompt,
          contentType,
          tone,
          language,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          pollJobResult(data.id, 'text');
        } else {
          setGeneratedContent(data.resultText || data.content || '');
          setIsGenerating(false);
        }
      } else {
        showToast(data.error || 'Error al generar contenido');
        setIsGenerating(false);
      }
    } catch {
      showToast('Error de conexión');
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedImage('');

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          prompt: imagePrompt,
          style: imageStyle,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          pollJobResult(data.id, 'image');
        } else {
          setGeneratedImage(data.resultUrl || data.imageUrl || '');
          setIsGenerating(false);
        }
      } else {
        showToast(data.error || 'Error al generar imagen');
        setIsGenerating(false);
      }
    } catch {
      showToast('Error de conexión');
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedVideo('');
    setVideoStatus('Enviando solicitud...');

    try {
      const enhancedPrompt = `[Style: ${videoStyle}] ${videoPrompt}`;

      const response = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrandId,
          prompt: enhancedPrompt,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setVideoJobId(data.id);
        setVideoStatus('Procesando video con IA...');
        pollJobResult(data.id, 'video');
      } else {
        showToast(data.error || 'Error al generar video');
        setIsGenerating(false);
        setVideoStatus('');
      }
    } catch {
      showToast('Error de conexión');
      setIsGenerating(false);
      setVideoStatus('');
    }
  };

  const pollJobResult = (jobId: string, type: 'text' | 'image' | 'video') => {
    let attempts = 0;
    const maxAttempts = type === 'video' ? 120 : 30; // 10 min for video, 2.5 min for others

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        showToast('La generación está tomando más tiempo del esperado. Intenta de nuevo.');
        setIsGenerating(false);
        setVideoStatus('');
        return;
      }

      try {
        const response = await fetch(`/api/ai/generate-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _pollJobId: jobId }),
        });

        // Use a dedicated poll endpoint
        const pollResponse = await fetch(`/api/ai/job/${jobId}`);
        if (!pollResponse.ok) return;

        const data = await pollResponse.json();

        if (data.status === 'COMPLETED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (type === 'text') setGeneratedContent(data.resultText || '');
          if (type === 'image') setGeneratedImage(data.resultUrl || '');
          if (type === 'video') {
            setGeneratedVideo(data.resultUrl || '');
            setVideoStatus('');
          }
          setIsGenerating(false);
        } else if (data.status === 'FAILED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          showToast(data.errorMessage || 'Error en la generación');
          setIsGenerating(false);
          setVideoStatus('');
        } else if (type === 'video') {
          setVideoStatus(`Generando video con IA... (${Math.floor(attempts * 5)}s)`);
        }
      } catch {
        // Silently retry
      }
    }, 5000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    showToast('Contenido copiado al portapapeles', 'success');
  };

  const tabs = [
    { id: 'text' as TabType, icon: DocumentTextIcon, label: 'Generar Texto' },
    { id: 'image' as TabType, icon: PhotoIcon, label: 'Generar Imagen' },
    { id: 'video' as TabType, icon: VideoCameraIcon, label: 'Generar Video' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        <div className="space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <SparklesIcon className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Content AI</h1>
            </div>
            <p className="text-gray-600">
              Genera textos, imágenes y videos con inteligencia artificial
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div>
              {activeTab === 'text' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Configuración de Contenido</h2>
                  <form onSubmit={handleGenerateText} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contenido</label>
                      <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="social-post">Post para Redes Sociales</option>
                        <option value="blog-intro">Introducción de Blog</option>
                        <option value="product-description">Descripción de Producto</option>
                        <option value="email-subject">Asunto de Email</option>
                        <option value="ad-copy">Copy Publicitario</option>
                        <option value="video-script">Guión de Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción / Tema</label>
                      <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="Ej: Lanzamiento de nuevo producto eco-friendly para el hogar" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
                        <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                          <option value="casual">Casual</option>
                          <option value="professional">Profesional</option>
                          <option value="friendly">Amigable</option>
                          <option value="formal">Formal</option>
                          <option value="humorous">Humorístico</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="pt">Português</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={isGenerating} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2">
                      {isGenerating ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generando...</span></>
                      ) : (
                        <><SparklesIcon className="h-5 w-5" /><span>Generar Contenido</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Configuración de Imagen</h2>
                  <form onSubmit={handleGenerateImage} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de la Imagen</label>
                      <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder="Ej: Un producto eco-friendly en un ambiente natural, con luz suave" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
                      <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="realistic">Realista</option>
                        <option value="artistic">Artístico</option>
                        <option value="cartoon">Caricatura</option>
                        <option value="minimalist">Minimalista</option>
                        <option value="vintage">Vintage</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isGenerating} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2">
                      {isGenerating ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generando...</span></>
                      ) : (
                        <><SparklesIcon className="h-5 w-5" /><span>Generar Imagen</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Generación de Video con IA</h2>
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-800">
                      Powered by <strong>Minimax Video-01-Live</strong> — Genera videos de alta calidad a partir de texto. La generación puede tomar entre 1-5 minutos.
                    </p>
                  </div>
                  <form onSubmit={handleGenerateVideo} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Describe el video que quieres crear</label>
                      <textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        placeholder="Ej: Una taza de café humeante en una mesa de madera, con luz de amanecer entrando por la ventana, estilo cinematográfico, movimiento lento de la cámara acercándose"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estilo Visual</label>
                      <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="cinematic">Cinematográfico</option>
                        <option value="realistic">Realista</option>
                        <option value="animated">Animado</option>
                        <option value="slow-motion">Cámara Lenta</option>
                        <option value="timelapse">Timelapse</option>
                        <option value="product-showcase">Showcase de Producto</option>
                        <option value="social-media">Para Redes Sociales</option>
                        <option value="aerial">Aéreo / Drone</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Tips para mejores resultados:</h3>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>- Describe movimientos de cámara: "pan left", "zoom in", "tracking shot"</li>
                        <li>- Especifica la iluminación: "golden hour", "neon lights", "soft diffused light"</li>
                        <li>- Menciona el ambiente: "cozy", "dramatic", "minimalist"</li>
                        <li>- Para productos: describe el producto y su contexto</li>
                      </ul>
                    </div>

                    <button type="submit" disabled={isGenerating} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2">
                      {isGenerating ? (
                        <><ArrowPathIcon className="h-5 w-5 animate-spin" /><span>{videoStatus || 'Generando video...'}</span></>
                      ) : (
                        <><VideoCameraIcon className="h-5 w-5" /><span>Generar Video</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Result Column */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Resultado</h2>

                {activeTab === 'text' && (
                  generatedContent ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{generatedContent}</p>
                      </div>
                      <button onClick={copyToClipboard} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Copiar al Portapapeles
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>El contenido generado aparecerá aquí</p>
                    </div>
                  )
                )}

                {activeTab === 'image' && (
                  generatedImage ? (
                    <div className="space-y-4">
                      <img src={generatedImage} alt="Generated" className="w-full rounded-md border border-gray-200" />
                      <button onClick={() => window.open(generatedImage, '_blank')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Descargar Imagen
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <PhotoIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>La imagen generada aparecerá aquí</p>
                    </div>
                  )
                )}

                {activeTab === 'video' && (
                  generatedVideo ? (
                    <div className="space-y-4">
                      <div className="relative rounded-md overflow-hidden border border-gray-200 bg-black">
                        <video
                          src={generatedVideo}
                          controls
                          autoPlay
                          loop
                          className="w-full"
                          style={{ maxHeight: '500px' }}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => window.open(generatedVideo, '_blank')}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Descargar Video
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedVideo);
                            showToast('URL copiada', 'success');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Copiar URL
                        </button>
                      </div>
                    </div>
                  ) : isGenerating ? (
                    <div className="text-center py-12">
                      <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                        <VideoCameraIcon className="absolute inset-0 m-auto h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Generando tu video...</p>
                      <p className="text-sm text-gray-500">{videoStatus}</p>
                      <p className="text-xs text-gray-400 mt-2">Este proceso puede tomar 1-5 minutos</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>El video generado aparecerá aquí</p>
                      <p className="text-sm mt-2">Modelo: Minimax Video-01-Live</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
