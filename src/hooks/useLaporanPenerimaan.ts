import { useState, useEffect, useCallback } from 'react';
import { getLaporanPenerimaan, PenerimaanParams, PenerimaanItem } from '@/services/laporan-penerimaan.service';
import { toast } from 'sonner';

export type ReportType = 'penerimaan' | 'per-tipe' | 'per-supplier';

interface UseLaporanPenerimaanReturn {
  data: PenerimaanItem[];
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
  setSupplier: (supplierId: number | null) => void;
  setUnitType: (unitTypeId: number | null) => void;
  refetch: () => void;
}

export const useLaporanPenerimaan = (): UseLaporanPenerimaanReturn => {
  const [data, setData] = useState<PenerimaanItem[]>([]);
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
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: PenerimaanParams = {
        page: currentPage,
        per_page: currentPerPage,
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedSupplier) params.person_id = selectedSupplier;
      if (selectedUnitType) params.unit_type_id = selectedUnitType;

      const result = await getLaporanPenerimaan(params);

      setData(result.data);
      setPagination({
        currentPage: result.current_page,
        lastPage: result.last_page,
        perPage: result.per_page,
        total: result.total,
        from: result.from || 0,
        to: result.to || 0,
      });
    } catch (err: any) {
      console.error('Fetch Data Error:', err);
      setError(err.message || 'Gagal mengambil data laporan penerimaan');
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentPerPage, startDate, endDate, selectedSupplier, selectedUnitType]);

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
    setSupplier: (supplierId: number | null) => {
      setSelectedSupplier(supplierId);
      setCurrentPage(1);
    },
    setUnitType: (unitTypeId: number | null) => {
      setSelectedUnitType(unitTypeId);
      setCurrentPage(1);
    },
    refetch: fetchData,
  };
};
