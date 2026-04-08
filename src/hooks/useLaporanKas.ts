import { useState, useEffect, useCallback } from 'react';
import { cashFlowService, CashFlowItem, CashFlowQueryParams } from '@/services/cashFlow.service';
import { toast } from 'sonner';

interface UseLaporanKasReturn {
  data: CashFlowItem[];
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
  totalPemasukan: number;
  totalPengeluaran: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setSearch: (search: string) => void;
  refetch: () => void;
}

export const useLaporanKas = (): UseLaporanKasReturn => {
  const [data, setData] = useState<CashFlowItem[]>([]);
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
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPerPage, setCurrentPerPage] = useState(10);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [currentSearch, setCurrentSearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CashFlowQueryParams = {
        page: currentPage,
        per_page: currentPerPage,
        search: currentSearch || undefined,
      };
      
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const result = await cashFlowService.getCashFlow(params);
      
      setData(result.data);
      setPagination({
        currentPage: result.current_page,
        lastPage: result.last_page,
        perPage: result.per_page,
        total: result.total,
        from: result.from || 0,
        to: result.to || 0,
      });
      
      // Hitung total pemasukan dan pengeluaran dari data yang ditampilkan
      const pemasukan = result.data.reduce((sum, item) => sum + (item.debet || 0), 0);
      const pengeluaran = result.data.reduce((sum, item) => sum + (item.credit || 0), 0);
      setTotalPemasukan(pemasukan);
      setTotalPengeluaran(pengeluaran);
      
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data laporan kas');
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentPerPage, startDate, endDate, currentSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setDateRange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // Reset ke halaman pertama
  };

  return {
    data,
    pagination,
    isLoading,
    error,
    totalPemasukan,
    totalPengeluaran,
    setPage: setCurrentPage,
    setPerPage: (perPage: number) => {
      setCurrentPerPage(perPage);
      setCurrentPage(1);
    },
    setDateRange,
    setSearch: (search: string) => {
      setCurrentSearch(search);
      setCurrentPage(1);
    },
    refetch: fetchData,
  };
};
