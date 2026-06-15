import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getExpeditionReport,
  getExpeditionReportDetail,
  ExpeditionReportParams,
  DoExpeditionItem,
} from '@/services/report/expeditionReport.service';

export function useExpeditionReport({
  page,
  perPage,
  search,
  orderBy,
  orderSort,
}: {
  page: number;
  perPage: number;
  search: string;
  orderBy?: string;
  orderSort?: 'asc' | 'desc';
}) {
  const queryResult = useQuery({
    queryKey: ['expedition-report', page, perPage, search, orderBy, orderSort],
    queryFn: async () => {
      const params: ExpeditionReportParams = {
        page,
        per_page: perPage,
        order_by: orderBy || 'created_at',
        order_sort: orderSort || 'desc',
      };

      // If backend supports search, include it in params
      if (search?.trim()) {
        params.search = search.trim();
      }

      return getExpeditionReport(params);
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const rawItems = queryResult.data?.data?.data || [];

  // Safe client-side search filtering fallback
  const filteredData = useMemo(() => {
    if (!search?.trim()) return rawItems;
    const q = search.trim().toLowerCase();

    return rawItems.filter((item: DoExpeditionItem) => {
      const code = item.code || '';
      const orderCode = item.order_list?.code || '';
      const custName = item.order_list?.customer?.name || '';
      const regNum = item.vehicle?.registration_number || '';
      const vehType = item.vehicle?.type || '';
      const drvName = item.driver?.name || '';
      const loadIn = item.order_list?.loading_in || '';
      const loadOut = item.order_list?.loading_out || '';
      const dest = item.order_list?.do_delivery_destination || '';

      return (
        code.toLowerCase().includes(q) ||
        orderCode.toLowerCase().includes(q) ||
        custName.toLowerCase().includes(q) ||
        regNum.toLowerCase().includes(q) ||
        vehType.toLowerCase().includes(q) ||
        drvName.toLowerCase().includes(q) ||
        loadIn.toLowerCase().includes(q) ||
        loadOut.toLowerCase().includes(q) ||
        dest.toLowerCase().includes(q)
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

export function useExpeditionReportDetail(doExpeditionId?: number | string | null) {
  const queryResult = useQuery({
    queryKey: ['expedition-report-detail', doExpeditionId],
    queryFn: async () => {
      if (!doExpeditionId) return null;
      return getExpeditionReportDetail(doExpeditionId);
    },
    enabled: !!doExpeditionId,
    staleTime: 30_000,
  });

  return {
    data: queryResult.data?.data || null,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
