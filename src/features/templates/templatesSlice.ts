import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ContentTemplate {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  category: string;
  contentTemplate: string;
  hashtags?: string;
  provider?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  usageCount: number;
  isPublic: boolean;
  createdAt: string;
}

interface TemplatesState {
  templates: ContentTemplate[];
  currentTemplate: ContentTemplate | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  templates: [],
  currentTemplate: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchBrandTemplates = createAsyncThunk(
  'templates/fetchBrandTemplates',
  async (params: { brandId: string; category?: string; provider?: string }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.category) qs.set('category', params.category);
      if (params.provider) qs.set('provider', params.provider);
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await fetch(`/api/templates/brand/${params.brandId}${queryString}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar templates');
      return (data.templates || data) as ContentTemplate[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (body: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al crear template');
      return data as ContentTemplate;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ templateId, body }: { templateId: string; body: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al actualizar template');
      return data as ContentTemplate;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (templateId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.error || 'Error al eliminar template');
      }
      return templateId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const useTemplate = createAsyncThunk(
  'templates/useTemplate',
  async (templateId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al usar template');
      return data as ContentTemplate;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentTemplate: (state) => { state.currentTemplate = null; },
    setCurrentTemplate: (state, action: PayloadAction<ContentTemplate>) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBrandTemplates
      .addCase(fetchBrandTemplates.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBrandTemplates.fulfilled, (state, action: PayloadAction<ContentTemplate[]>) => {
        state.isLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchBrandTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createTemplate
      .addCase(createTemplate.pending, (state) => { state.isCreating = true; state.error = null; })
      .addCase(createTemplate.fulfilled, (state, action: PayloadAction<ContentTemplate>) => {
        state.isCreating = false;
        state.templates.unshift(action.payload);
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // updateTemplate
      .addCase(updateTemplate.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateTemplate.fulfilled, (state, action: PayloadAction<ContentTemplate>) => {
        state.isLoading = false;
        const idx = state.templates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.templates[idx] = action.payload;
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // deleteTemplate
      .addCase(deleteTemplate.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(deleteTemplate.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.templates = state.templates.filter((t) => t.id !== action.payload);
        if (state.currentTemplate?.id === action.payload) {
          state.currentTemplate = null;
        }
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // useTemplate
      .addCase(useTemplate.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(useTemplate.fulfilled, (state, action: PayloadAction<ContentTemplate>) => {
        state.isLoading = false;
        const idx = state.templates.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.templates[idx] = action.payload;
      })
      .addCase(useTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTemplate, setCurrentTemplate } = templatesSlice.actions;
export default templatesSlice.reducer;
