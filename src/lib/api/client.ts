import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';
import { COOKIE_NAMES } from '../crypto';

// Cookie utilities
const CookieUtils = {
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!match) return null;
    try {
      const decoded = decodeURIComponent(match[2]);
      return atob(decoded); // Decode base64
    } catch {
      return null;
    }
  },

  delete(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },

  deleteAll() {
    this.delete(COOKIE_NAMES.ACCESS_TOKEN);
    this.delete(COOKIE_NAMES.REFRESH_TOKEN);
    this.delete('_mkt_user');
  }
};

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
        const token = CookieUtils.get(COOKIE_NAMES.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          CookieUtils.deleteAll();
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
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
  },
  ai: {
    generateContent: (data: any) => apiClient.post('/v1/ai/generate', data),
    generateImage: (data: any) => apiClient.post('/v1/ai/generate-image', data),
  },
  payments: {
    subscriptions: () => apiClient.get('/v1/payments/subscriptions'),
    createCheckout: (data: any) => apiClient.post('/v1/payments/checkout', data),
  },
};

export { apiClient, CookieUtils };
export default apiClient;
