import * as React from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleDataForm } from '@/components/features/vehicle-data/VehicleDataForm';
import { useCreateVehicleData } from '@/hooks/useVehicleData';
import type { VehicleDataPayload } from '@/@types/vehicle-data.types';
import { toast } from 'sonner';

export default function CreateVehicleDataPage() {
  const router = useRouter();
  const slug = String(router.query.slug || '');
  const createMutation = useCreateVehicleData();

  const handleSubmit = async (payload: VehicleDataPayload) => {
    try {
      const created = await createMutation.mutateAsync(payload);
      toast.success('Data kendaraan berhasil ditambahkan');
      router.push(`/dashboard/${slug}/data-kendaraan/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan data kendaraan');
    }
  };

  return (
    <DashboardLayout>
      <VehicleDataForm title="Input Data Kendaraan" onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </DashboardLayout>
  );
}
