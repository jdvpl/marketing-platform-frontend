import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { getCookie, COOKIE_NAMES } from '../cookies';

// Cliente principal de API con interceptores
class ApiClient {
  private client: AxiosInstance;
  private onUnauthorized?: () => void;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: API_CONFIG.defaultHeaders,
      withCredentials: true,
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add token from cookies
    this.client.interceptors.request.use(
      (config) => {
        const token = getCookie(COOKIE_NAMES.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && this.onUnauthorized) {
          this.onUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  getInstance() {
    return this.client;
  }
}

// Cliente único que apunta al API Gateway
const apiClient = new ApiClient(API_CONFIG.gateway.baseUrl);

// API endpoints organizados
export const api = {
  gateway: {
    getInfo: () => apiClient.get('/'),
    health: () => apiClient.get('/health'),
  },
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/v1/auth/login', credentials),
    register: (data: { email: string; password: string }) =>
      apiClient.post('/v1/auth/register', data),
    oauth: {
      getConnectUrl: (provider: string) => {
        const gatewayUrl = API_CONFIG.gateway.baseUrl;
        return `${gatewayUrl}/v1/auth/oauth/${provider}/connect`;
      }
    }
  },
  campaigns: {
    list: () => apiClient.get('/v1/campaigns'),
    create: (data: any) => apiClient.post('/v1/campaigns', data),
    get: (id: string) => apiClient.get(`/v1/campaigns/${id}`),
    update: (id: string, data: any) => apiClient.put(`/v1/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/v1/campaigns/${id}`),
  },
  social: {
    accounts: () => apiClient.get('/v1/social/accounts'),
    connect: (provider: string) => apiClient.post(`/v1/social/connect/${provider}`),
    posts: () => apiClient.get('/v1/social/posts'),
    publishAll: (data: any) => apiClient.post('/v1/social/publish/all', data),
    repost: (data: any) => apiClient.post('/v1/social/publish/repost', data),
    connectedAccounts: (brandId: string) => apiClient.get(`/v1/social/publish/accounts/${brandId}`),
  },
  videos: {
    list: (brandId: string, provider?: string) =>
      apiClient.get(`/v1/videos/brand/${brandId}${provider ? `?provider=${provider}` : ''}`),
    get: (videoId: string) => apiClient.get(`/v1/videos/${videoId}`),
    upload: (formData: FormData) =>
      apiClient.post('/v1/videos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (videoId: string, data: any) => apiClient.put(`/v1/videos/${videoId}`, data),
    delete: (videoId: string) => apiClient.delete(`/v1/videos/${videoId}`),
  },
  metrics: {
    brand: (brandId: string) => apiClient.get(`/v1/metrics/brand/${brandId}`),
    campaign: (campaignId: string) => apiClient.get(`/v1/metrics/campaign/${campaignId}`),
    topPosts: (brandId: string, limit = 10) => apiClient.get(`/v1/metrics/brand/${brandId}/top-posts?limit=${limit}`),
    sync: (campaignId: string) => apiClient.post(`/v1/metrics/sync/campaign/${campaignId}`),
    record: (data: any) => apiClient.post('/v1/metrics/record', data),
  },
  growth: {
    followers: (brandId: string, days = 30) => apiClient.get(`/v1/growth/brand/${brandId}/followers?days=${days}`),
    bestTimes: (brandId: string, provider?: string) =>
      apiClient.get(`/v1/growth/brand/${brandId}/best-times${provider ? `?provider=${provider}` : ''}`),
    accounts: (brandId: string) => apiClient.get(`/v1/growth/brand/${brandId}/accounts`),
  },
  ai: {
    generateContent: (data: any) => apiClient.post('/v1/ai/generate', data),
    generateImage: (data: any) => apiClient.post('/v1/ai/generate-image', data),
    videoScript: (data: any) => apiClient.post('/v1/ai/generate', { ...data, type: 'VIDEO_SCRIPT' }),
    optimizeCaption: (data: any) => apiClient.post('/v1/ai/generate', { ...data, type: 'CAPTION_OPTIMIZATION' }),
  },
  chatbot: {
    chat: (data: { message: string; userId: string; conversationId?: string }) =>
      apiClient.post('/api/chatbot/chat', data),
    history: (conversationId: string) =>
      apiClient.get(`/api/chatbot/history/${conversationId}`),
    clear: (conversationId: string) =>
      apiClient.post(`/api/chatbot/clear/${conversationId}`),
  },
  payments: {
    plans: () => apiClient.get('/v1/payments/plans'),
    subscription: (companyId: string) => apiClient.get(`/v1/payments/subscription/${companyId}`),
    createCheckout: (data: any) => apiClient.post('/v1/payments/checkout', data),
    createPortal: (data: { companyId: string; returnUrl?: string }) => apiClient.post('/v1/payments/portal', data),
    cancelSubscription: (companyId: string) => apiClient.post(`/v1/payments/subscription/${companyId}/cancel`),
    history: (companyId: string) => apiClient.get(`/v1/payments/subscription/company/${companyId}`),
  },
};

export { apiClient };
export default apiClient;
