'use client';

import Image from 'next/image';

interface YouTubePreviewProps {
  title: string;
  channelName: string;
  avatarUrl?: string;
  description: string;
  mediaUrl?: string;
  viewsCount?: number;
}

function formatViews(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
  if (num >= 1000) return (num / 1000).toFixed(1) + ' mil';
  return num.toString();
}

export default function YouTubePreview({
  title,
  channelName,
  avatarUrl,
  description,
  mediaUrl,
  viewsCount = 15420,
}: YouTubePreviewProps) {
  return (
    <div className="w-full max-w-[375px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Thumbnail with play button overlay */}
      <div className="relative w-full aspect-video bg-gray-900">
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <svg className="w-14 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-10 bg-red-600 bg-opacity-90 rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          12:34
        </div>

        {/* YouTube red progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50">
          <div className="h-full bg-red-600 w-0" />
        </div>
      </div>

      {/* Video info */}
      <div className="p-3">
        <div className="flex gap-3">
          {/* Channel avatar */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={channelName}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(channelName || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
              {title || 'Titulo del video'}
            </h3>

            {/* Channel name + views */}
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
              <span>{channelName || 'Canal'}</span>
              {/* Verified badge */}
              <svg className="w-3.5 h-3.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs text-gray-500">
              {formatViews(viewsCount)} vistas &middot; hace 3 dias
            </div>

            {/* Description preview */}
            <p className="mt-2 text-xs text-gray-500 line-clamp-3 leading-relaxed">
              {description || 'Descripcion del video...'}
            </p>
          </div>

          {/* More button */}
          <button className="flex-shrink-0 text-gray-500 self-start">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
