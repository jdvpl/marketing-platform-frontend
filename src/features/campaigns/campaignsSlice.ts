import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/client';

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

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async (brandId: string) => {
  const response = await apiClient.get(`/v1/campaigns/brand/${brandId}`);
  return response.data;
});

export const createCampaign = createAsyncThunk('campaigns/create', async (data: Partial<Campaign>) => {
  const response = await apiClient.post('/v1/campaigns', data);
  return response.data;
});

export const deleteCampaign = createAsyncThunk('campaigns/delete', async ({ id, brandId }: { id: string; brandId: string }) => {
  await apiClient.post(`/v1/campaigns/${id}/delete?brandId=${brandId}`);
  return id;
});

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch campaigns';
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
