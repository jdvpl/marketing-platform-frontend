import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  content: string;
  mediaUrls?: string;
  provider?: string;
  externalPostId?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  clicksCount: number;
  engagementRate: number;
  isWinner: boolean;
  publishedAt?: string;
}

export interface ABTest {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
  metricGoal: string;
  winnerVariantId?: string;
  startedAt?: string;
  endedAt?: string;
  variants?: ABTestVariant[];
  createdAt: string;
}

interface ABTestingState {
  tests: ABTest[];
  currentTest: (ABTest & { variants: ABTestVariant[] }) | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: ABTestingState = {
  tests: [],
  currentTest: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchBrandTests = createAsyncThunk(
  'abTesting/fetchBrandTests',
  async (params: { brandId: string; status?: string }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      const queryString = qs.toString() ? `?${qs.toString()}` : '';
      const response = await fetch(`/api/ab-tests/brand/${params.brandId}${queryString}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar tests A/B');
      return (data.tests || data) as ABTest[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchTestDetail = createAsyncThunk(
  'abTesting/fetchTestDetail',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar detalle del test');
      return data as ABTest & { variants: ABTestVariant[] };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const createABTest = createAsyncThunk(
  'abTesting/createABTest',
  async (body: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al crear test A/B');
      return data as ABTest;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const startTest = createAsyncThunk(
  'abTesting/startTest',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/start`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al iniciar test');
      return data as ABTest;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const completeTest = createAsyncThunk(
  'abTesting/completeTest',
  async (testId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/ab-tests/${testId}/complete`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al completar test');
      return data as ABTest;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const abTestingSlice = createSlice({
  name: 'abTesting',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentTest: (state) => { state.currentTest = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchBrandTests
      .addCase(fetchBrandTests.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBrandTests.fulfilled, (state, action: PayloadAction<ABTest[]>) => {
        state.isLoading = false;
        state.tests = action.payload;
      })
      .addCase(fetchBrandTests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchTestDetail
      .addCase(fetchTestDetail.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTestDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createABTest
      .addCase(createABTest.pending, (state) => { state.isCreating = true; state.error = null; })
      .addCase(createABTest.fulfilled, (state, action: PayloadAction<ABTest>) => {
        state.isCreating = false;
        state.tests.unshift(action.payload);
      })
      .addCase(createABTest.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // startTest
      .addCase(startTest.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(startTest.fulfilled, (state, action: PayloadAction<ABTest>) => {
        state.isLoading = false;
        const idx = state.tests.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tests[idx] = action.payload;
        if (state.currentTest?.id === action.payload.id) {
          state.currentTest = { ...state.currentTest, ...action.payload };
        }
      })
      .addCase(startTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // completeTest
      .addCase(completeTest.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(completeTest.fulfilled, (state, action: PayloadAction<ABTest>) => {
        state.isLoading = false;
        const idx = state.tests.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tests[idx] = action.payload;
        if (state.currentTest?.id === action.payload.id) {
          state.currentTest = { ...state.currentTest, ...action.payload };
        }
      })
      .addCase(completeTest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTest } = abTestingSlice.actions;
export default abTestingSlice.reducer;
