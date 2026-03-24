import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BrandMetrics {
  brandId: string;
  summary: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    avgEngagementRate: string;
  };
  byProvider: Record<string, PostMetric[]>;
}

export interface PostMetric {
  id: string;
  campaignId: string;
  brandId: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  externalPostId?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  clicksCount: number;
  engagementRate: number;
  postedAt?: string;
  lastFetchedAt?: string;
}

export interface GrowthTrend {
  brandId: string;
  periodDays: number;
  totalFollowersGained: number;
  accounts: AccountTrend[];
}

export interface AccountTrend {
  socialAccountId: string;
  provider: string;
  followersStart: number;
  followersEnd: number;
  followersGained: number;
  growthRatePct: number;
  currentEngagementRatePct: number;
}

export interface BestTimesReport {
  brandId: string;
  provider?: string;
  topSlots: { dayOfWeek: string; hour: number; avgEngagementRate: number; postsCount: number }[];
  bestHours: { hour: number; avgEngagementRate: number; postsCount: number }[];
  bestDays: { dayOfWeek: string; avgEngagementRate: number; postsCount: number }[];
  totalPostsAnalyzed: number;
}

export interface CrossPostResult {
  brandId: string;
  content: string;
  totalProviders: number;
  successCount: number;
  failedCount: number;
  publishedAt: string;
  results: {
    success: boolean;
    provider: string;
    externalPostId?: string;
    postUrl?: string;
    error?: { code: string; message: string };
  }[];
}

interface MetricsState {
  brandMetrics: BrandMetrics | null;
  growthTrend: GrowthTrend | null;
  bestTimes: BestTimesReport | null;
  crossPostResult: CrossPostResult | null;
  isLoading: boolean;
  isCrossPosting: boolean;
  error: string | null;
}

const initialState: MetricsState = {
  brandMetrics: null,
  growthTrend: null,
  bestTimes: null,
  crossPostResult: null,
  isLoading: false,
  isCrossPosting: false,
  error: null,
};

export const fetchBrandMetrics = createAsyncThunk(
  'metrics/fetchBrand',
  async (brandId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/metrics/brand/${brandId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar métricas');
      return data as BrandMetrics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchGrowthTrend = createAsyncThunk(
  'metrics/fetchGrowth',
  async ({ brandId, days }: { brandId: string; days?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ days: String(days || 30) });
      const response = await fetch(`/api/growth/brand/${brandId}?${params}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar crecimiento');
      return data as GrowthTrend;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchBestTimes = createAsyncThunk(
  'metrics/fetchBestTimes',
  async ({ brandId, provider }: { brandId: string; provider?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (provider) params.set('provider', provider);
      const response = await fetch(`/api/growth/brand/${brandId}/best-times?${params}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar mejores horarios');
      return data as BestTimesReport;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const crossPost = createAsyncThunk(
  'metrics/crossPost',
  async (payload: { brandId: string; content: string; providers?: string[]; mediaUrls?: string[]; videoUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/social/crosspost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al publicar');
      return data as CrossPostResult;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const repost = createAsyncThunk(
  'metrics/repost',
  async (payload: { brandId: string; content: string; targetProviders: string[]; mediaUrls?: string[]; videoUrl?: string; thumbnailUrl?: string; originalPostId?: string; originalProvider?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/social/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al republicar');
      return data as CrossPostResult;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    clearCrossPostResult: (state) => { state.crossPostResult = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandMetrics.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBrandMetrics.fulfilled, (state, action: PayloadAction<BrandMetrics>) => {
        state.isLoading = false;
        state.brandMetrics = action.payload;
      })
      .addCase(fetchBrandMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGrowthTrend.fulfilled, (state, action: PayloadAction<GrowthTrend>) => {
        state.growthTrend = action.payload;
      })
      .addCase(fetchBestTimes.fulfilled, (state, action: PayloadAction<BestTimesReport>) => {
        state.bestTimes = action.payload;
      })
      .addCase(crossPost.pending, (state) => { state.isCrossPosting = true; state.error = null; state.crossPostResult = null; })
      .addCase(crossPost.fulfilled, (state, action: PayloadAction<CrossPostResult>) => {
        state.isCrossPosting = false;
        state.crossPostResult = action.payload;
      })
      .addCase(crossPost.rejected, (state, action) => {
        state.isCrossPosting = false;
        state.error = action.payload as string;
      })
      .addCase(repost.pending, (state) => { state.isCrossPosting = true; state.error = null; state.crossPostResult = null; })
      .addCase(repost.fulfilled, (state, action: PayloadAction<CrossPostResult>) => {
        state.isCrossPosting = false;
        state.crossPostResult = action.payload;
      })
      .addCase(repost.rejected, (state, action) => {
        state.isCrossPosting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCrossPostResult, clearError } = metricsSlice.actions;
export default metricsSlice.reducer;
