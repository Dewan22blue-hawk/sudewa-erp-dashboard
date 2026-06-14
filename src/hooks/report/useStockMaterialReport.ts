import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getStockPerlengkapanReport,
  getPenerimaanBarangReport,
  getPengeluaranBarangReport,
  StockMaterialReportParams,
  MaterialStockReportItem,
} from '@/services/report/stockMaterialReport.service';

export function useStockMaterialReport({
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
    queryKey: ['stock-material-report', activeTab, companyId, page, perPage, search, sortBy, sortOrder],
    queryFn: async () => {
      const params: StockMaterialReportParams = {
        company_id: companyId,
        page,
        per_page: perPage,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
      };

      if (activeTab === 'stock') {
        // Laporan Stock Perlengkapan
        // Pass search query if backend supports it
        if (search) {
          params.search = search;
        }
        return getStockPerlengkapanReport(params);
      } else if (activeTab === 'penerimaan') {
        // Laporan Penerimaan Barang
        if (search) {
          params.search = search;
        }
        return getPenerimaanBarangReport(params);
      } else {
        // Laporan Pengeluaran Barang
        params.in_stock = true;
        if (search) {
          params.search = search;
        }
        return getPengeluaranBarangReport(params);
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

    return rawItems.filter((item: MaterialStockReportItem) => {
      const matCode = item.material?.code || '';
      const matName = item.material?.name || '';
      const matType = item.material?.type || '';
      const gtCode = item.goods_transaction?.code || '';
      const gtDate = item.goods_transaction?.transaction_date || '';
      const desc = item.description || '';
      const typeStr = item.type || '';

      return (
        matCode.toLowerCase().includes(q) ||
        matName.toLowerCase().includes(q) ||
        matType.toLowerCase().includes(q) ||
        gtCode.toLowerCase().includes(q) ||
        gtDate.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        typeStr.toLowerCase().includes(q)
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
