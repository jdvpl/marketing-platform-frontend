import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Video {
  id: string;
  brandId: string;
  companyId: string;
  title: string;
  description?: string;
  storageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  format?: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  providerOptimized?: 'META' | 'TIKTOK' | 'YOUTUBE' | 'ALL';
  tags?: string;
  sourceVideoId?: string;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TextOverlayParams {
  text: string;
  position: 'top' | 'center' | 'bottom';
  fontSize: number;
  fontColor: string;
  showFromSeconds: number;
  showToSeconds: number;
}

export interface VideoSubtitle {
  id: string;
  videoId: string;
  brandId: string;
  language: string;
  subtitleUrl?: string;
  subtitleContent?: string;
  format: 'SRT' | 'VTT' | 'ASS';
  status: 'PENDING' | 'GENERATING' | 'READY' | 'FAILED';
  generatedBy: 'MANUAL' | 'AI' | 'UPLOAD';
  createdAt: string;
}

export interface VideoProcessParams {
  brandId: string;
  companyId: string;
  title: string;
  trimStartSeconds?: number;
  trimEndSeconds?: number;
  aspectRatio?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: boolean;
  sepia?: number;
  blur?: number;
  textOverlays?: TextOverlayParams[];
  providerOptimized?: string;
  thumbnailAtSeconds?: number;
}

interface VideosState {
  videos: Video[];
  isLoading: boolean;
  isUploading: boolean;
  isProcessing: boolean;
  processingVideoId: string | null;
  processSuccess: boolean;
  error: string | null;
  uploadSuccess: boolean;
  subtitles: VideoSubtitle[];
  isLoadingSubtitles: boolean;
}

const initialState: VideosState = {
  videos: [],
  isLoading: false,
  isUploading: false,
  isProcessing: false,
  processingVideoId: null,
  processSuccess: false,
  error: null,
  uploadSuccess: false,
  subtitles: [],
  isLoadingSubtitles: false,
};

export const fetchVideos = createAsyncThunk(
  'videos/fetchAll',
  async ({ brandId, provider }: { brandId: string; provider?: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ brandId });
      if (provider) params.set('provider', provider);
      const response = await fetch(`/api/videos?${params}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar videos');
      return data as Video[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'videos/upload',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al subir video');
      return data as Video;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'videos/delete',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Error al eliminar video');
      }
      return videoId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const processVideo = createAsyncThunk(
  'videos/process',
  async ({ videoId, params }: { videoId: string; params: VideoProcessParams }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al procesar video');
      return data as Video;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchVideoById = createAsyncThunk(
  'videos/fetchById',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar video');
      return data as Video;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchVideoSubtitles = createAsyncThunk(
  'videos/fetchSubtitles',
  async (videoId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/subtitles`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar subtitulos');
      return data as VideoSubtitle[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const createSubtitle = createAsyncThunk(
  'videos/createSubtitle',
  async (
    { videoId, brandId, language, subtitleContent, format }: {
      videoId: string;
      brandId: string;
      language: string;
      subtitleContent: string;
      format: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/subtitles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, language, subtitleContent, format }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al crear subtitulos');
      return data as VideoSubtitle;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const burnSubtitles = createAsyncThunk(
  'videos/burnSubtitles',
  async ({ videoId, subtitleId }: { videoId: string; subtitleId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/subtitles/${subtitleId}/burn`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al quemar subtitulos');
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearUploadSuccess: (state) => { state.uploadSuccess = false; },
    clearProcessSuccess: (state) => { state.processSuccess = false; state.processingVideoId = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadVideo.pending, (state) => { state.isUploading = true; state.error = null; state.uploadSuccess = false; })
      .addCase(uploadVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isUploading = false;
        state.uploadSuccess = true;
        state.videos.unshift(action.payload);
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteVideo.fulfilled, (state, action: PayloadAction<string>) => {
        state.videos = state.videos.filter(v => v.id !== action.payload);
      })
      // Process video
      .addCase(processVideo.pending, (state) => {
        state.isProcessing = true;
        state.processSuccess = false;
        state.error = null;
      })
      .addCase(processVideo.fulfilled, (state, action: PayloadAction<Video>) => {
        state.isProcessing = false;
        state.processingVideoId = action.payload.id;
        state.videos.unshift(action.payload);
      })
      .addCase(processVideo.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      })
      // Fetch video by ID (for polling status)
      .addCase(fetchVideoById.pending, (state) => {
        // No UI change needed during polling
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        // Only set error if not actively polling (avoid overriding processing state)
        if (!state.processingVideoId) {
          state.error = action.payload as string;
        }
      })
      .addCase(fetchVideoById.fulfilled, (state, action: PayloadAction<Video>) => {
        const index = state.videos.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.videos[index] = action.payload;
        }
        if (state.processingVideoId === action.payload.id && action.payload.status === 'READY') {
          state.processSuccess = true;
          state.processingVideoId = null;
        }
        if (state.processingVideoId === action.payload.id && action.payload.status === 'FAILED') {
          state.error = action.payload.processingError || 'Video processing failed';
          state.processingVideoId = null;
        }
      })
      // Subtitles
      .addCase(fetchVideoSubtitles.pending, (state) => {
        state.isLoadingSubtitles = true;
      })
      .addCase(fetchVideoSubtitles.fulfilled, (state, action: PayloadAction<VideoSubtitle[]>) => {
        state.isLoadingSubtitles = false;
        state.subtitles = action.payload;
      })
      .addCase(fetchVideoSubtitles.rejected, (state, action) => {
        state.isLoadingSubtitles = false;
        state.error = action.payload as string;
      })
      .addCase(createSubtitle.fulfilled, (state, action: PayloadAction<VideoSubtitle>) => {
        state.subtitles.unshift(action.payload);
      })
      .addCase(createSubtitle.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(burnSubtitles.fulfilled, (state, action) => {
        // The burn response may contain updated video info
      })
      .addCase(burnSubtitles.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearUploadSuccess, clearProcessSuccess, clearError } = videosSlice.actions;
export default videosSlice.reducer;
