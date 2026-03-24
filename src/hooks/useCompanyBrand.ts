'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { fetchCompanies } from '@/features/companies/companiesSlice';
import { fetchBrands } from '@/features/brands/brandsSlice';
import {
  setSelectedCompanyId,
  setSelectedBrandId,
  selectSelectedCompany,
  selectSelectedBrand,
  selectSelectedCompanyId,
  selectSelectedBrandId,
} from '@/features/context/contextSlice';

export function useCompanyBrand() {
  const dispatch = useAppDispatch();
  const { companies, isLoading: companiesLoading, error: companiesError } = useAppSelector((s) => s.companies);
  const { brands, isLoading: brandsLoading } = useAppSelector((s) => s.brands);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const selectedCompanyId = useAppSelector(selectSelectedCompanyId);
  const selectedBrandId = useAppSelector(selectSelectedBrandId);
  const selectedCompany = useAppSelector(selectSelectedCompany);
  const selectedBrand = useAppSelector(selectSelectedBrand);
  const fetchAttempted = useRef(false);

  // Load companies on mount (only once, only if authenticated)
  useEffect(() => {
    if (isAuthenticated && !fetchAttempted.current && companies.length === 0 && !companiesLoading && !companiesError) {
      fetchAttempted.current = true;
      dispatch(fetchCompanies());
    }
  }, [dispatch, companies.length, companiesLoading, companiesError, isAuthenticated]);

  // Auto-select first company if none selected
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      const saved = localStorage.getItem('selectedCompanyId');
      const validSaved = saved && companies.some((c) => c.id === saved);
      dispatch(setSelectedCompanyId(validSaved ? saved : companies[0].id));
    }
  }, [companies, selectedCompanyId, dispatch]);

  // Load brands when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      dispatch(fetchBrands(selectedCompanyId));
    }
  }, [selectedCompanyId, dispatch]);

  // Auto-select first brand if none selected or current brand doesn't belong to company
  useEffect(() => {
    if (brands.length > 0) {
      const currentBrandBelongs = selectedBrandId && brands.some((b) => b.id === selectedBrandId);
      if (!currentBrandBelongs) {
        const saved = localStorage.getItem('selectedBrandId');
        const validSaved = saved && brands.some((b) => b.id === saved);
        dispatch(setSelectedBrandId(validSaved ? saved : brands[0].id));
      }
    } else if (brands.length === 0 && !brandsLoading && selectedBrandId) {
      dispatch(setSelectedBrandId(null));
    }
  }, [brands, selectedBrandId, brandsLoading, dispatch]);

  const switchCompany = useCallback(
    (companyId: string) => {
      localStorage.setItem('selectedCompanyId', companyId);
      dispatch(setSelectedCompanyId(companyId));
      // Brand will auto-reset via the useEffect above
    },
    [dispatch]
  );

  const switchBrand = useCallback(
    (brandId: string) => {
      localStorage.setItem('selectedBrandId', brandId);
      dispatch(setSelectedBrandId(brandId));
    },
    [dispatch]
  );

  return {
    // Data
    companies,
    brands,
    selectedCompany,
    selectedBrand,
    selectedCompanyId,
    selectedBrandId,
    // Loading
    isLoading: companiesLoading || brandsLoading,
    companiesLoading,
    brandsLoading,
    // Actions
    switchCompany,
    switchBrand,
  };
}
