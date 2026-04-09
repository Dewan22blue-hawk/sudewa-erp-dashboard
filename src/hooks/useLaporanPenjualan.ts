import { useState, useEffect, useCallback, useRef } from 'react';
import { getLaporanPenjualan, SalesTransactionParams, SalesTransactionItem } from '@/services/laporan-penjualan.service';
import { toast } from 'sonner';

export type ReportType = 'per-nota' | 'per-type' | 'per-customer';

interface UseLaporanPenjualanReturn {
  data: SalesTransactionItem[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
  isLoading: boolean;
  error: string | null;
  startDate: string | null;
  endDate: string | null;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setCustomer: (customerId: number | null) => void;
  setSearch: (search: string) => void;
  applyFilters: (filters: {
    startDate: string | null;
    endDate: string | null;
    customerId: number | null;
    search: string;
  }) => void;
  resetFiltersForTab: (tab: string) => void;
  refetch: () => void;
}

export const useLaporanPenjualan = (): UseLaporanPenjualanReturn => {
  const [data, setData] = useState<SalesTransactionItem[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPerPage, setCurrentPerPage] = useState(10);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');
  const latestRequestRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    setIsLoading(true);
    setError(null);
    try {
      const params: SalesTransactionParams = {
        page: currentPage,
        per_page: currentPerPage,
      };
      
      // CATATAN: Backend rute ini mengalami HTTP 500 Error ketika menerima parameter start_date/person_id.
      // Oleh karena itu, kita MENGHAPUS pengiriman parameter ini ke backend,
      // dan mengandalkan 100% Filter Sisi Klien (Client-Side Filtering) yang sudah kita buat di bawah.
      
      const result = await getLaporanPenjualan(params);

      // Prevent stale response from older request overriding newest result.
      if (requestId !== latestRequestRef.current) {
        return;
      }
      
      // If backend fails to filter properly, apply client-side filtering fallback.
      let filteredData = Array.isArray(result?.data) ? result.data : [];

      if (startDate && endDate) {
        filteredData = filteredData.filter(item => {
          if (!item?.created_at) return true;
          try {
            // Support both T and space separated dates
            const dateOnly = String(item.created_at).split(/[T ]/)[0]; 
            return dateOnly >= startDate && dateOnly <= endDate;
          } catch(e) {
            return true;
          }
        });
      }

      if (selectedCustomer) {
        filteredData = filteredData.filter(item => item?.person?.id === selectedCustomer || (item as any)?.person_id === selectedCustomer);
      }

      if (currentSearch) {
        const q = String(currentSearch).toLowerCase();
        filteredData = filteredData.filter(item => {
          return (item?.unit_transaction_items || []).some(
            u => u?.unit_type?.name?.toLowerCase().includes(q)
          );
        });
      }

      setData(filteredData);
      setPagination({
        currentPage: result?.current_page || 1,
        lastPage: result?.last_page || 1,
        perPage: result?.per_page || 10,
        total: result?.total || 0,
        from: result?.from || 0,
        to: result?.to || 0,
      });
    } catch (err: any) {
      if (requestId !== latestRequestRef.current) {
        return;
      }

      console.error("Fetch Data Error:", err);
      setError(err.message || 'Gagal mengambil data laporan penjualan');
      toast.error('Gagal memuat data');
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, currentPerPage, startDate, endDate, selectedCustomer, currentSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    isLoading,
    error,
    startDate,
    endDate,
    setPage: setCurrentPage,
    setPerPage: (perPage: number) => {
      setCurrentPerPage(perPage);
      setCurrentPage(1);
    },
    setDateRange: (start: string | null, end: string | null) => {
      setStartDate(start);
      setEndDate(end);
      setCurrentPage(1);
    },
    setCustomer: (customerId: number | null) => {
      setSelectedCustomer(customerId);
      setCurrentPage(1);
    },
    setSearch: (search: string) => {
      setCurrentSearch(search);
      setCurrentPage(1);
    },
    applyFilters: ({ startDate: nextStartDate, endDate: nextEndDate, customerId, search }) => {
      setStartDate(nextStartDate);
      setEndDate(nextEndDate);
      setSelectedCustomer(customerId);
      setCurrentSearch(search);
      setCurrentPage(1);
    },
    resetFiltersForTab: (tab: string) => {
      setCurrentPage(1);

      if (tab === 'per-nota') {
        setSelectedCustomer(null);
        setCurrentSearch('');
        return;
      }

      if (tab === 'per-customer') {
        setCurrentSearch('');
        return;
      }

      setSelectedCustomer(null);
    },
    refetch: fetchData,
  };
};
