'use client';

import { useState } from 'react';
import { AuthService } from '../services/auth.service';
import { LoginRequest, AuthResponse } from '../types/auth.types';
import { setAccessToken } from '@/lib/auth/token';
import { toast } from 'sonner';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest): Promise<AuthResponse | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);

      if (response.data && response.data.access_token) {
        setAccessToken(response.data.access_token);
      }

      return response;
    } catch (err: any) {
      let message = err?.message || err?.response?.data?.message || 'Login failed';
      const status = err?.response?.status;
      const msgLower = typeof message === 'string' ? message.toLowerCase() : '';
      
      const isAuthError = 
        status === 401 || 
        status === 400 || 
        status === 404 || 
        msgLower.includes('unauthorized') || 
        msgLower.includes('invalid') || 
        msgLower.includes('credential') || 
        msgLower.includes('wrong') || 
        msgLower.includes('fail');

      if (isAuthError) {
        message = 'Email atau password yang Anda masukkan salah. Silakan periksa kembali dan coba lagi.';
      } else {
        message = 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.';
      }

      setError(message);
      toast.error(message, {
        position: 'top-center',
        duration: 10000,
      });
      throw err; // Re-throw to let the UI react if needed (e.g. form reject)
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    setError, // expose this so the UI can clear errors manually
  };
};
