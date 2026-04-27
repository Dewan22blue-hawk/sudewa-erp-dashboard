import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleRegistrationForm } from '@/components/features/vehicle-document/VehicleRegistrationForm';
import { useUpdateVehicleRegistration, useVehicleDocumentDetail } from '@/hooks/useVehicleDocument';
import type { VehicleRegistrationPayload } from '@/@types/vehicle-document.types';

export default function EditVehicleRegistrationPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const documentId = typeof router.query.id === 'string' ? router.query.id : null;
  const registrationId = typeof router.query.registrationId === 'string' ? Number(router.query.registrationId) : null;

  const detailQuery = useVehicleDocumentDetail(documentId);
  const updateMutation = useUpdateVehicleRegistration();

  const registration = React.useMemo(() => {
    if (!detailQuery.data || !registrationId) return null;
    return detailQuery.data.vehicleRegistrations.find((item) => item.id === registrationId) ?? null;
  }, [detailQuery.data, registrationId]);

  const handleSubmit = async (payload: VehicleRegistrationPayload) => {
    if (!registrationId || !documentId) return;

    try {
      await updateMutation.mutateAsync({ id: registrationId, payload });
      toast.success('Detail STNK/BPKB berhasil diperbarui');
      router.push(`/dashboard/${slug}/stnk-bpkb/${documentId}/edit`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui detail STNK/BPKB');
    }
  };

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat detail registrasi...</div>
      ) : detailQuery.isError || !registration ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Detail registrasi tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <VehicleRegistrationForm initialData={registration} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending} />
      )}
    </DashboardLayout>
  );
}
