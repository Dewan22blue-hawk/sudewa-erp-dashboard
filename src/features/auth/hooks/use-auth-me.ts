import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import { ProfileResponse } from '../types/auth.types';

const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useAuthMe() {
  return useQuery<ProfileResponse>({
    queryKey: authKeys.me,
    queryFn: () => AuthService.me(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
