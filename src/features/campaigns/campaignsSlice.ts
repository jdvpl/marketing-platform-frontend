import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Campaign {
  id: string;
  brandId: string;
  name: string;
  objective: string;
  status: string;
  scheduledAt?: string;
}

interface CampaignsState {
  campaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CampaignsState = {
  campaigns: [],
  isLoading: false,
  error: null,
};

export const fetchCampaigns = createAsyncThunk<Campaign[], string>(
  'campaigns/fetchAll',
  async (brandId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/campaigns/brand/${brandId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar campañas');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const createCampaign = createAsyncThunk<Campaign, Partial<Campaign>>(
  'campaigns/create',
  async (campaignData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al crear campaña');
      return data;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaigns/delete',
  async ({ id, brandId }: { id: string; brandId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/campaigns/${id}/delete?brandId=${brandId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return rejectWithValue(data.error || 'Error al eliminar');
      }
      return id;
    } catch {
      return rejectWithValue('Error de conexión');
    }
  }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Error';
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter((c) => c.id !== action.payload);
      });
  },
});

export default campaignsSlice.reducer;
