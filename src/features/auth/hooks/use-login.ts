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
      const rawMessage = err?.response?.data?.message || err?.message || '';
      const msgLower = typeof rawMessage === 'string' ? rawMessage.toLowerCase() : '';
      const status = err?.response?.status;
      let message = '';

      if (msgLower.includes('not activated') || msgLower.includes('belum diaktifkan') || msgLower.includes('deactivated')) {
        message = 'Akun Anda belum aktif. Silakan hubungi administrator untuk mengaktifkan akun Anda.';
      } else if (
        msgLower.includes('invalid') || 
        msgLower.includes('wrong') || 
        msgLower.includes('credential') || 
        status === 401
      ) {
        message = 'User ID/Email atau Kata Sandi yang Anda masukkan salah. Silakan periksa kembali.';
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
