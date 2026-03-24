import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface HashtagPerformance {
  id: string;
  brandId: string;
  hashtag: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  usageCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  firstUsedAt?: string;
  lastUsedAt?: string;
}

interface HashtagsState {
  hashtags: HashtagPerformance[];
  trending: HashtagPerformance[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HashtagsState = {
  hashtags: [],
  trending: [],
  isLoading: false,
  error: null,
};

export const fetchBrandHashtags = createAsyncThunk(
  'hashtags/fetchBrand',
  async (params: { brandId: string; provider?: string; limit?: number; sortBy?: string }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.provider) qs.set('provider', params.provider);
      if (params.limit) qs.set('limit', String(params.limit));
      if (params.sortBy) qs.set('sortBy', params.sortBy);
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await fetch(`/api/hashtags/brand/${params.brandId}${queryString}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar hashtags');
      return (data.hashtags || data) as HashtagPerformance[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchTrendingHashtags = createAsyncThunk(
  'hashtags/fetchTrending',
  async (params: { brandId: string; days?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.days) qs.set('days', String(params.days));
      if (params.limit) qs.set('limit', String(params.limit));
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await fetch(`/api/hashtags/brand/${params.brandId}/trending${queryString}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar hashtags trending');
      return (data.hashtags || data) as HashtagPerformance[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const hashtagsSlice = createSlice({
  name: 'hashtags',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandHashtags.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBrandHashtags.fulfilled, (state, action: PayloadAction<HashtagPerformance[]>) => {
        state.isLoading = false;
        state.hashtags = action.payload;
      })
      .addCase(fetchBrandHashtags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTrendingHashtags.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTrendingHashtags.fulfilled, (state, action: PayloadAction<HashtagPerformance[]>) => {
        state.isLoading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingHashtags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = hashtagsSlice.actions;
export default hashtagsSlice.reducer;
