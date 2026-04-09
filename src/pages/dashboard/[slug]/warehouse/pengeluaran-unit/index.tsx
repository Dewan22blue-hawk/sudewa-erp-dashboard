'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import PengeluaranUnitTable from '@/components/features/pengeluaran-unit/PengeluaranUnitTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { usePengeluaranUnits } from '@/hooks/usePengeluaranUnit';

export default function PengeluaranUnitPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

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
      perPage,
      search: search || undefined,
      sortBy: 'created_at',
      sortDirection: 'desc' as const,
    }),
    [page, perPage, search],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = usePengeluaranUnits(query);

  const meta = data?.meta ?? {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
  };

  const errorMessage = useMemo(() => {
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return 'Gagal memuat data pengeluaran unit';
    }

    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : 'Gagal memuat data pengeluaran unit';
  }, [error]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Pengeluaran Unit</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dan lacak semua data pengeluaran stock unit</p>
          </div>

          <Button onClick={() => router.push(`/dashboard/${router.query.slug}/warehouse/pengeluaran-unit/create`)} className="bg-[#132c4a] hover:bg-[#1e3256] text-white font-medium px-4 py-2 text-sm rounded-lg shadow-sm">
            + Tambah
          </Button>
        </div>

        <PengeluaranUnitTable
          data={data?.data ?? []}
          meta={meta}
          search={searchInput}
          perPage={perPage}
          page={page}
          isLoading={isLoading || isFetching}
          isError={isError}
          errorMessage={errorMessage}
          onSearchChange={setSearchInput}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onPageChange={setPage}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
