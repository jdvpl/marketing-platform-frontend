// API Configuration
// IMPORTANTE: TODO el tráfico va a través del API Gateway en puerto 5000
export const API_CONFIG = {
  // API Gateway - Punto de entrada ÚNICO para todos los servicios
  gateway: {
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000',
    endpoints: {
      info: '/',
      health: '/health',
    }
  },

  // Headers comunes
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper para construir URL completa a través del gateway
export const buildApiUrl = (path: string): string => {
  const baseUrl = API_CONFIG.gateway.baseUrl;
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};
