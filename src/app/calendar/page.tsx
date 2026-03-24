'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchCalendarPosts, ScheduledPost } from '@/features/social/socialSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDetail from '@/components/calendar/DayDetail';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function CalendarPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { calendarPosts, isLoadingCalendar } = useAppSelector(s => s.social);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch posts when month/brand changes
  useEffect(() => {
    if (!selectedBrandId) return;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    dispatch(fetchCalendarPosts({
      brandId: selectedBrandId,
      start: start.toISOString().replace('Z', ''),
      end: end.toISOString().replace('Z', ''),
    }));
  }, [dispatch, selectedBrandId, year, month]);

  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
    setSelectedDate(null);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
    setSelectedDate(null);
  }, [month]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  }, [today]);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleCancelPost = useCallback(async (postId: string) => {
    if (!confirm('¿Cancelar esta publicación programada?')) return;
    try {
      await fetch(`/api/social/schedule/${postId}/cancel`, { method: 'POST' });
      // Refresh calendar
      if (selectedBrandId) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59);
        dispatch(fetchCalendarPosts({
          brandId: selectedBrandId,
          start: start.toISOString().replace('Z', ''),
          end: end.toISOString().replace('Z', ''),
        }));
      }
    } catch (e) {
      console.error('Error cancelling post:', e);
    }
  }, [dispatch, selectedBrandId, year, month]);

  // Posts for selected day
  const selectedDayPosts = useMemo(() => {
    if (!selectedDate) return [];
    return calendarPosts.filter(post => {
      const postDate = new Date(post.scheduledAt);
      return (
        postDate.getDate() === selectedDate.getDate() &&
        postDate.getMonth() === selectedDate.getMonth() &&
        postDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [calendarPosts, selectedDate]);

  // Stats
  const stats = useMemo(() => {
    const scheduled = calendarPosts.filter(p => p.status === 'SCHEDULED').length;
    const posted = calendarPosts.filter(p => p.status === 'POSTED').length;
    const failed = calendarPosts.filter(p => p.status === 'FAILED').length;
    return { total: calendarPosts.length, scheduled, posted, failed };
  }, [calendarPosts]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendario de Contenido</h1>
                <p className="text-sm text-gray-500">Planifica y visualiza todas tus publicaciones</p>
              </div>
            </div>
            <Link
              href="/social"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Nueva Publicación
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'text-gray-900' },
              { label: 'Programados', value: stats.scheduled, color: 'text-blue-600' },
              { label: 'Publicados', value: stats.posted, color: 'text-green-600' },
              { label: 'Fallidos', value: stats.failed, color: 'text-red-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Hoy
            </button>
          </div>

          {/* Calendar + Day detail */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {isLoadingCalendar ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <CalendarGrid
                  year={year}
                  month={month}
                  posts={calendarPosts}
                  onDayClick={handleDayClick}
                  selectedDate={selectedDate}
                />
              )}
            </div>

            <div>
              {selectedDate ? (
                <DayDetail
                  date={selectedDate}
                  posts={selectedDayPosts}
                  onCancel={handleCancelPost}
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <CalendarDaysIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">
                    Selecciona un día para ver las publicaciones programadas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
