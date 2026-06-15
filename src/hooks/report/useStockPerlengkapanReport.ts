import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getStockPerlengkapanReport,
  getPenerimaanPerlengkapanReport,
  getPengeluaranPerlengkapanReport,
  StockPerlengkapanReportParams,
  VehicleEquipmentReportItem,
} from '@/services/report/stockPerlengkapanReport.service';

export function useStockPerlengkapanReport({
  activeTab,
  companyId,
  page,
  perPage,
  search,
  sortBy,
  sortOrder,
}: {
  activeTab: 'stock' | 'penerimaan' | 'pengeluaran';
  companyId: number;
  page: number;
  perPage: number;
  search: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const queryResult = useQuery({
    queryKey: ['stock-perlengkapan-report', activeTab, companyId, page, perPage, search, sortBy, sortOrder],
    queryFn: async () => {
      const params: StockPerlengkapanReportParams = {
        company_id: companyId,
        page,
        per_page: perPage,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
      };

      if (search) {
        params.search = search;
      }

      if (activeTab === 'stock') {
        // Stock Perlengkapan requires in_stock=true
        params.in_stock = true;
        return getStockPerlengkapanReport(params);
      } else if (activeTab === 'penerimaan') {
        return getPenerimaanPerlengkapanReport(params);
      } else {
        return getPengeluaranPerlengkapanReport(params);
      }
    },
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });

  const rawItems = queryResult.data?.data?.data || [];

  // Safe client-side search filtering fallback
  const filteredData = useMemo(() => {
    if (!search?.trim()) return rawItems;
    const q = search.trim().toLowerCase();

    return rawItems.filter((item: VehicleEquipmentReportItem) => {
      // Prioritize nested vehicle_equipment
      const eqCode = item.vehicle_equipment?.code || item.code || '';
      const eqName = item.vehicle_equipment?.name || item.name || '';
      const gtCode = item.goods_transaction?.code || '';
      const gtDate = item.goods_transaction?.transaction_date || '';
      const desc = item.description || '';
      const typeStr = item.type || '';
      
      const regNumber = item.goods_transaction?.vehicle_fleet?.registration_number || 
                        item.vehicle_fleet?.registration_number || 
                        item.goods_transaction?.vehicle?.registration_number || 
                        item.armada || '';
                        
      const driverName = item.goods_transaction?.driver?.name || 
                         item.driver?.name || '';

      return (
        eqCode.toLowerCase().includes(q) ||
        eqName.toLowerCase().includes(q) ||
        gtCode.toLowerCase().includes(q) ||
        gtDate.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        typeStr.toLowerCase().includes(q) ||
        regNumber.toLowerCase().includes(q) ||
        driverName.toLowerCase().includes(q)
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
