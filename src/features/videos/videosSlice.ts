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
  createdAt: string;
  updatedAt: string;
}

interface VideosState {
  videos: Video[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadSuccess: boolean;
}

const initialState: VideosState = {
  videos: [],
  isLoading: false,
  isUploading: false,
  error: null,
  uploadSuccess: false,
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

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearUploadSuccess: (state) => { state.uploadSuccess = false; },
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
      });
  },
});

export const { clearUploadSuccess, clearError } = videosSlice.actions;
export default videosSlice.reducer;
