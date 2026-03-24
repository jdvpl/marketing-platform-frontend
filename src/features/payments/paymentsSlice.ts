import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
  highlighted?: boolean;
}

export interface Subscription {
  companyId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  planName: string;
  planId: string;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INACTIVE';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  billingInterval?: 'month' | 'year';
  amount?: number;
  currency?: string;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  description: string;
  invoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId?: string;
}

interface PaymentsState {
  plans: Plan[];
  subscription: Subscription | null;
  paymentHistory: PaymentHistoryItem[];
  isLoading: boolean;
  isCreatingCheckout: boolean;
  error: string | null;
  checkoutUrl: string | null;
  portalUrl: string | null;
}

const initialState: PaymentsState = {
  plans: [],
  subscription: null,
  paymentHistory: [],
  isLoading: false,
  isCreatingCheckout: false,
  error: null,
  checkoutUrl: null,
  portalUrl: null,
};

export const fetchPlans = createAsyncThunk(
  'payments/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/plans');
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar planes');
      return data as Plan[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchSubscription = createAsyncThunk(
  'payments/fetchSubscription',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/payments/subscription/${companyId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar suscripción');
      return data as Subscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payments/fetchHistory',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/payments/history/${companyId}`);
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cargar historial');
      return data as PaymentHistoryItem[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const createCheckout = createAsyncThunk(
  'payments/createCheckout',
  async (payload: { companyId: string; planId: string; interval: 'month' | 'year'; successUrl?: string; cancelUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al crear checkout');
      return data as CheckoutResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const createPortalSession = createAsyncThunk(
  'payments/createPortal',
  async (payload: { companyId: string; returnUrl?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al abrir portal');
      return data as CheckoutResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'payments/cancel',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/payments/subscription/${companyId}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error || 'Error al cancelar suscripción');
      return data as Subscription;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error de red');
    }
  }
);

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearCheckoutUrl: (state) => { state.checkoutUrl = null; },
    clearPortalUrl: (state) => { state.portalUrl = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.subscription = action.payload;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistoryItem[]>) => {
        state.paymentHistory = action.payload;
      })
      .addCase(createCheckout.pending, (state) => { state.isCreatingCheckout = true; state.error = null; })
      .addCase(createCheckout.fulfilled, (state, action: PayloadAction<CheckoutResponse>) => {
        state.isCreatingCheckout = false;
        state.checkoutUrl = action.payload.url;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.isCreatingCheckout = false;
        state.error = action.payload as string;
      })
      .addCase(createPortalSession.fulfilled, (state, action: PayloadAction<CheckoutResponse>) => {
        state.portalUrl = action.payload.url;
      })
      .addCase(cancelSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.subscription = action.payload;
      });
  },
});

export const { clearCheckoutUrl, clearPortalUrl, clearError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
