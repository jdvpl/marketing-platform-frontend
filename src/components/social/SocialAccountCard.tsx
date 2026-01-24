'use client';

import { SocialAccount } from '@/features/social/socialSlice';

interface SocialAccountCardProps {
  account: SocialAccount;
  onDisconnect?: (id: string) => void;
}

const providerIcons: Record<string, string> = {
  META: '📘',
  TIKTOK: '🎵',
  YOUTUBE: '📺',
};

const providerNames: Record<string, string> = {
  META: 'Meta (Facebook/Instagram)',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
};

export default function SocialAccountCard({ account, onDisconnect }: SocialAccountCardProps) {
  const isExpiringSoon = () => {
    if (!account.tokenExpiresAt) return false;
    const expiryDate = new Date(account.tokenExpiresAt);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{providerIcons[account.provider]}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {providerNames[account.provider]}
            </h3>
            <p className="text-sm text-gray-600">@{account.providerUsername}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {account.active ? (
            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
              Activa
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
              Inactiva
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Conectada:</span>
          <span className="text-gray-900">{formatDate(account.createdAt)}</span>
        </div>
        {account.tokenExpiresAt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Token expira:</span>
            <span className={isExpiringSoon() ? 'text-orange-600 font-medium' : 'text-gray-900'}>
              {formatDate(account.tokenExpiresAt)}
            </span>
          </div>
        )}
        {account.scopes && (
          <div className="text-sm">
            <span className="text-gray-600">Permisos:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {account.scopes.split(',').map((scope, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                >
                  {scope.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isExpiringSoon() && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-800">
            El token expirará pronto. Considera reconectar la cuenta.
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        {account.active && onDisconnect && (
          <button
            onClick={() => onDisconnect(account.id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Desconectar
          </button>
        )}
      </div>
    </div>
  );
}
