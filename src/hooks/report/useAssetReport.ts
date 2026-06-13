import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getAssetReport,
  AssetReportParams,
  FinanceAssetReportItem,
} from '@/services/report/assetReport.service';

export function useAssetReport({
  companyId,
  page,
  perPage,
  search,
  sortBy,
  sortOrder,
}: {
  companyId: number;
  page: number;
  perPage: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryResult = useQuery({
    queryKey: ['asset-report', companyId, page, perPage, search, sortBy, sortOrder],
    queryFn: async () => {
      const params: AssetReportParams = {
        company_id: companyId,
        page,
        per_page: perPage,
        sort_by: sortBy || 'created_at',
        sort_order: sortOrder || 'desc',
        search: search || undefined,
      };

      return getAssetReport(params);
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const rawItems = queryResult.data?.data?.data || [];

  // Safe client-side search filtering fallback
  const filteredData = useMemo(() => {
    if (!search?.trim()) return rawItems;
    const q = search.trim().toLowerCase();

    return rawItems.filter((item: FinanceAssetReportItem) => {
      const code = item.asset?.code || '';
      const serialNum = item.asset?.serial_number || '';
      const name = item.asset?.name || '';
      const type = item.asset?.type || '';
      const desc = item.description || '';

      return (
        code.toLowerCase().includes(q) ||
        serialNum.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q)
      );
    });
  }, [rawItems, search]);

  const pagination = useMemo(() => {
    const backendPagination = queryResult.data?.data;
    return {
      currentPage: backendPagination?.current_page || page,
      lastPage: backendPagination?.last_page || 1,
      perPage: backendPagination?.per_page || perPage,
      total: backendPagination?.total || 0,
      from: backendPagination?.from || 0,
      to: backendPagination?.to || 0,
    };
  }, [queryResult.data, page, perPage]);

  return {
    data: filteredData,
    pagination,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
