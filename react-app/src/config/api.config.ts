export const API_CONFIG = {
  BASE_URL: 'http://localhost:5295/api',
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