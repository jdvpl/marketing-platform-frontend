'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
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
  MusicalNoteIcon,
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'General', label: 'General' },
  { value: 'Promo', label: 'Promo' },
  { value: 'Educativo', label: 'Educativo' },
  { value: 'Entretenimiento', label: 'Entretenimiento' },
  { value: 'Behind Scenes', label: 'Behind Scenes' },
  { value: 'UGC', label: 'UGC' },
  { value: 'Anuncio', label: 'Anuncio' },
];

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
            {isEditing ? 'Editar Template' : 'Nuevo Template'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Post promocional de producto"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{"Descripci\u00f3n (opcional)"}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe para que sirve este template"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{"Categor\u00eda"}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {CATEGORIES.filter((c) => c.value !== '').map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Content Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido del template</label>
            <textarea
              value={contentTemplate}
              onChange={(e) => setContentTemplate(e.target.value)}
              placeholder={"Escribe tu template aqu\u00ed...\nUsa variables como {{producto}}, {{marca}}, {{precio}}, {{beneficio}}"}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              {"Variables disponibles: {{producto}}, {{marca}}, {{precio}}, {{beneficio}}, {{fecha}}, {{link}}"}
            </p>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags (opcional)</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#marketing #contenido #social"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Provider + Media Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Red social (opcional)</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Todas</option>
                {PROVIDERS.filter((p) => p !== '').map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de media (opcional)</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sin especificar</option>
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
            Cancelar
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
            {isEditing ? 'Guardar cambios' : 'Crear Template'}
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
  const categoryColor = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.General;
  const MediaIcon = getMediaTypeIcon(template.mediaType);
  const hashtagList = template.hashtags
    ? template.hashtags.split(/\s+/).filter((h) => h.startsWith('#'))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColor.bg} ${categoryColor.text}`}>
              {template.category}
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

          {/* Metadata */}
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
              {template.usageCount} usos
            </span>
          </div>

          {/* Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">Contenido</label>
            <p className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {template.contentTemplate}
            </p>
          </div>

          {/* Hashtags */}
          {hashtagList.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Hashtags</label>
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
            Creado: {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <TrashIcon className="h-4 w-4" />
            Eliminar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <PencilIcon className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={onUse}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              Usar Template
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
    if (!confirm('Estas seguro de que deseas eliminar este template?')) return;
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

  const filteredTemplates = useMemo(() => {
    return templates;
  }, [templates]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <DocumentDuplicateIcon className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Templates de Contenido</h1>
                <p className="text-sm text-gray-500">Crea y reutiliza plantillas para tus publicaciones</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo Template
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {/* Category pills */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    categoryFilter === cat.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Provider dropdown */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todas las redes</option>
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
              <h3 className="text-sm font-medium text-gray-900 mb-1">{"No hay templates a\u00fan"}</h3>
              <p className="text-xs text-gray-500 mb-4">
                Crea tu primer template para agilizar la creacion de contenido.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Crear Template
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

                return (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2 cursor-pointer hover:text-blue-600"
                        onClick={() => handleOpenDetail(template)}
                      >
                        {template.name}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColor.bg} ${categoryColor.text}`}>
                        {template.category}
                      </span>
                    </div>

                    {/* Provider badge */}
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

                    {/* Content preview */}
                    <p
                      className="text-xs text-gray-600 mb-3 line-clamp-3 whitespace-pre-wrap cursor-pointer"
                      onClick={() => handleOpenDetail(template)}
                    >
                      {template.contentTemplate}
                    </p>

                    {/* Hashtags */}
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

                    {/* Usage count */}
                    <div className="flex items-center gap-2 mb-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <ChartBarIcon className="h-3 w-3" />
                        {template.usageCount} usos
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(template)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyContent(template)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Copiar contenido"
                        >
                          <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
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
                        {isCopied ? (
                          <>Copiado!</>
                        ) : (
                          <>
                            <PlayIcon className="h-3.5 w-3.5" />
                            Usar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && selectedBrandId && (
            <CreateEditModal
              brandId={selectedBrandId}
              onClose={() => setShowCreateModal(false)}
              isSubmitting={isCreating}
              onSubmit={handleCreate}
            />
          )}

          {/* Edit Modal */}
          {showEditModal && selectedBrandId && currentTemplate && (
            <CreateEditModal
              brandId={selectedBrandId}
              template={currentTemplate}
              onClose={() => { setShowEditModal(false); dispatch(clearCurrentTemplate()); }}
              isSubmitting={isLoading}
              onSubmit={handleUpdate}
            />
          )}

          {/* Detail Modal */}
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
