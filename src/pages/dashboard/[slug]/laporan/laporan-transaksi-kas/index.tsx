import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LaporanKasTable } from '@/components/features/laporan-kas/LaporanKasTable';
import { Eye, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLaporanKas } from '@/hooks/useLaporanKas';

export default function LaporanTransaksiKasPage() {
  const {
    data,
    pagination,
    isLoading,
    totalPemasukan,
    totalPengeluaran,
    setPage,
    setPerPage,
    setDateRange,
    setSearch,
  } = useLaporanKas();

  const [dateRange, setDateRangeState] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleShowData = () => {
    setIsFiltering(true);
    const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
    setDateRange(startDate, endDate);
    setTimeout(() => setIsFiltering(false), 100);
  };

  const getPageNumbers = () => {
    const { currentPage, lastPage } = pagination;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const isLoadingDisplay = isLoading || isFiltering;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Transaksi Kas</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau semua pemasukan dan pengeluaran</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Periode Transaksi</label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <DatePickerWithRange date={dateRange} onChange={setDateRangeState} />
              </div>
              <Button
                variant="outline"
                className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 shrink-0"
                onClick={handleShowData}
                disabled={isLoadingDisplay}
              >
                {isLoadingDisplay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Show
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Cari Transaksi</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nota atau keterangan..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Tampilkan per halaman</label>
            <Select
              value={String(pagination.perPage)}
              onValueChange={(val) => setPerPage(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 data</SelectItem>
                <SelectItem value="25">25 data</SelectItem>
                <SelectItem value="50">50 data</SelectItem>
                <SelectItem value="100">100 data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Table Content */}
        <div className="pt-4">
          {isLoadingDisplay ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <LaporanKasTable 
                data={data} 
                totalPemasukan={totalPemasukan}
                totalPengeluaran={totalPengeluaran}
              />
              
              {/* Pagination */}
              {data.length > 0 && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <div>
                    Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total} data
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {getPageNumbers().map((page, idx) => (
                      typeof page === 'number' ? (
                        <Button
                          key={idx}
                          variant={pagination.currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(page)}
                          className={pagination.currentPage === page ? "bg-gray-900" : ""}
                        >
                          {page}
                        </Button>
                      ) : (
                        <span key={idx} className="px-2 py-1">...</span>
                      )
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}