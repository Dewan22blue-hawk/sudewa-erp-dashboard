import { useCallback, useState } from 'react';
import { AuthError, AuthErrorCode, LoginSuccessData, login } from '@/features/auth/services/auth.service';

interface UseLoginResult {
  loginUser: (email: string, password: string) => Promise<LoginSuccessData>;
  isLoading: boolean;
  error: string | null;
  errorCode: AuthErrorCode | null;
}

export const useLogin = (): UseLoginResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);

  const loginUser = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const result = await login(email, password);
      return result;
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
        setErrorCode(err.code);
      } else {
        setError('Terjadi kesalahan saat login.');
        setErrorCode(AuthErrorCode.Unknown);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loginUser, isLoading, error, errorCode };
};
