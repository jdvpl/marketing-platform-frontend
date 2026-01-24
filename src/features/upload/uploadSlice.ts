import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/client';

interface UploadState {
  isUploading: boolean;
  progress: number;
  uploadedUrl: string | null;
  error: string | null;
}

const initialState: UploadState = {
  isUploading: false,
  progress: 0,
  uploadedUrl: null,
  error: null,
};

interface UploadResponse {
  url: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export const uploadFile = createAsyncThunk<UploadResponse, { file: File; folder?: string }>(
  'upload/uploadFile',
  async ({ file, folder }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const data = await apiClient.post<UploadResponse>('/v1/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          console.log('Upload progress:', percentCompleted);
        },
      });

      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Upload failed');
    }
  }
);

export const deleteFile = createAsyncThunk<{ success: boolean }, string>(
  'upload/deleteFile',
  async (fileUrl: string, { rejectWithValue }) => {
    try {
      const data = await apiClient.post<{ success: boolean }>('/v1/storage/delete', { fileUrl });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Delete failed');
    }
  }
);

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUpload: (state) => {
      state.uploadedUrl = null;
      state.error = null;
      state.progress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.progress = 0;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadedUrl = action.payload.url;
        state.progress = 100;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
        state.progress = 0;
      })
      .addCase(deleteFile.fulfilled, (state) => {
        state.uploadedUrl = null;
      });
  },
});

export const { clearUpload } = uploadSlice.actions;
export default uploadSlice.reducer;
