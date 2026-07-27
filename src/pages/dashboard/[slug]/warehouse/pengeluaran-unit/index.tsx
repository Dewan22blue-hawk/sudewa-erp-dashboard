'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';
import PengeluaranUnitTable from '@/components/features/pengeluaran-unit/PengeluaranUnitTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { usePengeluaranUnits } from '@/hooks/usePengeluaranUnit';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function PengeluaranUnitPage() {
  const router = useRouter();
  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('warehouse:create');
  const canEdit = hasPermission('warehouse:edit');
  const canDelete = hasPermission('warehouse:delete');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
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
        <PageHeader
          title="Data Pengeluaran Unit"
          subtitle="Kelola dan lacak semua data pengeluaran stock unit"
          actions={
            canCreate && (
              <Button onClick={() => router.push(`/dashboard/${router.query.slug}/warehouse/pengeluaran-unit/create`)} className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152e4d]">
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            )
          }
        />

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
