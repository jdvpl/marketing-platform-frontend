'use client';

import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface UpgradeBannerProps {
  message?: string;
  compact?: boolean;
}

export default function UpgradeBanner({
  message = 'Actualiza tu plan para desbloquear todas las funciones',
  compact = false,
}: UpgradeBannerProps) {
  if (compact) {
    return (
      <Link
        href="/payments"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
      >
        <SparklesIcon className="h-3.5 w-3.5" />
        Upgrade
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
          <SparklesIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Plan Gratuito</p>
          <p className="text-xs text-gray-600">{message}</p>
        </div>
      </div>
      <Link
        href="/payments"
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
      >
        Ver Planes
      </Link>
    </div>
  );
}
