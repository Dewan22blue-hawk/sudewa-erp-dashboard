import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getBpkbReport,
  getStnkReport,
  getSkpdReport,
  getTnkbReport,
  JumlahDaftarReportParams,
} from '@/services/report/jumlahDaftarReport.service';

export function useJumlahDaftarReport({
  activeTab,
  page,
  perPage,
  search,
  sortBy,
  sortOrder,
}: {
  activeTab: 'bpkb' | 'stnk' | 'skpd' | 'tnkb';
  page: number;
  perPage: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryResult = useQuery({
    queryKey: ['jumlah-daftar-report', activeTab, page, perPage, search, sortBy, sortOrder],
    queryFn: async () => {
      const params: JumlahDaftarReportParams = {
        page,
        per_page: perPage,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
        search: search || undefined,
      };

      if (activeTab === 'bpkb') return getBpkbReport(params);
      if (activeTab === 'stnk') return getStnkReport(params);
      if (activeTab === 'skpd') return getSkpdReport(params);
      return getTnkbReport(params);
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const rawItems = queryResult.data?.data?.data || [];

  // Safe client-side search filtering fallback
  const filteredData = useMemo(() => {
    if (!search?.trim()) return rawItems;
    const q = search.trim().toLowerCase();

    return rawItems.filter((item: any) => {
      const matchesStnkName = item?.stnk_name?.toLowerCase().includes(q);
      const matchesBpkbNum = item?.bpkb_number?.toLowerCase().includes(q);
      const matchesStnkNum = item?.stnk_number?.toLowerCase().includes(q);
      const matchesSkpdNum = item?.skpd_number?.toLowerCase().includes(q);
      const matchesTnkbNum = item?.tnkb_number?.toLowerCase().includes(q);
      const matchesRegion = item?.region?.toLowerCase().includes(q);
      const matchesDealer = item?.dealer?.toLowerCase().includes(q);
      const matchesVendor = item?.vendor?.toLowerCase().includes(q);
      const matchesVehicleType = item?.vehicle_type?.toLowerCase().includes(q);
      const matchesChassis = item?.chassis_number?.toLowerCase().includes(q);
      const matchesMachine = item?.machine_number?.toLowerCase().includes(q);

      return Boolean(
        matchesStnkName ||
        matchesBpkbNum ||
        matchesStnkNum ||
        matchesSkpdNum ||
        matchesTnkbNum ||
        matchesRegion ||
        matchesDealer ||
        matchesVendor ||
        matchesVehicleType ||
        matchesChassis ||
        matchesMachine
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
