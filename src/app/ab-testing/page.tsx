'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { useTranslation } from '@/hooks/useTranslation';
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

const STATUS_TAB_KEYS: Array<{ value: string; key: string }> = [
  { value: '', key: 'ab_tab_all' },
  { value: 'DRAFT', key: 'ab_tab_draft' },
  { value: 'RUNNING', key: 'ab_tab_running' },
  { value: 'COMPLETED', key: 'ab_tab_completed' },
];

const STATUS_BADGE_CLASSES: Record<string, { bg: string; text: string; key: string }> = {
  DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', key: 'ab_status_draft' },
  RUNNING: { bg: 'bg-blue-100', text: 'text-blue-700', key: 'ab_status_running' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', key: 'ab_status_completed' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', key: 'ab_status_cancelled' },
};

const METRIC_GOAL_KEYS: Array<{ value: string; key: string }> = [
  { value: 'ENGAGEMENT', key: 'ab_goal_engagement' },
  { value: 'VIEWS', key: 'ab_goal_views' },
  { value: 'LIKES', key: 'ab_goal_likes' },
  { value: 'CLICKS', key: 'ab_goal_clicks' },
  { value: 'SHARES', key: 'ab_goal_shares' },
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
  const { t } = useTranslation();
  const variantDefault = t('ab_variant_default');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metricGoal, setMetricGoal] = useState('ENGAGEMENT');
  const [variants, setVariants] = useState<VariantInput[]>([
    { name: `${variantDefault} A`, content: '' },
    { name: `${variantDefault} B`, content: '' },
  ]);

  const addVariant = () => {
    const letter = String.fromCharCode(65 + variants.length);
    setVariants([...variants, { name: `${variantDefault} ${letter}`, content: '' }]);
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
          <h2 className="text-lg font-semibold text-gray-900">{t('ab_modal_title')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ab_field_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('ab_field_name_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ab_field_desc')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('ab_field_desc_placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ab_field_metric')}</label>
            <select
              value={metricGoal}
              onChange={(e) => setMetricGoal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {METRIC_GOAL_KEYS.map((m) => (
                <option key={m.value} value={m.value}>{t(m.key)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">{t('ab_variants')}</label>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                {t('ab_add_variant')}
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
                      placeholder={t('ab_variant_name_placeholder')}
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
                    placeholder={t('ab_variant_content_placeholder')}
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
            {t('ab_cancel')}
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
            {t('ab_create_test')}
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
  const { t } = useTranslation();
  const statusBadge = STATUS_BADGE_CLASSES[test.status] || STATUS_BADGE_CLASSES.DRAFT;
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
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('ab_back')}
      </button>

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
              {t(statusBadge.key)}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {test.metricGoal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {test.startedAt && <span>{t('ab_started')} {new Date(test.startedAt).toLocaleDateString()}</span>}
          {test.endedAt && <span>{t('ab_ended')} {new Date(test.endedAt).toLocaleDateString()}</span>}
          <span>{t('ab_created')} {new Date(test.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 flex gap-2">
          {test.status === 'DRAFT' && (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {t('ab_start')}
            </button>
          )}
          {test.status === 'RUNNING' && (
            <button
              onClick={onComplete}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {t('ab_complete')}
            </button>
          )}
        </div>
      </div>

      {test.status === 'COMPLETED' && winnerVariant && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">{t('ab_winner')} {winnerVariant.name}</p>
            <p className="text-xs text-yellow-600">
              {t('ab_engagement_rate')} {winnerVariant.engagementRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {t('ab_comparison')} ({variants.length})
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

            <p className="text-xs text-gray-600 mb-4 line-clamp-3 whitespace-pre-wrap">
              {variant.content}
            </p>

            <div className="space-y-2.5">
              {[
                { label: t('ab_metric_views'), value: variant.viewsCount, icon: EyeIcon, max: getMaxValue('viewsCount'), color: 'bg-blue-500' },
                { label: t('ab_metric_likes'), value: variant.likesCount, icon: HeartIcon, max: getMaxValue('likesCount'), color: 'bg-pink-500' },
                { label: t('ab_metric_comments'), value: variant.commentsCount, icon: ChatBubbleLeftIcon, max: getMaxValue('commentsCount'), color: 'bg-purple-500' },
                { label: t('ab_metric_shares'), value: variant.sharesCount, icon: ShareIcon, max: getMaxValue('sharesCount'), color: 'bg-green-500' },
                { label: t('ab_metric_clicks'), value: variant.clicksCount, icon: CursorArrowRaysIcon, max: getMaxValue('clicksCount'), color: 'bg-orange-500' },
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

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ChartBarIcon className="h-3 w-3" />
                  {t('ab_engagement_rate_label')}
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
  const { t } = useTranslation();
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

  const filteredTests = useMemo(() => tests, [tests]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BeakerIcon className="h-7 w-7 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('ab_title')}</h1>
                    <p className="text-sm text-gray-500">{t('ab_subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  {t('ab_new_test')}
                </button>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                {STATUS_TAB_KEYS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === tab.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t(tab.key)}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
                  <span>{error}</span>
                  <button onClick={() => dispatch(clearError())} className="text-red-500 hover:text-red-700">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {isLoading && !tests.length ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <BeakerIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{t('ab_empty_title')}</h3>
                  <p className="text-xs text-gray-500 mb-4">{t('ab_empty_desc')}</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {t('ab_create_test')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => {
                    const badge = STATUS_BADGE_CLASSES[test.status] || STATUS_BADGE_CLASSES.DRAFT;
                    const variantCount = test.variants?.length || 0;
                    const winner = test.variants?.find((v) => v.isWinner);

                    return (
                      <div
                        key={test.id}
                        onClick={() => setSelectedTestId(test.id)}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                            {test.name}
                          </h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}>
                            {t(badge.key)}
                          </span>
                        </div>

                        {test.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            {test.metricGoal}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {variantCount} {variantCount === 1 ? t('ab_variants_count_singular') : t('ab_variants_count')}
                          </span>
                        </div>

                        {test.status === 'COMPLETED' && winner && (
                          <div className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2.5 py-1.5 mb-3">
                            <TrophyIcon className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="font-medium">{t('ab_winner')} {winner.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400">
                            {new Date(test.createdAt).toLocaleDateString()}
                          </span>
                          {test.status === 'DRAFT' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStart(test.id); }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {t('ab_start_short')}
                            </button>
                          )}
                          {test.status === 'RUNNING' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleComplete(test.id); }}
                              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
                            >
                              {t('ab_complete_short')}
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
