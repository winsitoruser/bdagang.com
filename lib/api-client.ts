import axios from 'axios';
import { getSession } from 'next-auth/react';

// Same-origin `/api/*`: NextAuth memakai cookie httpOnly; tidak perlu Bearer JWT manual.
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session) {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${session.user?.id || 'anonymous'}`;
        }
        
        // Add any custom headers based on user role
        if (session.user?.role) {
          config.headers['X-User-Role'] = session.user.role;
        }
      }
      
      return config;
    } catch (error) {
      console.error('Error setting auth header:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error);
      // You can redirect to login or handle in another way
      // window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
