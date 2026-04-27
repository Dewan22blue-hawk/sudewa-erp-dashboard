const ACCESS_TOKEN_KEY = 'auth_token';

/** Last timestamp when token validity was checked (in milliseconds). */
let lastTokenCheckTime = 0;

/** Minimum interval between token validity checks in milliseconds (2 minutes). */
const TOKEN_CHECK_THROTTLE_MS = 2 * 60 * 1000;

let inMemoryToken: string | null = null;

export type TokenValidityStatus = 'valid' | 'invalid' | 'unknown';

const isBrowser = (): boolean => typeof window !== 'undefined';

export const setAccessToken = (token: string): void => {
  if (isBrowser()) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
  inMemoryToken = token;
};

export const getAccessToken = (): string | null => {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (isBrowser()) {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  }

  return null;
};

export const removeAccessToken = (): void => {
  if (isBrowser()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  inMemoryToken = null;
};

/**
 * Check if enough time has passed since the last token validation check.
 * Used for throttling to prevent excessive API calls.
 */
export const isTokenCheckThrottled = (): boolean => {
  const now = Date.now();
  return now - lastTokenCheckTime < TOKEN_CHECK_THROTTLE_MS;
};

/**
 * Record the latest token validation attempt.
 */
export const markTokenCheckAttempt = (): void => {
  lastTokenCheckTime = Date.now();
};

/**
 * Proactively validate the current token by calling the backend /check-token endpoint.
 * Returns:
 * - `valid` when backend explicitly accepts the token
 * - `invalid` when backend explicitly rejects the token
 * - `unknown` when the check cannot be completed due to network/server issues
 */
export const checkTokenValidity = async (): Promise<TokenValidityStatus> => {
  try {
    const { apiClient } = await import('@/lib/api/client');
    const response = await apiClient.get('/wapi/auth/check-token');

    return response.data?.status === true ? 'valid' : 'invalid';
  } catch (error: any) {
    if (error?.statusCode === 401) {
      return 'invalid';
    }

    console.error('[Token Validation] Error checking token validity:', error);
    return 'unknown';
  }
};
