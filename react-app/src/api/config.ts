import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const getBaseUrl = () => {
  // For Azure Static Web Apps, check the hostname
  if (typeof window !== 'undefined' && window.location.hostname.includes('azurestaticapps.net')) {
    return 'https://petwhenua-gpggdjawh0duc2du.australiaeast-01.azurewebsites.net/api';
  }
  
  // Check if we're in production (deployed)
  if (import.meta.env.PROD) {
    return 'https://petwhenua-gpggdjawh0duc2du.australiaeast-01.azurewebsites.net/api';
  }
  
  // Development environment
  return import.meta.env.VITE_API_URL || 'https://localhost:7192/api';
};

// Shared API configuration
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// For debugging - you can remove this later
console.log('API Config Base URL:', API_CONFIG.BASE_URL);

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
export const addAuthInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};
