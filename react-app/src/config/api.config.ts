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

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      VERIFY_TOKEN: '/auth/verify-token',
    },
    USERS: '/users',
    PETS: '/pets',
    POSTS: '/posts',
    IMAGES: '/image',
  },
  TOKEN_KEY: 'authToken',
  USER_KEY: 'authUser',
};

// For debugging - you can remove this later
console.log('API Base URL:', API_CONFIG.BASE_URL); 