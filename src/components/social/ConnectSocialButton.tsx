'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { connectSocialAccount } from '@/features/social/socialSlice';

interface ConnectSocialButtonProps {
  brandId: string;
}

const socialProviders = [
  { id: 'META', name: 'Meta (Facebook/Instagram)', icon: '📘', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: 'bg-gray-50 hover:bg-gray-100 text-gray-700' },
  { id: 'YOUTUBE', name: 'YouTube', icon: '📺', color: 'bg-red-50 hover:bg-red-100 text-red-700' },
];

export default function ConnectSocialButton({ brandId }: ConnectSocialButtonProps) {
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
        <span>Conectar Red Social</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
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
                  <span className="text-sm font-semibold">{provider.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
