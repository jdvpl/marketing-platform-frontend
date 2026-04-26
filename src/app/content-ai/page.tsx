'use client';

import { useState, useEffect, useRef } from 'react';
import { SparklesIcon, PhotoIcon, DocumentTextIcon, VideoCameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useTranslation } from '@/hooks/useTranslation';

type TabType = 'text' | 'image' | 'video';

export default function ContentAIPage() {
  const { selectedBrandId } = useCompanyBrand();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
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
        showToast(data.error || t('ai_err_generate_text'));
        setIsGenerating(false);
      }
    } catch {
      showToast(t('ai_err_connection'));
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
        showToast(data.error || t('ai_err_generate_image'));
        setIsGenerating(false);
      }
    } catch {
      showToast(t('ai_err_connection'));
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedVideo('');
    setVideoStatus(t('ai_video_status_sending'));

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
        setVideoStatus(t('ai_video_status_processing'));
        pollJobResult(data.id, 'video');
      } else {
        showToast(data.error || t('ai_err_generate_video'));
        setIsGenerating(false);
        setVideoStatus('');
      }
    } catch {
      showToast(t('ai_err_connection'));
      setIsGenerating(false);
      setVideoStatus('');
    }
  };

  const pollJobResult = (jobId: string, type: 'text' | 'image' | 'video') => {
    let attempts = 0;
    const maxAttempts = type === 'video' ? 120 : 30;

    pollingRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        showToast(t('ai_err_timeout'));
        setIsGenerating(false);
        setVideoStatus('');
        return;
      }

      try {
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
          showToast(data.errorMessage || t('ai_err_generation'));
          setIsGenerating(false);
          setVideoStatus('');
        } else if (type === 'video') {
          setVideoStatus(`${t('ai_video_status_progress')} (${Math.floor(attempts * 5)}s)`);
        }
      } catch {
        // Silently retry
      }
    }, 5000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    showToast(t('ai_toast_copied'), 'success');
  };

  const tabs = [
    { id: 'text' as TabType, icon: DocumentTextIcon, label: t('ai_tab_text') },
    { id: 'image' as TabType, icon: PhotoIcon, label: t('ai_tab_image') },
    { id: 'video' as TabType, icon: VideoCameraIcon, label: t('ai_tab_video') },
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
              <h1 className="text-3xl font-bold text-gray-900">{t('ai_title')}</h1>
            </div>
            <p className="text-gray-600">{t('ai_subtitle')}</p>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('ai_text_config')}</h2>
                  <form onSubmit={handleGenerateText} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_text_type')}</label>
                      <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="social-post">{t('ai_text_type_social')}</option>
                        <option value="blog-intro">{t('ai_text_type_blog')}</option>
                        <option value="product-description">{t('ai_text_type_product')}</option>
                        <option value="email-subject">{t('ai_text_type_email')}</option>
                        <option value="ad-copy">{t('ai_text_type_ad')}</option>
                        <option value="video-script">{t('ai_text_type_video')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_text_topic')}</label>
                      <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder={t('ai_text_topic_placeholder')} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_text_tone')}</label>
                        <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                          <option value="casual">{t('ai_tone_casual')}</option>
                          <option value="professional">{t('ai_tone_professional')}</option>
                          <option value="friendly">{t('ai_tone_friendly')}</option>
                          <option value="formal">{t('ai_tone_formal')}</option>
                          <option value="humorous">{t('ai_tone_humorous')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_text_language')}</label>
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
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>{t('ai_generating')}</span></>
                      ) : (
                        <><SparklesIcon className="h-5 w-5" /><span>{t('ai_generate_text_btn')}</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('ai_image_config')}</h2>
                  <form onSubmit={handleGenerateImage} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_image_desc')}</label>
                      <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500" placeholder={t('ai_image_desc_placeholder')} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_image_style')}</label>
                      <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="realistic">{t('ai_image_style_realistic')}</option>
                        <option value="artistic">{t('ai_image_style_artistic')}</option>
                        <option value="cartoon">{t('ai_image_style_cartoon')}</option>
                        <option value="minimalist">{t('ai_image_style_minimalist')}</option>
                        <option value="vintage">{t('ai_image_style_vintage')}</option>
                      </select>
                    </div>
                    <button type="submit" disabled={isGenerating} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2">
                      {isGenerating ? (
                        <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>{t('ai_generating')}</span></>
                      ) : (
                        <><SparklesIcon className="h-5 w-5" /><span>{t('ai_generate_image_btn')}</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'video' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('ai_video_config')}</h2>
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-800">
                      Powered by <strong>Minimax Video-01-Live</strong> — {t('ai_video_powered')}
                    </p>
                  </div>
                  <form onSubmit={handleGenerateVideo} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_video_desc')}</label>
                      <textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                        placeholder={t('ai_video_desc_placeholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('ai_video_style')}</label>
                      <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                        <option value="cinematic">{t('ai_video_style_cinematic')}</option>
                        <option value="realistic">{t('ai_video_style_realistic')}</option>
                        <option value="animated">{t('ai_video_style_animated')}</option>
                        <option value="slow-motion">{t('ai_video_style_slow')}</option>
                        <option value="timelapse">{t('ai_video_style_timelapse')}</option>
                        <option value="product-showcase">{t('ai_video_style_product')}</option>
                        <option value="social-media">{t('ai_video_style_social')}</option>
                        <option value="aerial">{t('ai_video_style_aerial')}</option>
                      </select>
                    </div>

                    <div className="bg-gray-50 rounded-md p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{t('ai_video_tips_title')}</h3>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>{t('ai_video_tip_1')}</li>
                        <li>{t('ai_video_tip_2')}</li>
                        <li>{t('ai_video_tip_3')}</li>
                        <li>{t('ai_video_tip_4')}</li>
                      </ul>
                    </div>

                    <button type="submit" disabled={isGenerating} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2">
                      {isGenerating ? (
                        <><ArrowPathIcon className="h-5 w-5 animate-spin" /><span>{videoStatus || t('ai_video_generating')}</span></>
                      ) : (
                        <><VideoCameraIcon className="h-5 w-5" /><span>{t('ai_generate_video_btn')}</span></>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Result Column */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('ai_result_title')}</h2>

                {activeTab === 'text' && (
                  generatedContent ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{generatedContent}</p>
                      </div>
                      <button onClick={copyToClipboard} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('ai_copy_clipboard')}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>{t('ai_text_empty')}</p>
                    </div>
                  )
                )}

                {activeTab === 'image' && (
                  generatedImage ? (
                    <div className="space-y-4">
                      <img src={generatedImage} alt="Generated" className="w-full rounded-md border border-gray-200" />
                      <button onClick={() => window.open(generatedImage, '_blank')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('ai_download_image')}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <PhotoIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>{t('ai_image_empty')}</p>
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
                          {t('ai_download_video')}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedVideo);
                            showToast(t('ai_toast_url_copied'), 'success');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          {t('ai_copy_url')}
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
                      <p className="text-gray-700 font-medium mb-2">{t('ai_video_loading_title')}</p>
                      <p className="text-sm text-gray-500">{videoStatus}</p>
                      <p className="text-xs text-gray-400 mt-2">{t('ai_video_loading_subtitle')}</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" />
                      <p>{t('ai_video_empty')}</p>
                      <p className="text-sm mt-2">{t('ai_video_model')}</p>
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
