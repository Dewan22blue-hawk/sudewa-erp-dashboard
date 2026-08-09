import { useQuery } from '@tanstack/react-query';
import { getStoredPermissions, setStoredPermissions } from '@/lib/session/storage';
import { getAccessToken } from '@/lib/auth/token';
import { AuthService } from '@/features/auth/services/auth.service';

export function usePermissionGuard() {
  const hasToken = typeof window !== 'undefined' && !!getAccessToken();

  const { data: permissions = [] } = useQuery<string[]>({
    queryKey: ['auth', 'permissions'],
    queryFn: async () => {
      try {
        const perms = await AuthService.getPermissions();
        setStoredPermissions(perms);
        return perms;
      } catch (err) {
        console.error('[usePermissionGuard] Failed to fetch permissions from API:', err);
        return getStoredPermissions();
      }
    },
    enabled: hasToken,
    initialData: () => {
      return getStoredPermissions();
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  const hasPermission = (required?: string | string[]) => {
    if (!required) return true;
    const list = Array.isArray(required) ? required : [required];
    if (!permissions || !permissions.length) return false;
    return list.every((perm) => permissions.includes(perm));
  };

  return { hasPermission, permissions };
}
