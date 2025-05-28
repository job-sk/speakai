import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRegister } from 'react-native-event-listeners';
import { API_BASE_URL } from '@env';

// Use environment variable with fallback
const API_URL = API_BASE_URL;
console.log('API_URL', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Skip auth for public endpoints
    const publicEndpoints = ['/auth/login', '/auth/register'];
    if (config.url && publicEndpoints.includes(config.url)) {
      return config;
    }

    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Handle 401 errors (invalid token)
    if (error.response?.status === 401) {
      // Clear tokens and trigger logout
      await AsyncStorage.removeItem('accessToken');
      EventRegister.emit('AUTH_EXPIRED');
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: (userId: string) => api.post('/auth/logout', { userId }),

  analyzeSpeech: (formData: FormData, type: string) => {
    return api.post(`/user/analyze-speech?type=${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      transformRequest: (data, headers) => {
        return data; // Prevent axios from transforming the FormData
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
  },
};

export const userAPI = {
  getCurrentUser: () => api.get('/user/me'),
};

// export const speechAPI = {
//   analyzeSpeech: (audioUri: string) => {
//     const formData = new FormData();
//     formData.append('audio', {
//       uri: audioUri,
//       type: 'audio/m4a',
//       name: 'recording.m4a'
//     } as any);

//     return api.post('/analyze-speech', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       transformRequest: (data, headers) => {
//         return data; // Prevent axios from transforming the FormData
//       }
//     });
//   }
// };

export default api;