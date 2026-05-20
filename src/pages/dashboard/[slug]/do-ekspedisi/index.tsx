import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiTable } from '@/components/features/do-ekspedisi/DOEkspedisiTable';
import { DeleteDOEkspedisiModal } from '@/components/features/do-ekspedisi/DeleteDOEkspedisiModal';
import { DOEkspedisiEditDialog, type DOEkspedisiEditValues } from '@/components/features/do-ekspedisi/DOEkspedisiEditDialog';
import { DOEkspedisiUploadDialog } from '@/components/features/do-ekspedisi/DOEkspedisiUploadDialog';
import type { DoEkspedisi } from '@/@types/do-ekspedisi.types';
import {
  useDeleteDoEkspedisi,
  useDoEkspedisiDriverLookup,
  useDoEkspedisis,
  useDoEkspedisiVehicleLookup,
  useNextDoEkspedisiCode,
  useUpdateDoEkspedisi,
} from '@/hooks/useDoEkspedisi';

const toApiDate = (value?: Date) => {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DOEkspedisiPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoEkspedisi | null>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useDoEkspedisis({
    page,
    perPage,
    search,
    order_by: 'created_at',
    order_sort: 'desc',
  });
  const deleteMutation = useDeleteDoEkspedisi();
  const updateMutation = useUpdateDoEkspedisi();
  const nextCodeQuery = useNextDoEkspedisiCode(isEditOpen);
  const vehicleLookup = useDoEkspedisiVehicleLookup(vehicleSearch, isEditOpen);
  const driverLookup = useDoEkspedisiDriverLookup(driverSearch, isEditOpen);

  const handleDelete = (item: DoEkspedisi) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Data DO Ekspedisi berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data DO Ekspedisi');
    }
  };

  const handleEditSubmit = async (values: DOEkspedisiEditValues) => {
    if (!selectedItem) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedItem.id,
        payload: {
          date: toApiDate(values.date),
          vehicle_id: values.vehicleId,
          driver_id: values.driverId,
          driver_note: values.driverNote,
        },
      });
      toast.success('Data DO Ekspedisi berhasil diperbarui');
      setIsEditOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui DO Ekspedisi');
    }
  };

  const handleUpload = async () => {
    toast.info('Endpoint upload SJ/Invoice belum tersedia di dokumentasi API.');
    setIsUploadOpen(false);
    setSelectedItem(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[24px] font-semibold text-slate-950">Data DO Ekspedisi</h1>
          <p className="mt-1 text-sm text-slate-500">Buat faktur dengan informasi penagihan yang diperlukan.</p>
        </div>

        <DOEkspedisiTable
          data={listQuery.data?.data ?? []}
          search={searchInput}
          page={page}
          perPage={perPage}
          totalData={listQuery.data?.meta.total ?? 0}
          totalPages={listQuery.data?.meta.lastPage ?? 1}
          isLoading={listQuery.isLoading}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onAdd={() => slug && router.push(`/dashboard/${slug}/do-ekspedisi/create`)}
          onEdit={(item) => {
            setSelectedItem(item);
            setIsEditOpen(true);
          }}
          onDetail={(item) => slug && router.push(`/dashboard/${slug}/do-ekspedisi/detail/${item.id}`)}
          onDelete={handleDelete}
          onUpload={(item) => {
            setSelectedItem(item);
            setIsUploadOpen(true);
          }}
          onPrint={(item) => {
            if (!slug) return;
            toast.info(`Buka detail untuk print DO ${item.doCode}`);
            router.push(`/dashboard/${slug}/do-ekspedisi/detail/${item.id}`);
          }}
        />
      </div>

      <DeleteDOEkspedisiModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
        itemName={selectedItem?.doCode}
      />

      <DOEkspedisiEditDialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedItem(null);
        }}
        item={selectedItem}
        nextCode={nextCodeQuery.data}
        vehicleOptions={(vehicleLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
        driverOptions={(driverLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
        vehicleLoading={vehicleLookup.isLoading}
        driverLoading={driverLookup.isLoading}
        onVehicleSearch={setVehicleSearch}
        onDriverSearch={setDriverSearch}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
      />

      <DOEkspedisiUploadDialog
        open={isUploadOpen}
        onOpenChange={(open) => {
          setIsUploadOpen(open);
          if (!open) setSelectedItem(null);
        }}
        onSubmit={handleUpload}
      />
    </DashboardLayout>
  );
}
