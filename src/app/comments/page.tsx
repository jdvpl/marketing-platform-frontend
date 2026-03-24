'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { useCompanyBrand } from '@/hooks/useCompanyBrand';
import { fetchBrandComments, replyToComment, clearReplySuccess, PostComment } from '@/features/comments/commentsSlice';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  MinusCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const PROVIDER_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  META: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Meta' },
  TIKTOK: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'TikTok' },
  YOUTUBE: { bg: 'bg-red-100', text: 'text-red-700', label: 'YouTube' },
};

const PROVIDER_TABS = [
  { value: '', label: 'Todos' },
  { value: 'META', label: 'Meta' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
];

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `hace ${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `hace ${diffMonths}mes${diffMonths > 1 ? 'es' : ''}`;
}

function getSentimentIcon(sentiment?: string) {
  switch (sentiment?.toUpperCase()) {
    case 'POSITIVE':
      return <FaceSmileIcon className="h-4 w-4 text-green-500" />;
    case 'NEGATIVE':
      return <FaceFrownIcon className="h-4 w-4 text-red-500" />;
    case 'NEUTRAL':
      return <MinusCircleIcon className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
}

function CommentCard({
  comment,
  onReply,
  isReplying,
  replyingTo,
}: {
  comment: PostComment;
  onReply: (commentId: string, provider: string, text: string) => void;
  isReplying: boolean;
  replyingTo: string | null;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const provider = PROVIDER_BADGES[comment.provider];

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply(comment.externalCommentId, comment.provider, replyText.trim());
    setReplyText('');
    setShowReplyInput(false);
  };

  const isThisReplying = isReplying && replyingTo === comment.externalCommentId;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all ${comment.isReply ? 'ml-8 border-l-2 border-l-blue-200' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.authorAvatarUrl ? (
          <img
            src={comment.authorAvatarUrl}
            alt={comment.authorName || 'Avatar'}
            className="h-9 w-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <UserCircleIcon className="h-9 w-9 text-gray-300 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {comment.authorName || 'Usuario desconocido'}
              </span>
              {provider && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${provider.bg} ${provider.text}`}>
                  {provider.label}
                </span>
              )}
              {getSentimentIcon(comment.sentiment)}
            </div>
            {comment.commentedAt && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                <ClockIcon className="h-3 w-3" />
                {timeAgo(comment.commentedAt)}
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap break-words">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HeartIcon className="h-3.5 w-3.5" />
              {comment.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
              {comment.replyCount}
            </span>
            {!comment.isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                Responder
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-3 flex items-start gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={2}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || isThisReplying}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 text-sm"
              >
                {isThisReplying ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsPage() {
  const dispatch = useAppDispatch();
  const { selectedBrandId } = useCompanyBrand();
  const { comments, isLoading, isReplying, replySuccess, error } = useAppSelector((s) => s.comments);

  const [providerFilter, setProviderFilter] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBrandId) return;
    dispatch(fetchBrandComments({
      brandId: selectedBrandId,
      provider: providerFilter || undefined,
    }));
  }, [dispatch, selectedBrandId, providerFilter]);

  useEffect(() => {
    if (replySuccess) {
      dispatch(clearReplySuccess());
      // Refresh comments after successful reply
      if (selectedBrandId) {
        dispatch(fetchBrandComments({
          brandId: selectedBrandId,
          provider: providerFilter || undefined,
        }));
      }
    }
  }, [replySuccess, dispatch, selectedBrandId, providerFilter]);

  const handleReply = (externalCommentId: string, provider: string, text: string) => {
    if (!selectedBrandId) return;
    setReplyingTo(externalCommentId);
    dispatch(replyToComment({
      brandId: selectedBrandId,
      provider,
      externalCommentId,
      replyText: text,
    }));
  };

  // Filter comments for display (only top-level, then show replies nested)
  const filteredComments = useMemo(() => {
    return comments.filter((c) => !c.isHidden);
  }, [comments]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredComments.length;
    const positive = filteredComments.filter((c) => c.sentiment?.toUpperCase() === 'POSITIVE').length;
    const negative = filteredComments.filter((c) => c.sentiment?.toUpperCase() === 'NEGATIVE').length;
    const neutral = filteredComments.filter((c) => c.sentiment?.toUpperCase() === 'NEUTRAL').length;
    return { total, positive, negative, neutral };
  }, [filteredComments]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="h-7 w-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{"Gesti\u00f3n de Comentarios"}</h1>
                <p className="text-sm text-gray-500">Gestiona y responde los comentarios de tus redes sociales</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total comentarios', value: stats.total, icon: ChatBubbleLeftRightIcon, color: 'text-blue-600' },
              { label: 'Positivos', value: stats.positive, icon: FaceSmileIcon, color: 'text-green-600' },
              { label: 'Negativos', value: stats.negative, icon: FaceFrownIcon, color: 'text-red-500' },
              { label: 'Neutrales', value: stats.neutral, icon: MinusCircleIcon, color: 'text-gray-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Provider tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            {PROVIDER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setProviderFilter(tab.value)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  providerFilter === tab.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">{"No hay comentarios a\u00fan"}</h3>
              <p className="text-xs text-gray-500">
                {"Los comentarios se sincronizar\u00e1n autom\u00e1ticamente desde tus redes sociales conectadas."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  isReplying={isReplying}
                  replyingTo={replyingTo}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
