import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

interface QueryStateOptions {
  defaultPage?: number;
  defaultPerPage?: number;
  defaultSearch?: string;
}

export const useQueryParamsTable = (options?: QueryStateOptions) => {
  const router = useRouter();

  const page = useMemo(() => {
    const value = router.query.page;
    const numeric = typeof value === 'string' ? Number(value) : (options?.defaultPage ?? 1);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  }, [router.query.page, options?.defaultPage]);

  const perPage = useMemo(() => {
    const raw = router.query.perPage ?? router.query.per_page;
    const numeric = typeof raw === 'string' ? Number(raw) : (options?.defaultPerPage ?? 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : (options?.defaultPerPage ?? 10);
  }, [router.query.perPage, router.query.per_page, options?.defaultPerPage]);

  const search = useMemo(() => {
    const value = router.query.search;
    return typeof value === 'string' ? value : (options?.defaultSearch ?? '');
  }, [router.query.search, options?.defaultSearch]);

  const updateQuery = useCallback(
    (next: Record<string, string | number | undefined>) => {
      if (!router.isReady) return;

      const query: Record<string, string | string[]> = {};

      Object.entries(router.query).forEach(([key, value]) => {
        if (value !== undefined && key !== 'slug') {
          query[key] = value;
        }
      });

      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete query[key];
        } else {
          query[key] = String(value);
        }
      });

      const pathname = router.asPath.split('?')[0];
      router.replace({ pathname, query }, undefined, { shallow: true });
    },
    [router],
  );

  const getParam = useCallback(
    (key: string, fallback = '') => {
      const value = router.query[key];
      return typeof value === 'string' ? value : fallback;
    },
    [router.query],
  );

  const setPage = useCallback((value: number) => updateQuery({ page: value }), [updateQuery]);
  const setPerPage = useCallback((value: number) => updateQuery({ perPage: value, page: 1 }), [updateQuery]);
  const setSearch = useCallback((value: string) => updateQuery({ search: value, page: 1 }), [updateQuery]);

  return {
    page,
    perPage,
    search,
    getParam,
    updateQuery,
    setPage,
    setPerPage,
    setSearch,
  };
};
