/**
 * API Client Configuration
 * Axios instance dengan interceptors untuk JWT authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '@/@types/api'

/**
 * Base API Client dengan default configuration
 */
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Request Interceptor
 * Menambahkan JWT token ke setiap request
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token dari localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token')
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * Response Interceptor
 * Handle errors dan token refresh
 */
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError<ApiError>) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Clear token dan redirect ke login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token')
                window.location.href = '/login'
            }
        }

        // Format error response
        const apiError: ApiError = {
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            message: error.response?.data?.message || error.message || 'An error occurred',
            details: error.response?.data?.details,
            statusCode: error.response?.status,
        }

        return Promise.reject(apiError)
    }
)

export default apiClient
