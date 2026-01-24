'use client';

import { useState, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { schedulePost } from '@/features/social/socialSlice';

interface ScheduleFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

export default function ScheduleForm({ campaignId, onSuccess }: ScheduleFormProps) {
  const dispatch = useAppDispatch();
  const { isScheduling, error } = useAppSelector((state) => state.social);

  const [content, setContent] = useState('');
  const [provider, setProvider] = useState<'META' | 'TIKTOK' | 'YOUTUBE'>('META');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !scheduledDate || !scheduledTime) {
      return;
    }

    const scheduledAt = `${scheduledDate}T${scheduledTime}:00`;

    const scheduleData = {
      campaignId,
      provider,
      content: content.trim(),
      scheduledAt,
    };

    const result = await dispatch(schedulePost(scheduleData));

    if (schedulePost.fulfilled.match(result)) {
      setContent('');
      setScheduledDate('');
      setScheduledTime('');
      if (onSuccess) onSuccess();
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Programar Publicación</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Red Social
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="META">Meta (Facebook/Instagram)</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Escribe tu mensaje aquí..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {content.length} caracteres
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDateTime()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isScheduling || !content.trim() || !scheduledDate || !scheduledTime}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isScheduling ? 'Programando...' : 'Programar Publicación'}
        </button>
      </form>
    </div>
  );
}
