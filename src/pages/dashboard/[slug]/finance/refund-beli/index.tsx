import { useEffect, useState } from 'react';
import Head from 'next/head';
import { RotateCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { RefundBeli } from '@/@types/refund-beli.types';
import RefundBeliTable from '@/components/features/refund-beli/RefundBeliTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRefundBeli } from '@/hooks/useRefundBeli';
import { useTableSort } from '@/hooks/useTableSort';

export default function RefundBeliPage() {
  const { data, pagination, isLoading, isFetching, error, fetchData, setPage, setPerPage, setSearch } = useRefundBeli();
  const [searchInput, setSearchInput] = useState('');

  const { sortedData, sortKey, sortOrder, handleSort } = useTableSort<RefundBeli>({
    data,
    defaultSortKey: 'tanggal',
    defaultSortOrder: 'asc',
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchInput, setPage, setSearch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (pagination.currentPage > pagination.lastPage) {
      setPage(pagination.lastPage || 1);
    }
  }, [pagination.currentPage, pagination.lastPage, setPage]);

  return (
    <DashboardLayout>
      <Head>
        <title>Data Refund Pembelian - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Data Refund Pembelian</h1>
            <p className="text-sm text-gray-500">Kelola data refund pembelian dari API finance.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative w-full md:w-[320px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari data refund"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="bg-white pl-10"
              />
            </div>

            {searchInput ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
              >
                Reset
              </Button>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <Select
                value={String(pagination.perPage)}
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

          <div className="flex w-full items-center justify-end gap-2 xl:w-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full xl:w-auto"
              onClick={() => void fetchData(pagination.currentPage, pagination.perPage, searchInput.trim())}
              disabled={isFetching}
            >
              <RotateCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <RefundBeliTable
          data={sortedData}
          pagination={pagination}
          sortKey={sortKey as string | undefined}
          sortOrder={sortOrder}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRetry={() => void fetchData(pagination.currentPage, pagination.perPage, searchInput.trim())}
          onSort={handleSort}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
