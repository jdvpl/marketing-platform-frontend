import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import companiesReducer from '@/features/companies/companiesSlice';
import brandsReducer from '@/features/brands/brandsSlice';
import campaignsReducer from '@/features/campaigns/campaignsSlice';
import uploadReducer from '@/features/upload/uploadSlice';
import chatbotReducer from '@/features/chatbot/chatbotSlice';
import socialReducer from '@/features/social/socialSlice';
import videosReducer from '@/features/videos/videosSlice';
import metricsReducer from '@/features/metrics/metricsSlice';
import paymentsReducer from '@/features/payments/paymentsSlice';
import contextReducer from '@/features/context/contextSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
    brands: brandsReducer,
    campaigns: campaignsReducer,
    upload: uploadReducer,
    chatbot: chatbotReducer,
    social: socialReducer,
    videos: videosReducer,
    metrics: metricsReducer,
    payments: paymentsReducer,
    context: contextReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
