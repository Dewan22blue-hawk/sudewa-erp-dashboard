const ACCESS_TOKEN_KEY = 'auth_token'; // Matching the one used in client.ts

let inMemoryToken: string | null = null;

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
