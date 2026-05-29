import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Search, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import type { PPNPenjualan } from '@/@types/ppn-penjualan.types';
import PPNPenjualanFormDialog from '@/components/features/ppn-penjualan/PPNPenjualanFormDialog';
import PPNPenjualanTable from '@/components/features/ppn-penjualan/PPNPenjualanTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePPNPenjualan } from '@/hooks/usePPNPenjualan';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function DataPPNPenjualanPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('buy_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<PPNPenjualan | null>(null);
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

  const { data, isLoading, isFetching, isError, error, refetch } = usePPNPenjualan(query);

  const errorMessage = useMemo(() => {
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data PPN penjualan';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data PPN penjualan';
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
        <title>Data PPN Penjualan - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-6 grid grid-cols-1">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data PPN Penjualan</h1>
          <p className="text-sm text-gray-500">Kelola dan lacak semua data PPN penjualan unit langsung dari report backend.</p>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center flex-wrap">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder="Cari kode invoice, customer, atau tipe unit" className="pl-10 bg-white" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-[150px]">
                <DatePicker value={startDate} onChange={(date) => { setStartDate(date ?? null); setPage(1); }} placeholder="Mulai Tanggal" />
              </div>
              <span className="text-gray-500 text-sm">s/d</span>
              <div className="w-[150px]">
                <DatePicker value={endDate} onChange={(date) => { setEndDate(date ?? null); setPage(1); }} placeholder="Sampai Tanggal" />
              </div>
            </div>

            {searchInput || startDate || endDate ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStartDate(null);
                  setEndDate(null);
                  setPage(1);
                }}
              >
                Reset
              </Button>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select
                value={String(perPage)}
                onValueChange={(value) => {
                  setPerPage(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px] bg-white">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">Page</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full xl:w-auto" onClick={() => void refetch()} disabled={isFetching}>
            <RotateCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <PPNPenjualanTable
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

        <PPNPenjualanFormDialog
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
