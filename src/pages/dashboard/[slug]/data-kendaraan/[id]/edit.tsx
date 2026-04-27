import * as React from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleDataForm } from '@/components/features/vehicle-data/VehicleDataForm';
import { useUpdateVehicleData, useVehicleDataDetail } from '@/hooks/useVehicleData';
import type { VehicleDataPayload } from '@/@types/vehicle-data.types';
import { toast } from 'sonner';

export default function EditVehicleDataPage() {
  const router = useRouter();
  const slug = String(router.query.slug || '');
  const id = String(router.query.id || '');
  const detailQuery = useVehicleDataDetail(id || null);
  const updateMutation = useUpdateVehicleData();

  const handleSubmit = async (payload: VehicleDataPayload) => {
    if (!id) return;

    try {
      await updateMutation.mutateAsync({ id, data: payload });
      toast.success('Data kendaraan berhasil diperbarui');
      router.push(`/dashboard/${slug}/data-kendaraan/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui data kendaraan');
    }
  };

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat data kendaraan...</div>
      ) : detailQuery.isError || !detailQuery.data ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Gagal memuat data kendaraan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">
            Kembali
          </button>
        </div>
      ) : (
        <VehicleDataForm
          title="Edit Data Kendaraan"
          initialData={detailQuery.data}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
