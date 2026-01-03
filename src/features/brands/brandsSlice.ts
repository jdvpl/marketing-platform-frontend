import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/client';

interface Brand {
  id: string;
  companyId: string;
  name: string;
  category: string;
  language: string;
  tone: string;
}

interface BrandsState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  brands: [],
  isLoading: false,
  error: null,
};

export const fetchBrands = createAsyncThunk('brands/fetchAll', async (companyId: string) => {
  const response = await apiClient.get(`/v1/brands?companyId=${companyId}`);
  return response.data;
});

export const createBrand = createAsyncThunk('brands/create', async (data: Partial<Brand>) => {
  const response = await apiClient.post('/v1/brands', data);
  return response.data;
});

export const deleteBrand = createAsyncThunk('brands/delete', async (id: string) => {
  await apiClient.post(`/v1/brands/${id}/delete`);
  return id;
});

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch brands';
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload);
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b.id !== action.payload);
      });
  },
});

export default brandsSlice.reducer;
