import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/lib/redux/store';

interface ContextState {
  selectedCompanyId: string | null;
  selectedBrandId: string | null;
}

const initialState: ContextState = {
  selectedCompanyId: null,
  selectedBrandId: null,
};

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setSelectedCompanyId: (state, action: PayloadAction<string | null>) => {
      state.selectedCompanyId = action.payload;
      // Reset brand when company changes
      state.selectedBrandId = null;
    },
    setSelectedBrandId: (state, action: PayloadAction<string | null>) => {
      state.selectedBrandId = action.payload;
    },
  },
});

export const { setSelectedCompanyId, setSelectedBrandId } = contextSlice.actions;

// Selectors
export const selectSelectedCompanyId = (state: RootState) => state.context.selectedCompanyId;
export const selectSelectedBrandId = (state: RootState) => state.context.selectedBrandId;

export const selectSelectedCompany = (state: RootState) => {
  const id = state.context.selectedCompanyId;
  return id ? state.companies.companies.find((c) => c.id === id) || null : null;
};

export const selectSelectedBrand = (state: RootState) => {
  const id = state.context.selectedBrandId;
  return id ? state.brands.brands.find((b) => b.id === id) || null : null;
};

export default contextSlice.reducer;
