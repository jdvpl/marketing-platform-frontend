import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

export const fetchCompanies = createAsyncThunk<Company[], void>('companies/fetchAll', async (_, { rejectWithValue }) => {
  const response = await fetch('/api/companies');
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al cargar empresas');
  }
  return data;
});

export const createCompany = createAsyncThunk<Company, string>('companies/create', async (name: string, { rejectWithValue }) => {
  const response = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al crear empresa');
  }
  return data;
});

export const deleteCompany = createAsyncThunk('companies/delete', async (id: string, { rejectWithValue }) => {
  const response = await fetch(`/api/companies/${id}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) {
    return rejectWithValue(data.error || 'Error al eliminar empresa');
  }
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
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Error al cargar empresas';
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Error al crear empresa';
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter((c) => c.id !== action.payload);
      });
  },
});

export default companiesSlice.reducer;
