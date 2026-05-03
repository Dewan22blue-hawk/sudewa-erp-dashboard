const COMPANY_ID_KEY = 'company_id';
const USER_PERMISSIONS_KEY = 'user_permissions';

const isBrowser = (): boolean => typeof window !== 'undefined';

export const storageKeys = {
  companyId: COMPANY_ID_KEY,
  userPermissions: USER_PERMISSIONS_KEY,
} as const;

export const getStoredCompanyId = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(COMPANY_ID_KEY);
};

export const setStoredCompanyId = (companyId: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(COMPANY_ID_KEY, companyId);
};

export const clearStoredCompanyId = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(COMPANY_ID_KEY);
};

export const getStoredPermissions = (): string[] => {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(USER_PERMISSIONS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((permission): permission is string => typeof permission === 'string');
  } catch {
    return [];
  }
};

export const clearStoredPermissions = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(USER_PERMISSIONS_KEY);
};
