import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

export const fetchBrands = createAsyncThunk<Brand[], string>('brands/fetchAll', async (companyId: string, { rejectWithValue }) => {
  const response = await fetch(`/api/brands?companyId=${companyId}`);
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al cargar marcas');
  }
  return data;
});

export const createBrand = createAsyncThunk<Brand, Partial<Brand>>('brands/create', async (brandData: Partial<Brand>, { rejectWithValue }) => {
  const response = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brandData),
  });
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al crear marca');
  }
  return data;
});

export const deleteBrand = createAsyncThunk('brands/delete', async (id: string, { rejectWithValue }) => {
  const response = await fetch(`/api/brands/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al eliminar marca');
  }
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
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Error al cargar marcas';
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Error al crear marca';
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b.id !== action.payload);
      });
  },
});

export default brandsSlice.reducer;
