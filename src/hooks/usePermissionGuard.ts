import { useMemo } from 'react';
import { getStoredPermissions } from '@/lib/session/storage';

export function usePermissionGuard() {
  const permissions = useMemo(() => {
    return getStoredPermissions();
  }, []);

  const hasPermission = (required?: string | string[]) => {
    if (!required) return true;
    const list = Array.isArray(required) ? required : [required];
    if (!permissions.length) return false;
    return list.every((perm) => permissions.includes(perm));
  };

  return { hasPermission, permissions };
}
