import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Upload failed');
      }
      return data;
    } catch {
      return rejectWithValue('Upload failed');
    }
  }
);

export const deleteFile = createAsyncThunk<{ success: boolean }, string>(
  'upload/deleteFile',
  async (fileUrl, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || 'Delete failed');
      }
      return data;
    } catch {
      return rejectWithValue('Delete failed');
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
