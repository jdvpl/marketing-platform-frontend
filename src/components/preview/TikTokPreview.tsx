'use client';

import Image from 'next/image';

interface TikTokPreviewProps {
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  hashtags?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
}

function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function TikTokPreview({
  username,
  avatarUrl,
  content,
  mediaUrl,
  hashtags,
  likesCount = 4523,
  commentsCount = 234,
  sharesCount = 89,
}: TikTokPreviewProps) {
  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Phone frame */}
      <div className="relative rounded-[2rem] border-[3px] border-gray-800 bg-black overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
        {/* Video/Background area */}
        <div className="absolute inset-0">
          {mediaUrl ? (
            <Image
              src={mediaUrl}
              alt="Video"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-gray-800 via-gray-900 to-black flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Top bar - "Following | For You" */}
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-4 z-10">
          <span className="text-white/60 text-sm font-medium">Siguiendo</span>
          <span className="text-white text-sm font-bold border-b-2 border-white pb-0.5">Para ti</span>
        </div>

        {/* Right side icons */}
        <div className="absolute right-2 bottom-28 flex flex-col items-center gap-5 z-10">
          {/* Avatar */}
          <div className="relative mb-2">
            <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={username}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">+</span>
            </div>
          </div>

          {/* Heart */}
          <div className="flex flex-col items-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="text-white text-[11px] mt-0.5">{formatCount(likesCount)}</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-[11px] mt-0.5">{formatCount(commentsCount)}</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-[11px] mt-0.5">{formatCount(sharesCount)}</span>
          </div>

          {/* Music disc */}
          <div className="w-9 h-9 rounded-full bg-gray-800 border-[3px] border-gray-600 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <div className="w-3 h-3 rounded-full bg-gray-400" />
          </div>
        </div>

        {/* Bottom-left overlay: username, caption, hashtags, music */}
        <div className="absolute bottom-4 left-3 right-16 z-10">
          <p className="text-white font-bold text-sm mb-1">@{username || 'username'}</p>
          <p className="text-white text-xs leading-relaxed mb-1.5">
            {content || 'Escribe tu contenido aqui...'}
          </p>
          {hashtags && (
            <p className="text-white text-xs font-medium mb-2">
              {hashtags}
            </p>
          )}
          {/* Music bar */}
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" clipRule="evenodd" />
            </svg>
            <div className="overflow-hidden w-40">
              <p className="text-white text-[11px] whitespace-nowrap animate-marquee">
                Sonido original - {username || 'username'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee animation style */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 6s linear infinite;
        }
      `}</style>
    </div>
  );
}
