'use client';

import { useMemo } from 'react';
import { ScheduledPost } from '@/features/social/socialSlice';

const PROVIDER_COLORS: Record<string, string> = {
  META: 'bg-blue-500',
  TIKTOK: 'bg-gray-800',
  YOUTUBE: 'bg-red-500',
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'opacity-100',
  POSTING: 'opacity-75 animate-pulse',
  POSTED: 'opacity-60',
  FAILED: 'opacity-100 ring-1 ring-red-400',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  posts: ScheduledPost[];
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}

export default function CalendarGrid({ year, month, posts, onDayClick, selectedDate }: CalendarGridProps) {
  const { days, startOffset } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6;

    const days: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return { days, startOffset: offset };
  }, [year, month]);

  const postsByDay = useMemo(() => {
    const map: Record<number, ScheduledPost[]> = {};
    posts.forEach(post => {
      const date = new Date(post.scheduledAt);
      if (date.getMonth() === month && date.getFullYear() === year) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(post);
      }
    });
    return map;
  }, [posts, month, year]);

  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date: Date) =>
    selectedDate &&
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50 min-h-[100px] p-1" />
        ))}

        {/* Day cells */}
        {days.map(date => {
          const dayPosts = postsByDay[date.getDate()] || [];
          const _isToday = isToday(date);
          const _isSelected = isSelected(date);

          return (
            <div
              key={date.getDate()}
              onClick={() => onDayClick(date)}
              className={`bg-white min-h-[100px] p-1.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                _isSelected ? 'ring-2 ring-inset ring-blue-500' : ''
              }`}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    _isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayPosts.length > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {dayPosts.length}
                  </span>
                )}
              </div>

              {/* Post indicators */}
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(post => (
                  <div
                    key={post.id}
                    className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] ${STATUS_STYLES[post.status] || ''}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PROVIDER_COLORS[post.provider] || 'bg-gray-400'}`} />
                    <span className="truncate text-gray-700">
                      {post.content.substring(0, 20)}
                    </span>
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-gray-400 pl-1">
                    +{dayPosts.length - 3} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
