// Shared API configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5295/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Token management utilities
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Common request interceptor for adding auth token
export const addAuthInterceptor = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use((config: any) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
