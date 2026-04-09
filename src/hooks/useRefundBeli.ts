import { useCallback, useEffect, useState } from 'react';
import type { RefundBeli, RefundBeliPagination } from '@/@types/refund-beli.types';
import { fetchPurchaseRefund } from '@/services/refundService';

interface UseRefundBeliReturn {
  data: RefundBeli[];
  pagination: RefundBeliPagination;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  fetchData: (page?: number, perPage?: number, search?: string) => Promise<void>;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setSearch: (search: string) => void;
}

const defaultPagination: RefundBeliPagination = {
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
  from: 0,
  to: 0,
};

export const useRefundBeli = (): UseRefundBeliReturn => {
  const [data, setData] = useState<RefundBeli[]>([]);
  const [pagination, setPagination] = useState<RefundBeliPagination>(defaultPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPerPage, setCurrentPerPage] = useState(10);
  const [currentSearch, setCurrentSearch] = useState('');

  const fetchData = useCallback(
    async (page = currentPage, perPage = currentPerPage, search = currentSearch) => {
      const initialLoad = !hasLoaded;
      setIsLoading(initialLoad);
      setIsFetching(true);
      setError(null);

      try {
        const result = await fetchPurchaseRefund({ page, per_page: perPage, search });
        setData(result.data);
        setPagination(result.pagination);
        setCurrentPage(result.pagination.currentPage);
        setCurrentPerPage(result.pagination.perPage);
        setHasLoaded(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal mengambil data refund pembelian';
        setError(message);
        setData([]);
        setPagination((previous) => ({
          ...previous,
          currentPage: page,
          perPage,
          from: 0,
          to: 0,
          total: previous.total,
          lastPage: previous.lastPage,
        }));
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [currentPage, currentPerPage, currentSearch, hasLoaded],
  );

  useEffect(() => {
    void fetchData(currentPage, currentPerPage, currentSearch);
  }, [currentPage, currentPerPage, currentSearch, fetchData]);

  return {
    data,
    pagination,
    isLoading,
    isFetching,
    error,
    fetchData,
    setPage: setCurrentPage,
    setPerPage: setCurrentPerPage,
    setSearch: setCurrentSearch,
  };
};
