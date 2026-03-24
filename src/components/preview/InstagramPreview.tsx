'use client';

import Image from 'next/image';

interface InstagramPreviewProps {
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  hashtags?: string;
  likesCount?: number;
}

export default function InstagramPreview({
  username,
  avatarUrl,
  content,
  mediaUrl,
  hashtags,
  likesCount = 128,
}: InstagramPreviewProps) {
  const formattedLikes = likesCount.toLocaleString();

  return (
    <div className="w-full max-w-[375px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[1px]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={username}
                  width={28}
                  height={28}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-600">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-900">{username || 'username'}</span>
        </div>
        <button className="text-gray-900">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Image Area */}
      <div className="w-full aspect-[4/5] bg-gray-100 relative">
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt="Post"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <span className="text-sm">Vista previa de imagen</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Heart */}
            <svg className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {/* Comment */}
            <svg className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            {/* Share */}
            <svg className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          {/* Bookmark */}
          <svg className="w-6 h-6 text-gray-900 cursor-pointer hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-gray-900">{formattedLikes} Me gusta</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-1">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{username || 'username'}</span>{' '}
          {content || 'Escribe tu contenido aqui...'}
        </p>
        {hashtags && (
          <p className="text-sm text-blue-500 mt-0.5">
            {hashtags}
          </p>
        )}
      </div>

      {/* View comments */}
      <div className="px-3 pb-1">
        <p className="text-sm text-gray-400 cursor-pointer">Ver los 24 comentarios</p>
      </div>

      {/* Time ago */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-gray-400 uppercase">Hace 2 horas</p>
      </div>
    </div>
  );
}
