'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { connectSocialAccount } from '@/features/social/socialSlice';

interface ConnectSocialButtonProps {
  brandId: string;
}

const socialProviders = [
  { id: 'META', name: 'Meta (Facebook/Instagram)', icon: '📘', color: 'blue' },
  { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: 'gray' },
  { id: 'YOUTUBE', name: 'YouTube', icon: '📺', color: 'red' },
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
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              {socialProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleConnect(provider.id)}
                  className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {provider.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
