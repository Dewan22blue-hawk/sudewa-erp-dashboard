import { useState, useEffect, useCallback } from 'react';
import { getStoredPermissions, setStoredPermissions } from '@/lib/session/storage';
import { AuthService } from '@/features/auth/services/auth.service';

export function usePermissionGuard() {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Load initial permissions
    const stored = getStoredPermissions();
    setPermissions(stored);

    // If empty, fetch from API directly because useCompanyMenu no longer fetches it
    if (stored.length === 0) {
      AuthService.getPermissions()
        .then((perms) => {
          if (perms && perms.length > 0) {
            setStoredPermissions(perms);
          }
        })
        .catch((err) => {
          console.error('[usePermissionGuard] Failed to fetch permissions:', err);
        });
    }

    const handleUpdate = () => {
      setPermissions(getStoredPermissions());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user_permissions') {
        handleUpdate();
      }
    };

    window.addEventListener('permissions-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('permissions-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const hasPermission = useCallback((required?: string | string[]) => {
    if (!required) return true;
    const list = Array.isArray(required) ? required : [required];
    if (!permissions.length) return false;
    return list.every((perm) => permissions.includes(perm));
  }, [permissions]);

  return { hasPermission, permissions };
}
