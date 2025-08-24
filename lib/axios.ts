import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// Create axios instance with enhanced configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for file operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language preference
    const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'en' : 'en';
    if (config.headers) {
      config.headers['Accept-Language'] = locale;
    }

    // Add request timestamp for caching
    if (config.params) {
      config.params._t = Date.now();
    } else {
      config.params = { _t: Date.now() };
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    const { data } = response;

    // If response has a message, show it
    if (data.message && typeof window !== 'undefined') {
      message.success(data.message);
    }

    return response;
  },
  (error: AxiosError) => {
    if (!error.response) {
      // Network error
      if (typeof window !== 'undefined') {
        message.error('Network error. Please check your connection.');
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMessage = data?.error || data?.message || 'An error occurred';

    switch (status) {
      case 400:
        // Bad Request - Validation errors
        if (typeof window !== 'undefined') {
          if (data?.errors && Array.isArray(data.errors)) {
            // Handle validation errors array
            const validationMessages = data.errors.map((err: any) => err.message || err.msg).join(', ');
            message.error(validationMessages);
          } else {
            message.error(errorMessage);
          }
        }
        break;

      case 401:
        // Unauthorized - Clear auth and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          message.error(errorMessage || 'Session expired. Please login again.');
          window.location.href = '/login';
        }
        break;

      case 403:
        // Forbidden - Permission denied
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'You do not have permission to perform this action.');
        }
        break;

      case 404:
        // Not Found
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'Resource not found.');
        }
        break;

      case 409:
        // Conflict - Usually for duplicate resources
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'Resource already exists.');
        }
        break;

      case 422:
        // Unprocessable Entity - Validation errors
        if (typeof window !== 'undefined') {
          if (data?.errors && Array.isArray(data.errors)) {
            const validationMessages = data.errors.map((err: any) => err.message || err.msg).join(', ');
            message.error(validationMessages);
          } else {
            message.error(errorMessage);
          }
        }
        break;

      case 429:
        // Too Many Requests
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'Too many requests. Please try again later.');
        }
        break;

      case 500:
        // Internal Server Error
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'Server error. Please try again later.');
        }
        break;

      default:
        // Other errors
        if (typeof window !== 'undefined') {
          message.error(errorMessage || 'An unexpected error occurred.');
        }
        break;
    }

    return Promise.reject(error);
  }
);

// Enhanced HTTP methods with better error handling
const apiService = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get(url, config);
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post(url, data, config);
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put(url, data, config);
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch(url, data, config);
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete(url, config);
  },

  // Upload method for files
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      timeout: 60000, // Longer timeout for uploads
      onUploadProgress: (progressEvent: any) => {
        if (config?.onUploadProgress) {
          config.onUploadProgress(progressEvent);
        }
      },
    };

    return axiosInstance.post(url, formData, uploadConfig);
  },

  // Download method for files
  download: (url: string, config?: AxiosRequestConfig): Promise<Blob> => {
    return axiosInstance.get(url, {
      ...config,
      responseType: 'blob',
    }).then(response => response.data);
  },

  // Set auth token manually (useful for login)
  setAuthToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  // Set locale
  setLocale: (locale: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  },

  // Get locale
  getLocale: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('locale') || 'en';
    }
    return 'en';
  },

  // Get current sucursal info
  getCurrentSucursal: () => {
    if (typeof window !== 'undefined') {
      const sucursal = localStorage.getItem('currentSucursal');
      return sucursal ? JSON.parse(sucursal) : null;
    }
    return null;
  },

  // Set current sucursal info
  setCurrentSucursal: (sucursal: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSucursal', JSON.stringify(sucursal));
    }
  },
};

// Export both the configured axios instance and the service
export default axiosInstance;
const baseUrl = API_BASE_URL;
export { apiService, baseUrl };