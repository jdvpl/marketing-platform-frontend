'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import {
  fetchBrandTests,
  fetchTestDetail,
  createABTest,
  startTest,
  completeTest,
  clearError,
  clearCurrentTest,
  ABTest,
  ABTestVariant,
} from '@/features/abtesting/abTestingSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  BeakerIcon,
  PlusIcon,
  XMarkIcon,
  TrophyIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'RUNNING', label: 'En curso' },
  { value: 'COMPLETED', label: 'Completados' },
];

const STATUS_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  RUNNING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En curso' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
};

const METRIC_GOALS = [
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'VIEWS', label: 'Views' },
  { value: 'LIKES', label: 'Likes' },
  { value: 'CLICKS', label: 'Clicks' },
  { value: 'SHARES', label: 'Shares' },
];

interface VariantInput {
  name: string;
  content: string;
}

function CreateTestModal({
  brandId,
  onClose,
  isCreating,
  onSubmit,
}: {
  brandId: string;
  onClose: () => void;
  isCreating: boolean;
  onSubmit: (body: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metricGoal, setMetricGoal] = useState('ENGAGEMENT');
  const [variants, setVariants] = useState<VariantInput[]>([
    { name: 'Variante A', content: '' },
    { name: 'Variante B', content: '' },
  ]);

  const addVariant = () => {
    const letter = String.fromCharCode(65 + variants.length);
    setVariants([...variants, { name: `Variante ${letter}`, content: '' }]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 2) return;
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof VariantInput, value: string) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const canSubmit = name.trim() && variants.every((v) => v.name.trim() && v.content.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      brandId,
      name: name.trim(),
      description: description.trim() || undefined,
      metricGoal,
      variants: variants.map((v) => ({ name: v.name.trim(), content: v.content.trim() })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Test A/B</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del test</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Test de copy para Instagram"
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
              placeholder="Describe el objetivo del test"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Metric Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{"M\u00e9trica objetivo"}</label>
            <select
              value={metricGoal}
              onChange={(e) => setMetricGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {METRIC_GOALS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Variantes</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Agregar variante
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      className="text-sm font-medium text-gray-900 border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
                      placeholder="Nombre de la variante"
                    />
                    {variants.length > 2 && (
                      <button
                        onClick={() => removeVariant(idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={variant.content}
                    onChange={(e) => updateVariant(idx, 'content', e.target.value)}
                    placeholder="Contenido de la variante..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              ))}
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
            disabled={!canSubmit || isCreating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            Crear Test
          </button>
        </div>
      </div>
    </div>
  );
}

function TestDetailView({
  test,
  onBack,
  onStart,
  onComplete,
  isLoading,
}: {
  test: ABTest & { variants: ABTestVariant[] };
  onBack: () => void;
  onStart: () => void;
  onComplete: () => void;
  isLoading: boolean;
}) {
  const statusBadge = STATUS_BADGES[test.status] || STATUS_BADGES.DRAFT;
  const variants = test.variants || [];
  const winnerVariant = variants.find((v) => v.isWinner);

  const getMaxValue = (key: keyof ABTestVariant) => {
    return Math.max(...variants.map((v) => (typeof v[key] === 'number' ? (v[key] as number) : 0)), 1);
  };

  const getBarWidth = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.round((value / max) * 100);
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a tests
      </button>

      {/* Test header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{test.name}</h2>
            {test.description && (
              <p className="text-sm text-gray-500">{test.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {test.metricGoal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {test.startedAt && <span>Iniciado: {new Date(test.startedAt).toLocaleDateString()}</span>}
          {test.endedAt && <span>Finalizado: {new Date(test.endedAt).toLocaleDateString()}</span>}
          <span>Creado: {new Date(test.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {test.status === 'DRAFT' && (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Iniciar Test
            </button>
          )}
          {test.status === 'RUNNING' && (
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Completar Test
            </button>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {test.status === 'COMPLETED' && winnerVariant && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Ganador: {winnerVariant.name}</p>
            <p className="text-xs text-yellow-600">
              Engagement rate: {winnerVariant.engagementRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      {/* Variants comparison */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {"Comparaci\u00f3n de variantes"} ({variants.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={`bg-white border rounded-xl p-5 transition-all ${
              variant.isWinner
                ? 'border-green-400 ring-2 ring-green-100'
                : 'border-gray-200'
            }`}
          >
            {/* Variant header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">{variant.name}</h4>
                {variant.isWinner && (
                  <TrophyIcon className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {variant.provider && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {variant.provider}
                </span>
              )}
            </div>

            {/* Content preview */}
            <p className="text-xs text-gray-600 mb-4 line-clamp-3 whitespace-pre-wrap">
              {variant.content}
            </p>

            {/* Metrics */}
            <div className="space-y-2.5">
              {[
                { label: 'Views', value: variant.viewsCount, icon: EyeIcon, max: getMaxValue('viewsCount'), color: 'bg-blue-500' },
                { label: 'Likes', value: variant.likesCount, icon: HeartIcon, max: getMaxValue('likesCount'), color: 'bg-pink-500' },
                { label: 'Comentarios', value: variant.commentsCount, icon: ChatBubbleLeftIcon, max: getMaxValue('commentsCount'), color: 'bg-purple-500' },
                { label: 'Shares', value: variant.sharesCount, icon: ShareIcon, max: getMaxValue('sharesCount'), color: 'bg-green-500' },
                { label: 'Clicks', value: variant.clicksCount, icon: CursorArrowRaysIcon, max: getMaxValue('clicksCount'), color: 'bg-orange-500' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="flex items-center gap-1 text-gray-500">
                      <metric.icon className="h-3 w-3" />
                      {metric.label}
                    </span>
                    <span className="font-medium text-gray-900">{metric.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${metric.color} transition-all`}
                      style={{ width: `${getBarWidth(metric.value, metric.max)}%` }}
                    />
                  </div>
                </div>
              ))}

              {/* Engagement rate */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ChartBarIcon className="h-3 w-3" />
                  Engagement Rate
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {variant.engagementRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ABTestingPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { tests, currentTest, isLoading, isCreating, error } = useAppSelector((s) => s.abTesting);

  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBrandId) return;
    dispatch(fetchBrandTests({
      brandId: selectedBrandId,
      status: statusFilter || undefined,
    }));
  }, [dispatch, selectedBrandId, statusFilter]);

  useEffect(() => {
    if (selectedTestId) {
      dispatch(fetchTestDetail(selectedTestId));
    }
  }, [dispatch, selectedTestId]);

  const handleCreate = (body: Record<string, unknown>) => {
    dispatch(createABTest(body)).then((action) => {
      if (createABTest.fulfilled.match(action)) {
        setShowCreateModal(false);
      }
    });
  };

  const handleStart = (testId: string) => {
    dispatch(startTest(testId)).then((action) => {
      if (startTest.fulfilled.match(action)) {
        if (selectedBrandId) dispatch(fetchBrandTests({ brandId: selectedBrandId, status: statusFilter || undefined }));
        dispatch(fetchTestDetail(testId));
      }
    });
  };

  const handleComplete = (testId: string) => {
    dispatch(completeTest(testId)).then((action) => {
      if (completeTest.fulfilled.match(action)) {
        if (selectedBrandId) dispatch(fetchBrandTests({ brandId: selectedBrandId, status: statusFilter || undefined }));
        dispatch(fetchTestDetail(testId));
      }
    });
  };

  const handleBack = () => {
    setSelectedTestId(null);
    dispatch(clearCurrentTest());
  };

  const filteredTests = useMemo(() => {
    return tests;
  }, [tests]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Show detail view if a test is selected */}
          {selectedTestId && currentTest ? (
            <TestDetailView
              test={currentTest}
              onBack={handleBack}
              onStart={() => handleStart(currentTest.id)}
              onComplete={() => handleComplete(currentTest.id)}
              isLoading={isLoading}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BeakerIcon className="h-7 w-7 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">A/B Testing</h1>
                    <p className="text-sm text-gray-500">Compara variantes de contenido y encuentra lo que mejor funciona</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Nuevo Test
                </button>
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === tab.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
              {isLoading && !tests.length ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <BeakerIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{"No hay tests A/B a\u00fan"}</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Crea tu primer test para comparar variantes de contenido.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Crear Test
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => {
                    const badge = STATUS_BADGES[test.status] || STATUS_BADGES.DRAFT;
                    const variantCount = test.variants?.length || 0;
                    const winner = test.variants?.find((v) => v.isWinner);

                    return (
                      <div
                        key={test.id}
                        onClick={() => setSelectedTestId(test.id)}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        {/* Card header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                            {test.name}
                          </h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>

                        {test.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                        )}

                        {/* Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            {test.metricGoal}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {variantCount} variante{variantCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Winner */}
                        {test.status === 'COMPLETED' && winner && (
                          <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2.5 py-1.5 mb-3">
                            <TrophyIcon className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="font-medium">Ganador: {winner.name}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400">
                            {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                          {test.status === 'DRAFT' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStart(test.id); }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Iniciar
                            </button>
                          )}
                          {test.status === 'RUNNING' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleComplete(test.id); }}
                              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
                            >
                              Completar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Create Modal */}
          {showCreateModal && selectedBrandId && (
            <CreateTestModal
              brandId={selectedBrandId}
              onClose={() => setShowCreateModal(false)}
              isCreating={isCreating}
              onSubmit={handleCreate}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
