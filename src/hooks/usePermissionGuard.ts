import { useMemo } from 'react';

// Lightweight permission guard reading from localStorage (or any injected array)
// If no permissions stored, it will allow everything (fail-open) to avoid blocking users without data.
export function usePermissionGuard() {
  const permissions = useMemo(() => {
    if (typeof window === 'undefined') return [] as string[];
    try {
      const raw = localStorage.getItem('user_permissions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter((p) => typeof p === 'string');
      }
    } catch {
      // ignore parse errors
    }
    return [] as string[];
  }, []);

  const hasPermission = (required?: string | string[]) => {
    if (!required) return true;
    const list = Array.isArray(required) ? required : [required];
    if (!permissions.length) return true; // fail-open until backend user permission is wired
    return list.some((perm) => permissions.includes(perm));
  };

  return { hasPermission, permissions };
}
