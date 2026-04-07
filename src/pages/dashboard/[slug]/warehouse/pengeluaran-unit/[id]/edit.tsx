'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, Save } from 'lucide-react';
import PengeluaranUnitHeaderCard from '@/components/features/pengeluaran-unit/PengeluaranUnitHeaderCard';
import PengeluaranUnitCreateTable from '@/components/features/pengeluaran-unit/PengeluaranUnitCreateTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  useDispatchPengeluaranStock,
  useDispatchUnitRows,
  usePengeluaranUnitById,
  useSupplierOptions,
  useUpdatePengeluaranUnit,
  useWarehouseOptions,
} from '@/hooks/usePengeluaranUnit';
import { PengeluaranUnitFormSchemaValues, pengeluaranUnitFormSchema } from '@/scheme/pengeluaran-unit.schema';
import { toSavePayload } from '@/services/pengeluaran-unit.service';

const getErrorMessageText = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return fallback;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
};

export default function EditPengeluaranUnitPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const detailQuery = usePengeluaranUnitById(id);
  const updateMutation = useUpdatePengeluaranUnit();
  const dispatchMutation = useDispatchPengeluaranStock();
  const warehousesQuery = useWarehouseOptions();
  const suppliersQuery = useSupplierOptions();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const form = useForm<PengeluaranUnitFormSchemaValues>({
    resolver: zodResolver(pengeluaranUnitFormSchema),
    defaultValues: {
      personId: 0,
      warehouseId: 0,
      activityDate: new Date(),
      description: '',
    },
  });

  useEffect(() => {
    const detail = detailQuery.data;
    if (!detail) return;

    form.reset({
      personId: detail.personId,
      warehouseId: detail.warehouseId,
      activityDate: new Date(detail.activityDate),
      description: detail.description ?? '',
    });
  }, [detailQuery.data, form]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const values = form.watch();

  const dispatchTableQuery = useDispatchUnitRows({
    page,
    perPage,
    search: search || undefined,
    warehouseId: values.warehouseId > 0 ? values.warehouseId : undefined,
  });

  const detailError = getErrorMessageText(detailQuery.error, 'Gagal memuat detail pengeluaran unit');
  const optionsError = getErrorMessageText(warehousesQuery.error ?? suppliersQuery.error, 'Gagal memuat opsi dropdown');
  const tableError = getErrorMessageText(dispatchTableQuery.error, 'Gagal memuat data unit untuk pengeluaran');

  const onSubmit = form.handleSubmit(async (payload) => {
    if (!id) return;

    try {
      await updateMutation.mutateAsync({
        id,
        payload: toSavePayload(payload),
      });
      toast.success('Data pengeluaran unit berhasil diperbarui');
      await router.push(`/dashboard/${router.query.slug}/warehouse/pengeluaran-unit/${id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui data pengeluaran unit';
      toast.error(message);
    }
  });

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
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 hover:bg-transparent" onClick={() => router.back()}>
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Edit Data Pengeluaran Unit</h1>
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
        ) : warehousesQuery.isError || suppliersQuery.isError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 space-y-3">
            <p>{optionsError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void warehousesQuery.refetch();
                void suppliersQuery.refetch();
              }}
            >
              Coba Lagi
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <PengeluaranUnitHeaderCard
              mode="edit"
              values={{
                activityNumber: detailQuery.data.activityNumber,
                activityDate: values.activityDate,
                warehouseId: values.warehouseId || undefined,
                supplierId: values.personId || undefined,
                description: values.description,
              }}
              errors={{
                activityDate: form.formState.errors.activityDate?.message,
                warehouseId: form.formState.errors.warehouseId?.message,
                supplierId: form.formState.errors.personId?.message,
                description: form.formState.errors.description?.message,
              }}
              warehouses={warehousesQuery.data ?? []}
              suppliers={suppliersQuery.data ?? []}
              isLoadingOptions={warehousesQuery.isLoading || suppliersQuery.isLoading}
              onActivityDateChange={(value) => form.setValue('activityDate', value ?? new Date(), { shouldValidate: true })}
              onWarehouseChange={(value) => {
                form.setValue('warehouseId', value, { shouldValidate: true });
                setPage(1);
              }}
              onSupplierChange={(value) => form.setValue('personId', value, { shouldValidate: true })}
              onDescriptionChange={(value) => form.setValue('description', value, { shouldValidate: true })}
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
              <Button type="button" variant="ghost" className="px-6 font-medium text-gray-600 hover:bg-transparent hover:text-gray-900 text-sm" onClick={() => router.push(`/dashboard/${router.query.slug}/warehouse/pengeluaran-unit/${id}`)}>
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || warehousesQuery.isLoading || suppliersQuery.isLoading} className="px-6 h-10 bg-[#1e3256] hover:bg-[#15233d] text-white font-medium rounded-lg shadow-sm gap-2">
                <Save size={16} /> {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
