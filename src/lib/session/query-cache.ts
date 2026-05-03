import type { QueryClient } from '@tanstack/react-query';

const AUTH_QUERY_PREFIX = 'auth';

export const clearCompanyScopedQueries = (queryClient: QueryClient): void => {
  queryClient.removeQueries({
    predicate: (query) => query.queryKey[0] !== AUTH_QUERY_PREFIX,
  });
};
