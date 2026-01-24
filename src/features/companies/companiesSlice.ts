import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/client';

interface Company {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

interface CompaniesState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  companies: [],
  isLoading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk<Company[], void>('companies/fetchAll', async () => {
  const data = await apiClient.get<Company[]>('/v1/companies');
  return data;
});

export const createCompany = createAsyncThunk<Company, string>('companies/create', async (name: string) => {
  const result = await apiClient.post<Company>('/v1/companies', { name });
  return result;
});

export const deleteCompany = createAsyncThunk('companies/delete', async (id: string) => {
  await apiClient.post(`/v1/companies/${id}/delete`);
  return id;
});

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter((c) => c.id !== action.payload);
      });
  },
});

export default companiesSlice.reducer;
