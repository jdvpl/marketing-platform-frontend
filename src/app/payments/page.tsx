'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import {
  fetchPlans,
  fetchSubscription,
  fetchPaymentHistory,
  createCheckout,
  createPortalSession,
  clearCheckoutUrl,
  clearPortalUrl,
  Plan,
} from '@/features/payments/paymentsSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UsageMeter from '@/components/UsageMeter';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircleIcon,
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  SparklesIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  TRIALING: 'bg-blue-100 text-blue-700',
  PAST_DUE: 'bg-yellow-100 text-yellow-700',
  CANCELED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const INVOICE_COLORS: Record<string, string> = {
  paid: 'text-green-600',
  open: 'text-yellow-600',
  void: 'text-gray-400',
  uncollectible: 'text-red-600',
};

const PLAN_COLORS: Record<number, string> = {
  0: 'from-gray-400 to-gray-600',
  1: 'from-blue-500 to-cyan-500',
  2: 'from-purple-600 to-pink-500',
  3: 'from-orange-500 to-red-500',
};

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { selectedCompanyId, selectedCompany } = useCompanyBrand();
  const { t } = useTranslation();
  const { plans, subscription, paymentHistory, isLoading, isCreatingCheckout, error, checkoutUrl, portalUrl } =
    useAppSelector((state) => state.payments);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(fetchSubscription(selectedCompanyId));
      dispatch(fetchPaymentHistory(selectedCompanyId));
    }
  }, [dispatch, selectedCompanyId]);

  useEffect(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      dispatch(clearCheckoutUrl());
    }
  }, [checkoutUrl, dispatch]);

  useEffect(() => {
    if (portalUrl) {
      window.open(portalUrl, '_blank');
      dispatch(clearPortalUrl());
    }
  }, [portalUrl, dispatch]);

  const isFreePlan =
    !subscription ||
    subscription.status === 'INACTIVE' ||
    subscription.planName?.toUpperCase() === 'FREE';

  const handleSubscribe = (plan: Plan) => {
    if (!selectedCompanyId) return;
    setCheckoutPlanId(plan.id);
    dispatch(createCheckout({
      companyId: selectedCompanyId,
      planId: plan.id,
      interval: billingInterval,
      successUrl: `${window.location.origin}/payments/success`,
      cancelUrl: `${window.location.origin}/payments`,
    })).finally(() => setCheckoutPlanId(null));
  };

  const handlePortal = () => {
    if (!selectedCompanyId) return;
    dispatch(createPortalSession({
      companyId: selectedCompanyId,
      returnUrl: window.location.href,
    }));
  };

  const formatPrice = (plan: Plan) =>
    billingInterval === 'month' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);

  // Translate plan name/description/features by plan.type, with fallback to backend value.
  const getPlanName = (plan: Plan) => {
    if (!plan.type) return plan.name;
    const key = `plan_${plan.type.toLowerCase()}_name` as const;
    return t(key) || plan.name;
  };
  const getPlanDesc = (plan: Plan) => {
    if (!plan.type) return plan.description;
    const key = `plan_${plan.type.toLowerCase()}_desc` as const;
    return t(key) || plan.description;
  };
  const getPlanFeatures = (plan: Plan): string[] => {
    if (plan.type) {
      const key = `plan_${plan.type.toLowerCase()}_features` as const;
      const raw = t(key);
      if (raw) return raw.split('|').map(s => s.trim()).filter(Boolean);
    }
    return plan.features || [];
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    const key = `payments_status_${status.toLowerCase()}` as const;
    return t(key) || status;
  };
  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  const getInvoiceLabel = (status: string) => {
    const key = `payments_invoice_${status.toLowerCase()}` as const;
    return t(key) || status;
  };
  const getInvoiceColor = (status: string) => INVOICE_COLORS[status] || 'text-gray-500';

  const subStatusColor = getStatusColor(subscription?.status || 'INACTIVE');
  const subStatusLabel = getStatusLabel(subscription?.status || 'INACTIVE');

  if (!selectedCompanyId) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-20">
            <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('payments_select_company')}</h2>
            <p className="text-gray-500">{t('payments_select_company_desc')}</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('payments_title')}</h1>
              <p className="mt-1 text-gray-500">
                {selectedCompany?.name || t('common_select_company')} — {t('payments_manage')}
              </p>
            </div>
            {(subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING') && (
              <button
                onClick={handlePortal}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                {t('payments_manage')}
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Free Plan Banner */}
          {isFreePlan && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                  <GiftIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-amber-50 mb-1">{t('payments_free_plan')}</h3>
                  <p className="text-sm text-gray-600 dark:text-amber-100/80 mb-4">{t('payments_free_plan_desc')}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <UsageMeter label={t('payments_usage_brands')} current={0} limit={1} />
                    <UsageMeter label={t('payments_usage_posts')} current={0} limit={3} />
                    <UsageMeter label={t('payments_usage_ai')} current={0} limit={10} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Subscription (only for paid plans) */}
          {subscription && !isFreePlan && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('payments_current_plan')}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subStatusColor}`}>
                  {subStatusLabel}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('payments_plan_label')}</p>
                  <p className="text-lg font-bold text-gray-900">{subscription.planName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('payments_billing')}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {subscription.billingInterval === 'year' ? t('payments_billing_annual') : subscription.billingInterval === 'month' ? t('payments_billing_monthly') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('payments_next_charge')}</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('payments_amount')}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {subscription.amount != null
                      ? `$${(subscription.amount / 100).toFixed(2)} ${(subscription.currency || 'usd').toUpperCase()}`
                      : '—'}
                  </p>
                </div>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      {t('payments_cancel_notice')} {formatDate(subscription.currentPeriodEnd)}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-gray-900' : 'text-gray-400'}`}>
              {t('payments_monthly')}
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                billingInterval === 'year' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-gray-900' : 'text-gray-400'}`}>
              {t('payments_annual')}
            </span>
            {billingInterval === 'year' && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {t('payments_save20')}
              </span>
            )}
          </div>

          {/* Plans */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => {
                const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'ACTIVE';
                const isFree = plan.monthlyPrice === 0;
                const price = formatPrice(plan);
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                      plan.highlighted ? 'border-blue-500 shadow-blue-100 shadow-lg' : 'border-gray-200'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-1.5 text-xs font-semibold tracking-wide">
                        {t('payments_most_popular')}
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PLAN_COLORS[idx] || 'from-gray-400 to-gray-600'} flex items-center justify-center mb-4`}>
                        {isFree ? <GiftIcon className="h-5 w-5 text-white" /> : <CreditCardIcon className="h-5 w-5 text-white" />}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{getPlanName(plan)}</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-4">{getPlanDesc(plan)}</p>
                      <div className="mb-6">
                        {isFree ? (
                          <span className="text-4xl font-extrabold text-gray-900">{t('payments_free_price')}</span>
                        ) : (
                          <>
                            <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                            <span className="text-gray-500 text-sm">{t('payments_per_month')}</span>
                            {billingInterval === 'year' && (
                              <p className="text-xs text-green-600 font-medium mt-0.5">
                                ${plan.yearlyPrice}/{t('payments_year_save')}{(plan.monthlyPrice * 12 - plan.yearlyPrice)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {getPlanFeatures(plan).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckBadgeIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrentPlan ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
                          <CheckCircleIcon className="h-5 w-5" />
                          {t('payments_current')}
                        </div>
                      ) : isFree && isFreePlan ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-500">
                          {t('payments_current')}
                        </div>
                      ) : isFree ? null : (
                        <button
                          onClick={() => handleSubscribe(plan)}
                          disabled={isCreatingCheckout}
                          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
                            plan.highlighted
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md'
                              : 'bg-gray-900 text-white hover:bg-gray-700'
                          }`}
                        >
                          {checkoutPlanId === plan.id ? t('payments_redirecting') : isFreePlan ? t('payments_start') : t('payments_change_plan')}
                          {checkoutPlanId !== plan.id && <ArrowTopRightOnSquareIcon className="inline h-3.5 w-3.5 ml-2" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment History */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{t('payments_history_title')}</h2>
            </div>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t('payments_no_history')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-6 py-3">{t('payments_col_desc')}</th>
                      <th className="px-6 py-3">{t('payments_col_date')}</th>
                      <th className="px-6 py-3">{t('payments_col_amount')}</th>
                      <th className="px-6 py-3">{t('payments_col_status')}</th>
                      <th className="px-6 py-3">{t('payments_col_invoice')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentHistory.map((item) => {
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800">{item.description}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(item.createdAt)}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            ${(item.amount / 100).toFixed(2)} {item.currency.toUpperCase()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${getInvoiceColor(item.status)}`}>{getInvoiceLabel(item.status)}</span>
                          </td>
                          <td className="px-6 py-4">
                            {item.pdfUrl ? (
                              <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                {t('payments_faq_invoice_pdf')}
                              </a>
                            ) : item.invoiceUrl ? (
                              <a href={item.invoiceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                {t('payments_faq_invoice_view')}
                              </a>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('payments_faq_title')}</h2>
            <div className="space-y-4">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <div key={n} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <p className="font-medium text-gray-900 mb-1">{t(`payments_faq_q${n}` as const)}</p>
                  <p className="text-sm text-gray-600">{t(`payments_faq_a${n}` as const)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
