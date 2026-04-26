'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchCampaigns, createCampaign, deleteCampaign } from '@/features/campaigns/campaignsSlice';
import { PlusIcon, TrashIcon, ChartBarIcon, EyeIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useTranslation } from '@/hooks/useTranslation';

export default function CampaignsPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId, selectedBrand } = useCompanyBrand();
  const { campaigns, isLoading, error } = useAppSelector((state) => state.campaigns);
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    objective: '',
    brandId: '',
  });

  useEffect(() => {
    if (selectedBrandId) {
      dispatch(fetchCampaigns(selectedBrandId));
    }
  }, [dispatch, selectedBrandId]);

  useEffect(() => {
    if (selectedBrandId) {
      setNewCampaign((prev) => ({ ...prev, brandId: selectedBrandId }));
    }
  }, [selectedBrandId]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;
    const result = await dispatch(createCampaign({ ...newCampaign, brandId: selectedBrandId }));
    if (createCampaign.fulfilled.match(result)) {
      setShowCreateModal(false);
      setNewCampaign({ name: '', objective: '', brandId: selectedBrandId });
      dispatch(fetchCampaigns(selectedBrandId));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!selectedBrandId) return;
    if (confirm(t('campaigns_confirm_delete'))) {
      await dispatch(deleteCampaign({ id, brandId: selectedBrandId }));
      dispatch(fetchCampaigns(selectedBrandId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('campaigns_title')}</h1>
            <p className="mt-2 text-gray-600">{t('campaigns_desc')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{t('campaigns_new')}</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{t('campaigns_no_campaigns')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('campaigns_create_first')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status || 'DRAFT'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {t('campaigns_objective')} {campaign.objective || t('campaigns_not_specified')}
                </p>

                {campaign.scheduledAt && (
                  <p className="text-xs text-gray-500 mb-4">
                    {t('campaigns_scheduled')} {new Date(campaign.scheduledAt).toLocaleDateString()}
                  </p>
                )}

                {expandedCampaign === campaign.id && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                    <p><span className="text-gray-500">{t('campaigns_id')}</span> <span className="text-gray-700 font-mono text-xs">{campaign.id}</span></p>
                    <p><span className="text-gray-500">{t('campaigns_brand')}</span> <span className="text-gray-700">{selectedBrand?.name || campaign.brandId}</span></p>
                    <p><span className="text-gray-500">{t('campaigns_status')}</span> <span className="text-gray-700">{campaign.status || 'DRAFT'}</span></p>
                    <p><span className="text-gray-500">{t('campaigns_objective')}</span> <span className="text-gray-700">{campaign.objective || '—'}</span></p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    {expandedCampaign === campaign.id ? t('campaigns_hide') : t('campaigns_view_details')}
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('campaigns_modal_title')}</h2>

              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('campaigns_name_label')}
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('campaigns_name_placeholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('campaigns_objective_label')}
                  </label>
                  <select
                    value={newCampaign.objective}
                    onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('campaigns_select_objective')}</option>
                    <option value="AWARENESS">{t('campaigns_obj_awareness')}</option>
                    <option value="ENGAGEMENT">{t('campaigns_obj_engagement')}</option>
                    <option value="CONVERSION">{t('campaigns_obj_conversion')}</option>
                    <option value="RETENTION">{t('campaigns_obj_retention')}</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {t('common_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('campaigns_create_btn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
