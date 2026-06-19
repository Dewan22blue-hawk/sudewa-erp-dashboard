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
import { cn } from '@/lib/utils';

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
    setSort,
    sortKey,
    sortOrder,
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
      <div className="space-y-6 px-1">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Laporan Transaksi Kas</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau semua pemasukan dan pengeluaran</p>
        </div>

        {/* Filters */}
        <div className="flex items-end justify-between w-full no-print gap-4 flex-wrap bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex flex-col space-y-2">
              <label className="text-[13px] font-medium text-slate-700">Periode Transaksi</label>
              <div className="w-[280px]">
                <DatePickerWithRange date={dateRange} onChange={setDateRangeState} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[13px] font-medium text-slate-700">Cari Transaksi</label>
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search here"
                  className="pl-9 bg-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-[13px] font-medium text-slate-700">Tampilkan per halaman</label>
              <Select
                value={String(pagination.perPage)}
                onValueChange={(val) => setPerPage(Number(val))}
              >
                <SelectTrigger className="w-[120px] bg-white">
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

            <Button
              variant="outline"
              className="bg-[#f8f9fa] shadow-sm text-gray-700 gap-2 shrink-0 h-10 px-4 mb-[1px]"
              onClick={handleShowData}
              disabled={isLoadingDisplay}
            >
              {isLoadingDisplay ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Show
            </Button>
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
                onSort={(key) => setSort(key, sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc')}
                sortKey={sortKey}
                sortOrder={sortOrder}
              />
              
              {/* Pagination */}
              {data.length > 0 && (
                <div className="flex flex-col gap-4 px-1 py-4 md:flex-row md:items-center md:justify-between no-print">
                  <div className="text-sm text-slate-500">
                    Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total} data
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
                    >
                      Previous
                    </Button>
                    
                    {getPageNumbers().map((pageNumber, idx) => (
                      typeof pageNumber === 'number' ? (
                        <Button
                          key={idx}
                          variant={pageNumber === pagination.currentPage ? 'outline' : 'ghost'}
                          size="sm"
                          onClick={() => setPage(pageNumber)}
                          className={cn(
                            "h-9 min-w-9 rounded-xl border-slate-200 text-[13px] font-semibold cursor-pointer",
                            pageNumber === pagination.currentPage
                              ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-slate-200 hover:bg-slate-50"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {pageNumber}
                        </Button>
                      ) : (
                        <span key={idx} className="px-1.5 text-slate-400">...</span>
                      )
                    ))}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.lastPage}
                      className="rounded-xl px-3 hover:bg-slate-100 font-semibold text-[13px] cursor-pointer"
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