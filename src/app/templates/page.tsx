'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useTranslation } from '@/hooks/useTranslation';
import {
  fetchBrandTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  clearError,
  clearCurrentTemplate,
  setCurrentTemplate,
  ContentTemplate,
} from '@/features/templates/templatesSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  DocumentDuplicateIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PlayIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const CATEGORY_VALUES = ['General', 'Promo', 'Educativo', 'Entretenimiento', 'Behind Scenes', 'UGC', 'Anuncio'] as const;
type CategoryValue = typeof CATEGORY_VALUES[number];

const CATEGORY_KEY: Record<CategoryValue, string> = {
  General: 'templates_cat_general',
  Promo: 'templates_cat_promo',
  Educativo: 'templates_cat_education',
  Entretenimiento: 'templates_cat_entertainment',
  'Behind Scenes': 'templates_cat_behind',
  UGC: 'templates_cat_ugc',
  Anuncio: 'templates_cat_ad',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  General: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Promo: { bg: 'bg-red-100', text: 'text-red-700' },
  Educativo: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Entretenimiento: { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Behind Scenes': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  UGC: { bg: 'bg-green-100', text: 'text-green-700' },
  Anuncio: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const PROVIDERS = ['', 'instagram', 'tiktok', 'facebook', 'twitter', 'youtube', 'linkedin'];

const MEDIA_TYPES = ['', 'IMAGE', 'VIDEO', 'CAROUSEL', 'REEL', 'STORY', 'TEXT'];

function getMediaTypeIcon(mediaType?: string) {
  switch (mediaType) {
    case 'VIDEO':
    case 'REEL':
    case 'STORY':
      return VideoCameraIcon;
    case 'IMAGE':
    case 'CAROUSEL':
      return PhotoIcon;
    case 'TEXT':
      return DocumentTextIcon;
    default:
      return DocumentTextIcon;
  }
}

function CreateEditModal({
  brandId,
  template,
  onClose,
  isSubmitting,
  onSubmit,
}: {
  brandId: string;
  template?: ContentTemplate | null;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState(template?.category || 'General');
  const [contentTemplate, setContentTemplate] = useState(template?.contentTemplate || '');
  const [hashtags, setHashtags] = useState(template?.hashtags || '');
  const [provider, setProvider] = useState(template?.provider || '');
  const [mediaType, setMediaType] = useState(template?.mediaType || '');

  const isEditing = !!template;
  const canSubmit = name.trim() && contentTemplate.trim() && category;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const body: Record<string, unknown> = {
      brandId,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      contentTemplate: contentTemplate.trim(),
      hashtags: hashtags.trim() || undefined,
      provider: provider || undefined,
      mediaType: mediaType || undefined,
    };
    onSubmit(body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? t('templates_edit') : t('templates_new')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('templates_field_name_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_desc')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('templates_field_desc_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORY_VALUES.map((c) => (
                <option key={c} value={c}>{t(CATEGORY_KEY[c])}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_content')}</label>
            <textarea
              value={contentTemplate}
              onChange={(e) => setContentTemplate(e.target.value)}
              placeholder={t('templates_field_content_placeholder')}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">{t('templates_field_variables')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_hashtags')}</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder={t('templates_field_hashtags_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_provider')}</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">{t('templates_filter_all_networks')}</option>
                {PROVIDERS.filter((p) => p !== '').map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('templates_field_media')}</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">{t('templates_field_media_unspecified')}</option>
                {MEDIA_TYPES.filter((m) => m !== '').map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('templates_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            {isEditing ? t('templates_save_changes') : t('templates_create')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateDetailModal({
  template,
  onClose,
  onEdit,
  onUse,
  onDelete,
  isLoading,
}: {
  template: ContentTemplate;
  onClose: () => void;
  onEdit: () => void;
  onUse: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const categoryColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.General;
  const MediaIcon = getMediaTypeIcon(template.mediaType);
  const hashtagList = template.hashtags
    ? template.hashtags.split(/\s+/).filter((h) => h.startsWith('#'))
    : [];
  const categoryLabel = CATEGORY_KEY[template.category as CategoryValue]
    ? t(CATEGORY_KEY[template.category as CategoryValue])
    : template.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColor.bg} ${categoryColor.text}`}>
              {categoryLabel}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {template.description && (
            <p className="text-sm text-gray-500">{template.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {template.provider && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                {template.provider.charAt(0).toUpperCase() + template.provider.slice(1)}
              </span>
            )}
            {template.mediaType && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                <MediaIcon className="h-3 w-3" />
                {template.mediaType}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <ChartBarIcon className="h-3 w-3" />
              {template.usageCount} {t('templates_uses')}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">{t('templates_content_label')}</label>
            <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {template.contentTemplate}
            </p>
          </div>

          {hashtagList.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">{t('templates_hashtags_label')}</label>
              <div className="flex flex-wrap gap-1.5">
                {hashtagList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {t('templates_created_label')} {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <TrashIcon className="h-4 w-4" />
            {t('templates_action_delete')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <PencilIcon className="h-4 w-4" />
              {t('templates_action_edit')}
            </button>
            <button
              onClick={onUse}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              {t('templates_use_btn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { t } = useTranslation();
  const { templates, currentTemplate, isLoading, isCreating, error } = useAppSelector((s) => s.templates);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBrandId) return;
    dispatch(fetchBrandTemplates({
      brandId: selectedBrandId,
      category: categoryFilter || undefined,
      provider: providerFilter || undefined,
    }));
  }, [dispatch, selectedBrandId, categoryFilter, providerFilter]);

  const handleCreate = (body: Record<string, unknown>) => {
    dispatch(createTemplate(body)).then((action) => {
      if (createTemplate.fulfilled.match(action)) {
        setShowCreateModal(false);
      }
    });
  };

  const handleUpdate = (body: Record<string, unknown>) => {
    if (!currentTemplate) return;
    dispatch(updateTemplate({ templateId: currentTemplate.id, body })).then((action) => {
      if (updateTemplate.fulfilled.match(action)) {
        setShowEditModal(false);
        setShowDetailModal(false);
        dispatch(clearCurrentTemplate());
      }
    });
  };

  const handleDelete = (templateId: string) => {
    if (!confirm(t('templates_delete_confirm'))) return;
    dispatch(deleteTemplate(templateId)).then((action) => {
      if (deleteTemplate.fulfilled.match(action)) {
        setShowDetailModal(false);
        dispatch(clearCurrentTemplate());
      }
    });
  };

  const handleUse = (template: ContentTemplate) => {
    navigator.clipboard.writeText(template.contentTemplate).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
    dispatch(useTemplate(template.id));
  };

  const handleCopyContent = (template: ContentTemplate) => {
    navigator.clipboard.writeText(template.contentTemplate).then(() => {
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleOpenDetail = (template: ContentTemplate) => {
    dispatch(setCurrentTemplate(template));
    setShowDetailModal(true);
  };

  const handleOpenEdit = (template?: ContentTemplate) => {
    if (template) dispatch(setCurrentTemplate(template));
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const filteredTemplates = useMemo(() => templates, [templates]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DocumentDuplicateIcon className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('templates_title')}</h1>
                <p className="text-sm text-gray-500">{t('templates_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              {t('templates_new')}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
              <button
                key="__all__"
                onClick={() => setCategoryFilter('')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === ''
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('templates_filter_all')}
              </button>
              {CATEGORY_VALUES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    categoryFilter === cat
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t(CATEGORY_KEY[cat])}
                </button>
              ))}
            </div>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t('templates_filter_all_networks')}</option>
              {PROVIDERS.filter((p) => p !== '').map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Content */}
          {isLoading && !templates.length ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <DocumentDuplicateIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">{t('templates_empty_title')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('templates_empty_desc')}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                {t('templates_create')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const categoryColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.General;
                const MediaIcon = getMediaTypeIcon(template.mediaType);
                const hashtagList = template.hashtags
                  ? template.hashtags.split(/\s+/).filter((h) => h.startsWith('#')).slice(0, 4)
                  : [];
                const isCopied = copiedId === template.id;
                const categoryLabel = CATEGORY_KEY[template.category as CategoryValue]
                  ? t(CATEGORY_KEY[template.category as CategoryValue])
                  : template.category;

                return (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2 cursor-pointer hover:text-blue-600"
                        onClick={() => handleOpenDetail(template)}
                      >
                        {template.name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColor.bg} ${categoryColor.text}`}>
                        {categoryLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {template.provider && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                          {template.provider.charAt(0).toUpperCase() + template.provider.slice(1)}
                        </span>
                      )}
                      {template.mediaType && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <MediaIcon className="h-3 w-3" />
                          {template.mediaType}
                        </span>
                      )}
                    </div>

                    <p
                      className="text-xs text-gray-600 mb-3 line-clamp-3 whitespace-pre-wrap cursor-pointer"
                      onClick={() => handleOpenDetail(template)}
                    >
                      {template.contentTemplate}
                    </p>

                    {hashtagList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hashtagList.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <ChartBarIcon className="h-3 w-3" />
                        {template.usageCount} {t('templates_uses')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(template)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title={t('templates_action_edit')}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyContent(template)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title={t('templates_action_copy')}
                        >
                          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title={t('templates_action_delete')}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleUse(template)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isCopied ? t('templates_copied') : (
                          <>
                            <PlayIcon className="h-3.5 w-3.5" />
                            {t('templates_use')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modals */}
          {showCreateModal && selectedBrandId && (
            <CreateEditModal
              brandId={selectedBrandId}
              onClose={() => setShowCreateModal(false)}
              isSubmitting={isCreating}
              onSubmit={handleCreate}
            />
          )}

          {showEditModal && selectedBrandId && currentTemplate && (
            <CreateEditModal
              brandId={selectedBrandId}
              template={currentTemplate}
              onClose={() => { setShowEditModal(false); dispatch(clearCurrentTemplate()); }}
              isSubmitting={isLoading}
              onSubmit={handleUpdate}
            />
          )}

          {showDetailModal && currentTemplate && (
            <TemplateDetailModal
              template={currentTemplate}
              onClose={() => { setShowDetailModal(false); dispatch(clearCurrentTemplate()); }}
              onEdit={() => handleOpenEdit()}
              onUse={() => handleUse(currentTemplate)}
              onDelete={() => handleDelete(currentTemplate.id)}
              isLoading={isLoading}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
