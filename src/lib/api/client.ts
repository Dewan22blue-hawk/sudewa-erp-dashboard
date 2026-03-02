/**
 * API Client Configuration
 * Axios instance dengan interceptors untuk JWT authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/@types/api';
import { getAccessToken, removeAccessToken } from '@/lib/auth/token';

// Default to hawk-dev backend to match master-data environment; override via NEXT_PUBLIC_API_URL when needed.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://wajirabackend.hawk-dev.com';

/**
 * Base API Client dengan default configuration
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { Accept: 'application/json' },
});

/**
 * Request Interceptor
 * Menambahkan JWT token ke setiap request
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    // NOTE: Master-data endpoints must NOT be scoped by company_id, so we no longer auto-append company_id here.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handle errors dan token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token dan redirect ke login
      if (typeof window !== 'undefined') {
        removeAccessToken();
        window.location.href = '/login';
      }
    }

    // Format error response
    const apiError: ApiError = {
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.message || error.message || 'An error occurred',
      details: error.response?.data?.details,
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);
