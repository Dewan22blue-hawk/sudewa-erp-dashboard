import type { QueryClient } from '@tanstack/react-query';
import { removeAccessToken } from '@/lib/auth/token';
import { clearCompanyScopedQueries } from '@/lib/session/query-cache';
import { clearStoredCompanyId, clearStoredPermissions } from '@/lib/session/storage';

export const performClientLogout = (queryClient: QueryClient): void => {
  removeAccessToken();
  clearStoredCompanyId();
  clearStoredPermissions();
  clearCompanyScopedQueries(queryClient);
};
