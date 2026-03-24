'use client';

import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { ChevronDownIcon, BuildingOfficeIcon, TagIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';

export default function CompanyBrandSelector() {
  const {
    companies,
    brands,
    selectedCompany,
    selectedBrand,
    switchCompany,
    switchBrand,
    isLoading,
  } = useCompanyBrand();

  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setShowCompanyDropdown(false);
      }
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setShowBrandDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (companies.length === 0 && !isLoading) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Company Selector */}
      <div ref={companyRef} className="relative">
        <button
          onClick={() => { setShowCompanyDropdown(!showCompanyDropdown); setShowBrandDropdown(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors max-w-[180px]"
        >
          <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate font-medium text-gray-700">
            {selectedCompany?.name || 'Empresa'}
          </span>
          <ChevronDownIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
        </button>

        {showCompanyDropdown && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => { switchCompany(company.id); setShowCompanyDropdown(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  company.id === selectedCompany?.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <BuildingOfficeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{company.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <span className="text-gray-300">/</span>

      {/* Brand Selector */}
      <div ref={brandRef} className="relative">
        <button
          onClick={() => { setShowBrandDropdown(!showBrandDropdown); setShowCompanyDropdown(false); }}
          disabled={brands.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors max-w-[180px] disabled:opacity-50"
        >
          <TagIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate font-medium text-gray-700">
            {selectedBrand?.name || 'Marca'}
          </span>
          <ChevronDownIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
        </button>

        {showBrandDropdown && brands.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => { switchBrand(brand.id); setShowBrandDropdown(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  brand.id === selectedBrand?.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <TagIcon className="h-4 w-4 flex-shrink-0" />
                <div className="truncate">
                  <span>{brand.name}</span>
                  {brand.category && (
                    <span className="text-xs text-gray-400 ml-1">({brand.category})</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
