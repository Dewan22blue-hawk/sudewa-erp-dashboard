'use client';

/**
 * Custom Hook: useAuthCheck
 *
 * Proactive token validation hook that checks token validity on route changes.
 * Features:
 * - Validates token only if user has a token and is not on public/login routes
 * - Implements throttling to prevent excessive API calls (minimum 2 minute interval)
 * - Type-safe and handles various error scenarios gracefully
 * - Logs validation attempts for debugging
 *
 * Usage:
 * Place this hook in _app.tsx's useEffect to monitor route changes
 *
 * Example:
 * ```
 * import { useRouter } from 'next/router';
 * import { useAuthCheck } from '@/features/auth/hooks/use-auth-check';
 *
 * export default function App({ Component, pageProps }: AppProps) {
 *   const router = useRouter();
 *   useAuthCheck(router);
 *   return <Component {...pageProps} />;
 * }
 * ```
 */

import { useCallback, useEffect } from 'react';
import { NextRouter } from 'next/router';
import { getAccessToken, checkTokenValidity, isTokenCheckThrottled, markTokenCheckAttempt, removeAccessToken } from '@/lib/auth/token';

/**
 * Public/non-authenticated pages that should skip token validation
 */
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Check if a route is a public route that doesn't require authentication
 */
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((publicRoute) => pathname.startsWith(publicRoute));
};

/**
 * Check if we're in a browser environment and have a valid token
 */
const shouldValidateToken = (pathname: string): boolean => {
  // Skip validation if not in browser
  if (typeof window === 'undefined') {
    return false;
  }

  // Skip validation on public routes
  if (isPublicRoute(pathname)) {
    return false;
  }

  // Skip validation if no token is stored
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  return true;
};

/**
 * Hook that performs proactive token validation on route changes
 *
 * @param router - Next.js router instance from useRouter()
 * @returns void
 */
export const useAuthCheck = (router: NextRouter) => {
  const validateTokenOnRouteChange = useCallback(async () => {
    // Determine if we should validate the token for this route
    if (!shouldValidateToken(router.pathname)) {
      return;
    }

    // Check if we're throttled (skip if less than 2 minutes have passed)
    if (isTokenCheckThrottled()) {
      console.debug('[useAuthCheck] Token check throttled - skipping validation');
      return;
    }

    try {
      console.debug('[useAuthCheck] Performing proactive token validation');

      // Call the token validity check
      const status = await checkTokenValidity();
      markTokenCheckAttempt();

      if (status === 'valid') {
        console.debug('[useAuthCheck] Token validation successful');
      } else if (status === 'invalid') {
        console.warn('[useAuthCheck] Token validation failed - token is no longer valid');
        removeAccessToken();
        if (router.pathname !== '/login') {
          await router.push('/login');
        }
      } else {
        console.warn('[useAuthCheck] Token validation could not be completed, keeping current session');
      }
    } catch (error) {
      // Log the error but don't interrupt the app flow
      console.error('[useAuthCheck] Error during token validation:', error);
    }
  }, [router]);

  useEffect(() => {
    // Run once on app init (except public routes), then continue on route changes.
    void validateTokenOnRouteChange();

    router.events.on('routeChangeStart', validateTokenOnRouteChange);

    return () => {
      router.events.off('routeChangeStart', validateTokenOnRouteChange);
    };
  }, [router.events, validateTokenOnRouteChange]);
};
