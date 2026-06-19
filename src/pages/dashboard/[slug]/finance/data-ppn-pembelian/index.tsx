import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { RotateCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import type { PPNPembelian } from '@/@types/ppn-pembelian.types';
import PPNPembelianFormDialog from '@/components/features/ppn-pembelian/PPNPembelianFormDialog';
import PPNPembelianTable from '@/components/features/ppn-pembelian/PPNPembelianTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePPNPembelian } from '@/hooks/usePPNPembelian';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function DataPPNPembelianPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('buy_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<PPNPembelian | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const query = useMemo(
    () => ({
      page,
      per_page: perPage,
      search: search || undefined,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    [page, perPage, search, startDate, endDate, sortBy, sortDirection],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = usePPNPembelian(query);

  const errorMessage = useMemo(() => {
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data PPN pembelian';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data PPN pembelian';
  }, [error]);

  useEffect(() => {
    if (isError) {
      toast.error(errorMessage);
    }
  }, [errorMessage, isError]);

  const meta = data?.meta ?? {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };

  useEffect(() => {
    if (data?.isTotalExact && page > data.meta.lastPage) {
      setPage(data.meta.lastPage || 1);
    }
  }, [data?.isTotalExact, data?.meta.lastPage, page]);

  return (
    <DashboardLayout>
      <Head>
        <title>Data PPN Pembelian - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Data PPN Pembelian</h1>
            <p className="text-sm text-slate-500">Kelola dan lacak semua data PPN pembelian unit langsung dari report backend.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
          {/* === Kiri: Search + Date Filter === */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search here"
                className="pl-9 bg-white rounded-xl border-slate-200 shadow-sm h-9 text-sm"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            {/* Date Range Group */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-x divide-slate-200">
              <div className="w-[148px]">
                <DatePicker
                  className="rounded-none border-0 shadow-none bg-transparent h-9 text-sm"
                  value={startDate}
                  onChange={(date) => { setStartDate(date ?? null); setPage(1); }}
                  placeholder="Mulai Tanggal"
                />
              </div>
              <div className="px-2 text-slate-400 text-xs font-medium select-none">→</div>
              <div className="w-[148px]">
                <DatePicker
                  className="rounded-none border-0 shadow-none bg-transparent h-9 text-sm"
                  value={endDate}
                  onChange={(date) => { setEndDate(date ?? null); setPage(1); }}
                  placeholder="Sampai Tanggal"
                />
              </div>
            </div>

            {/* Reset Button */}
            {(searchInput || startDate || endDate) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 border border-slate-200 gap-1.5 text-xs font-medium"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStartDate(null);
                  setEndDate(null);
                  setPage(1);
                }}
              >
                <X className="h-3.5 w-3.5" />
                Reset Filter
              </Button>
            )}
          </div>

          {/* === Kanan: Show Per Page + Refresh === */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500 whitespace-nowrap">
              <span>Show</span>
              <Select
                value={String(perPage)}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] bg-white rounded-xl border-slate-200 shadow-sm cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>Page</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-slate-200 gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>


        <PPNPembelianTable
          data={data?.data ?? []}
          meta={meta}
          sortBy={sortBy}
          sortDirection={sortDirection}
          hasNextPage={data?.hasNextPage ?? false}
          isTotalExact={data?.isTotalExact ?? false}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={() => void refetch()}
          onPageChange={setPage}
          onSortChange={(nextSortBy) => {
            setPage(1);
            if (nextSortBy === sortBy) {
              setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
              return;
            }

            setSortBy(nextSortBy);
            setSortDirection('asc');
          }}
          onEdit={(item) => {
            setSelected(item);
            setOpenForm(true);
          }}
        />

        <PPNPembelianFormDialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelected(null);
          }}
          initialData={selected}
        />
      </div>
    </DashboardLayout>
  );
}
