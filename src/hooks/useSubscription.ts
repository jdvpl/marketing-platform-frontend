'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchSubscription } from '@/features/payments/paymentsSlice';
import { selectSelectedCompanyId } from '@/features/context/contextSlice';

export interface PlanLimits {
  brandsLimit: number;
  postsDailyLimit: number;
  aiMonthlyLimit: number;
}

const FREE_LIMITS: PlanLimits = {
  brandsLimit: 1,
  postsDailyLimit: 3,
  aiMonthlyLimit: 10,
};

export function useSubscription() {
  const dispatch = useAppDispatch();
  const companyId = useAppSelector(selectSelectedCompanyId);
  const { subscription, isLoading } = useAppSelector((s) => s.payments);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchSubscription(companyId));
    }
  }, [companyId, dispatch]);

  const isFreePlan =
    !subscription ||
    subscription.status === 'INACTIVE' ||
    subscription.planName?.toUpperCase() === 'FREE';

  const isActive =
    subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';

  const planName = subscription?.planName || 'Free';

  return {
    subscription,
    isLoading,
    isFreePlan,
    isActive,
    planName,
    limits: FREE_LIMITS, // In a real app, fetch limits from the plan itself
  };
}
