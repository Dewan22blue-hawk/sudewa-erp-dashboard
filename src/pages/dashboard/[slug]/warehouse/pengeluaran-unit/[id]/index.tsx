'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PengeluaranUnitHeaderCard from '@/components/features/pengeluaran-unit/PengeluaranUnitHeaderCard';
import PengeluaranUnitCreateTable from '@/components/features/pengeluaran-unit/PengeluaranUnitCreateTable';
import { Button } from '@/components/ui/button';
import { useDispatchPengeluaranStock, useDispatchUnitRows, usePengeluaranUnitById } from '@/hooks/usePengeluaranUnit';
import { toast } from 'sonner';

const getErrorMessageText = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return fallback;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
};

export default function DetailPengeluaranUnitPage() {
  const router = useRouter();
  const { id, slug } = router.query as { id?: string; slug?: string };

  const detailQuery = usePengeluaranUnitById(id);
  const dispatchMutation = useDispatchPengeluaranStock();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const dispatchTableQuery = useDispatchUnitRows({
    page,
    perPage,
    search: search || undefined,
    warehouseId: detailQuery.data?.warehouseId,
  });

  const detailError = getErrorMessageText(detailQuery.error, 'Gagal memuat detail pengeluaran unit');
  const tableError = getErrorMessageText(dispatchTableQuery.error, 'Gagal memuat data unit untuk pengeluaran');

  const handleKirim = async (ids: number[]) => {
    if (!id) return;
    if (ids.length === 0) {
      toast.error('Pilih minimal satu unit');
      return;
    }

    try {
      await dispatchMutation.mutateAsync({
        warehouseActivityId: id,
        detailIds: ids,
      });
      toast.success('Dispatch stock berhasil diproses');
      setSelectedIds([]);
      await dispatchTableQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memproses dispatch stock';
      toast.error(message);
    }
  };

  const tableMeta = useMemo(
    () =>
      dispatchTableQuery.data?.meta ?? {
        currentPage: page,
        perPage,
        total: 0,
        lastPage: 1,
      },
    [dispatchTableQuery.data?.meta, page, perPage],
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)}>
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Detail Pengeluaran Unit</h1>
          </div>
        </div>

        {detailQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">Loading...</div>
        ) : detailQuery.isError || !detailQuery.data ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 space-y-3">
            <p>{detailError}</p>
            <Button variant="outline" size="sm" onClick={() => void detailQuery.refetch()}>
              Coba Lagi
            </Button>
          </div>
        ) : (
          <>
            <PengeluaranUnitHeaderCard
              mode="detail"
              values={{
                activityNumber: detailQuery.data.activityNumber,
                activityDate: new Date(detailQuery.data.activityDate),
                warehouseName: detailQuery.data.warehouse?.name ?? '-',
                supplierName: detailQuery.data.person?.name ?? '-',
                description: detailQuery.data.description ?? '',
              }}
              warehouses={[]}
              suppliers={[]}
            />

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <PengeluaranUnitCreateTable
                data={dispatchTableQuery.data?.data ?? []}
                meta={tableMeta}
                search={searchInput}
                perPage={perPage}
                page={page}
                selectedIds={selectedIds}
                isLoading={dispatchTableQuery.isLoading || dispatchTableQuery.isFetching}
                isError={dispatchTableQuery.isError}
                isSubmitting={dispatchMutation.isPending}
                errorMessage={tableError}
                onSearchChange={setSearchInput}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
                onPageChange={setPage}
                onSelectedIdsChange={setSelectedIds}
                onKirim={handleKirim}
                onRetry={() => {
                  void dispatchTableQuery.refetch();
                }}
              />
            </div>

            <div className="flex justify-center items-center gap-4 mt-8 pb-4">
              <Button type="button" variant="ghost" className="px-6 font-medium text-gray-600 hover:bg-transparent hover:text-gray-900 text-sm" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit`)}>
                Kembali
              </Button>
              <Button type="button" onClick={() => router.push(`/dashboard/${slug}/warehouse/pengeluaran-unit/${id}/edit`)} className="px-6 h-10 bg-[#1e3256] hover:bg-[#15233d] text-white font-medium rounded-lg shadow-sm gap-2">
                <Pencil size={16} /> Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
