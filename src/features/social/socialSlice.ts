import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface SocialAccount {
  id: string;
  brandId: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  providerUserId: string;
  providerUsername: string;
  tokenExpiresAt: string;
  scopes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublishRequest {
  brandId: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  content: string;
  mediaUrls?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  target?: {
    pageId?: string;
    targetType?: string;
  };
}

export interface PublishResponse {
  success: boolean;
  message: string;
  externalPostId?: string;
  provider: string;
  accountId: string;
  postUrl?: string;
  publishedAt: string;
  error?: {
    code: string;
    message: string;
    details: string;
  };
}

export interface ScheduleRequest {
  campaignId: string;
  brandId?: string;
  provider: 'META' | 'TIKTOK' | 'YOUTUBE';
  content: string;
  scheduledAt: string;
}

export interface ScheduledPost {
  id: string;
  campaignId: string;
  brandId?: string;
  provider: string;
  content: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'POSTING' | 'POSTED' | 'FAILED';
  retryCount: number;
  externalPostId?: string;
  errorMessage?: string;
  postedAt?: string;
  createdAt: string;
}

interface SocialState {
  accounts: SocialAccount[];
  scheduledPosts: ScheduledPost[];
  calendarPosts: ScheduledPost[];
  isLoading: boolean;
  isLoadingCalendar: boolean;
  isPublishing: boolean;
  isScheduling: boolean;
  error: string | null;
  publishSuccess: PublishResponse | null;
}

const initialState: SocialState = {
  accounts: [],
  scheduledPosts: [],
  calendarPosts: [],
  isLoading: false,
  isLoadingCalendar: false,
  isPublishing: false,
  isScheduling: false,
  error: null,
  publishSuccess: null,
};

// Obtener cuentas sociales
export const fetchSocialAccounts = createAsyncThunk(
  'social/fetchAccounts',
  async (brandId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/social/accounts?brandId=${brandId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Error al obtener cuentas');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

// Conectar cuenta social
export const connectSocialAccount = createAsyncThunk(
  'social/connect',
  async ({ provider, brandId }: { provider: string; brandId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, brandId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Error al conectar cuenta');
      }

      // Redirigir al OAuth URL
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

// Publicar contenido
export const publishContent = createAsyncThunk(
  'social/publish',
  async (publishData: PublishRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Error al publicar');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

// Programar publicación
export const schedulePost = createAsyncThunk(
  'social/schedule',
  async (scheduleData: ScheduleRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Error al programar');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

// Obtener publicaciones para el calendario
export const fetchCalendarPosts = createAsyncThunk(
  'social/fetchCalendar',
  async ({ brandId, start, end }: { brandId: string; start: string; end: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ brandId, start, end });
      const response = await fetch(`/api/social/calendar?${params}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar calendario');
      return data as ScheduledPost[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

// Obtener publicaciones programadas
export const fetchScheduledPosts = createAsyncThunk(
  'social/fetchScheduled',
  async (campaignId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/social/schedule?campaignId=${campaignId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Error al obtener programadas');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    clearPublishSuccess: (state) => {
      state.publishSuccess = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchSocialAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSocialAccounts.fulfilled, (state, action: PayloadAction<SocialAccount[]>) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchSocialAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Connect account
      .addCase(connectSocialAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectSocialAccount.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(connectSocialAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Publish content
      .addCase(publishContent.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
        state.publishSuccess = null;
      })
      .addCase(publishContent.fulfilled, (state, action: PayloadAction<PublishResponse>) => {
        state.isPublishing = false;
        state.publishSuccess = action.payload;
      })
      .addCase(publishContent.rejected, (state, action) => {
        state.isPublishing = false;
        state.error = action.payload as string;
      })
      // Schedule post
      .addCase(schedulePost.pending, (state) => {
        state.isScheduling = true;
        state.error = null;
      })
      .addCase(schedulePost.fulfilled, (state, action: PayloadAction<ScheduledPost>) => {
        state.isScheduling = false;
        state.scheduledPosts.push(action.payload);
      })
      .addCase(schedulePost.rejected, (state, action) => {
        state.isScheduling = false;
        state.error = action.payload as string;
      })
      // Fetch scheduled posts
      .addCase(fetchScheduledPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduledPosts.fulfilled, (state, action: PayloadAction<ScheduledPost[]>) => {
        state.isLoading = false;
        state.scheduledPosts = action.payload;
      })
      .addCase(fetchScheduledPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Calendar posts
      .addCase(fetchCalendarPosts.pending, (state) => {
        state.isLoadingCalendar = true;
      })
      .addCase(fetchCalendarPosts.fulfilled, (state, action: PayloadAction<ScheduledPost[]>) => {
        state.isLoadingCalendar = false;
        state.calendarPosts = action.payload;
      })
      .addCase(fetchCalendarPosts.rejected, (state, action) => {
        state.isLoadingCalendar = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPublishSuccess, clearError } = socialSlice.actions;
export default socialSlice.reducer;
