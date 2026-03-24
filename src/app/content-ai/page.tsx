'use client';

import { useState } from 'react';
import { SparklesIcon, PhotoIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';

export default function ContentAIPage() {
  const { selectedBrandId } = useCompanyBrand();
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');

  // Formulario para texto
  const [textPrompt, setTextPrompt] = useState('');
  const [contentType, setContentType] = useState('social-post');
  const [tone, setTone] = useState('casual');
  const [language, setLanguage] = useState('es');

  // Formulario para imagen
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('realistic');
  const { toast, showToast, hideToast } = useToast();

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
        setGeneratedContent(data.resultText || data.content || '');
      } else {
        showToast(data.error || 'Error al generar contenido');
      }
    } catch (error) {
      showToast('Error de conexión');
    } finally {
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
        setGeneratedImage(data.resultUrl || data.imageUrl || '');
      } else {
        showToast(data.error || 'Error al generar imagen');
      }
    } catch (error) {
      showToast('Error de conexión');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    showToast('Contenido copiado al portapapeles', 'success');
  };

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
            Genera contenido creativo con inteligencia artificial
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('text')}
                className={`${
                  activeTab === 'text'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Generar Texto</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`${
                  activeTab === 'image'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <PhotoIcon className="h-5 w-5" />
                <span>Generar Imagen</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Column */}
          <div>
            {activeTab === 'text' ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Configuración de Contenido
                </h2>
                <form onSubmit={handleGenerateText} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contenido
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="social-post">Post para Redes Sociales</option>
                      <option value="blog-intro">Introducción de Blog</option>
                      <option value="product-description">Descripción de Producto</option>
                      <option value="email-subject">Asunto de Email</option>
                      <option value="ad-copy">Copy Publicitario</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción / Tema
                    </label>
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Lanzamiento de nuevo producto eco-friendly para el hogar"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tono
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="casual">Casual</option>
                        <option value="professional">Profesional</option>
                        <option value="friendly">Amigable</option>
                        <option value="formal">Formal</option>
                        <option value="humorous">Humorístico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idioma
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>Generar Contenido</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Configuración de Imagen
                </h2>
                <form onSubmit={handleGenerateImage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de la Imagen
                    </label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: Un producto eco-friendly en un ambiente natural, con luz suave"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo
                    </label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="realistic">Realista</option>
                      <option value="artistic">Artístico</option>
                      <option value="cartoon">Caricatura</option>
                      <option value="minimalist">Minimalista</option>
                      <option value="vintage">Vintage</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>Generar Imagen</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Result Column */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Resultado
              </h2>

              {activeTab === 'text' ? (
                generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">{generatedContent}</p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Copiar al Portapapeles
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                    <p>El contenido generado aparecerá aquí</p>
                  </div>
                )
              ) : (
                generatedImage ? (
                  <div className="space-y-4">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full rounded-md border border-gray-200"
                    />
                    <button
                      onClick={() => window.open(generatedImage, '_blank')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
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
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
