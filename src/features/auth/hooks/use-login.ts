'use client';

import { useState } from 'react';
import { AuthService } from '../services/auth.service';
import { LoginRequest, AuthResponse } from '../types/auth.types';
import { setAccessToken } from '@/lib/auth/token';

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
      const message = err?.message || err?.response?.data?.message || 'Login failed';
      setError(message);
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
