import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PostComment {
  id: string;
  brandId: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  externalPostId: string;
  externalCommentId: string;
  parentCommentId?: string;
  authorName?: string;
  authorProfileUrl?: string;
  authorAvatarUrl?: string;
  content: string;
  likeCount: number;
  replyCount: number;
  sentiment?: string;
  isReply: boolean;
  isHidden: boolean;
  commentedAt?: string;
}

interface CommentsState {
  comments: PostComment[];
  isLoading: boolean;
  isFetching: boolean;
  isReplying: boolean;
  replySuccess: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  comments: [],
  isLoading: false,
  isFetching: false,
  isReplying: false,
  replySuccess: false,
  error: null,
};

export const fetchBrandComments = createAsyncThunk(
  'comments/fetchBrand',
  async (params: { brandId: string; provider?: string }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.provider) qs.set('provider', params.provider);
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await fetch(`/api/comments/brand/${params.brandId}${queryString}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar comentarios');
      return (data.comments || data) as PostComment[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchPostComments = createAsyncThunk(
  'comments/fetchPost',
  async (params: { brandId: string; provider: string; externalPostId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/comments/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al obtener comentarios del post');
      return (data.comments || data) as PostComment[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const replyToComment = createAsyncThunk(
  'comments/reply',
  async (params: { brandId: string; provider: string; externalCommentId: string; replyText: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/comments/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al responder comentario');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearReplySuccess: (state) => { state.replySuccess = false; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchBrandComments
      .addCase(fetchBrandComments.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBrandComments.fulfilled, (state, action: PayloadAction<PostComment[]>) => {
        state.isLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchBrandComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchPostComments
      .addCase(fetchPostComments.pending, (state) => { state.isFetching = true; state.error = null; })
      .addCase(fetchPostComments.fulfilled, (state, action: PayloadAction<PostComment[]>) => {
        state.isFetching = false;
        state.comments = action.payload;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload as string;
      })
      // replyToComment
      .addCase(replyToComment.pending, (state) => { state.isReplying = true; state.replySuccess = false; state.error = null; })
      .addCase(replyToComment.fulfilled, (state) => {
        state.isReplying = false;
        state.replySuccess = true;
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.isReplying = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReplySuccess, clearError } = commentsSlice.actions;
export default commentsSlice.reducer;
