'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { connectSocialAccount } from '@/features/social/socialSlice';
import { useTranslation } from '@/hooks/useTranslation';

interface ConnectSocialButtonProps {
  brandId: string;
}

const socialProviders = [
  { id: 'META', nameKey: 'social_provider_meta', icon: '📘', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
  { id: 'TIKTOK', nameKey: 'social_provider_tiktok', icon: '🎵', color: 'bg-gray-50 hover:bg-gray-100 text-gray-700' },
  { id: 'YOUTUBE', nameKey: 'social_provider_youtube', icon: '📺', color: 'bg-red-50 hover:bg-red-100 text-red-700' },
];

export default function ConnectSocialButton({ brandId }: ConnectSocialButtonProps) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.social);

  const handleConnect = async (provider: string) => {
    setShowMenu(false);
    await dispatch(connectSocialAccount({ provider, brandId }));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        disabled={isLoading}
      >
        <span>➕</span>
        <span>{t('social_connect_button')}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700">Selecciona una red social</p>
            </div>
            <div className="p-2 space-y-1">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleConnect(provider.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${provider.color}`}
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="text-sm font-semibold">{t(provider.nameKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
