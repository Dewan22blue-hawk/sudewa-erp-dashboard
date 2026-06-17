import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getHandoverReport,
  JumlahPenyerahanReportParams,
  HandoverReportItem,
} from '@/services/report/jumlahPenyerahanReport.service';

export function useJumlahPenyerahanReport({
  page,
  perPage,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  perPage: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryResult = useQuery({
    queryKey: ['jumlah-penyerahan-report', page, perPage, search, sortBy, sortOrder],
    queryFn: async () => {
      const params: JumlahPenyerahanReportParams = {
        page,
        per_page: perPage,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
        search: search || undefined,
      };

      return getHandoverReport(params);
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const rawItems = useMemo(() => queryResult.data?.data?.data || [], [queryResult.data?.data?.data]);

  // Safe client-side search filtering fallback
  const filteredData = useMemo(() => {
    if (!search?.trim()) return rawItems;
    const q = search.trim().toLowerCase();

    return rawItems.filter((item: HandoverReportItem) => {
      const stnkName = item.stnk_name || item.vehicle_data?.stnk_name || '';
      const bpkbNum = item.bpkb_number || '';
      const tnkbNum = item.tnkb_number || '';
      const chassisNum = item.chassis_number || item.vehicle_data?.chassis_number || '';
      const machineNum = item.machine_number || item.vehicle_data?.machine_number || '';
      const brand = item.vehicle_data?.motorcycle_brand || '';
      const type = item.vehicle_data?.motorcycle_type || item.vehicle_type || '';
      
      let vendorName = '';
      if (item.vendor) {
        if (typeof item.vendor === 'string') {
          vendorName = item.vendor;
        } else {
          vendorName = item.vendor.name || '';
        }
      }

      const dealerName = item.dealer || item.vehicle_data?.dealer?.name || '';
      const regionName = item.region || item.vehicle_data?.region?.name || '';

      return (
        stnkName.toLowerCase().includes(q) ||
        bpkbNum.toLowerCase().includes(q) ||
        tnkbNum.toLowerCase().includes(q) ||
        chassisNum.toLowerCase().includes(q) ||
        machineNum.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        type.toLowerCase().includes(q) ||
        vendorName.toLowerCase().includes(q) ||
        dealerName.toLowerCase().includes(q) ||
        regionName.toLowerCase().includes(q)
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
