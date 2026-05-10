import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleRegistrationForm } from '@/components/features/vehicle-document/VehicleRegistrationForm';
import type { VehicleDataPayload } from '@/@types/vehicle-data.types';
import { useUpdateVehicleRegistration, useVehicleDocumentDetail, useVehicleRegistrations } from '@/hooks/useVehicleDocument';
import { useUpdateVehicleData } from '@/hooks/useVehicleData';
import type { VehicleRegistrationPayload } from '@/@types/vehicle-document.types';

export default function EditVehicleRegistrationPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const documentId = typeof router.query.id === 'string' ? router.query.id : null;
  const registrationId = typeof router.query.registrationId === 'string' ? Number(router.query.registrationId) : null;

  const detailQuery = useVehicleDocumentDetail(documentId);
  const updateMutation = useUpdateVehicleRegistration();
  const updateVehicleDataMutation = useUpdateVehicleData();
  const registrationsQuery = useVehicleRegistrations(
    {
      page: 1,
      perPage: 1000,
      vendorId: detailQuery.data?.vendorId ?? null,
      vehicleDocumentId: detailQuery.data?.id ?? null,
    },
    !!detailQuery.data?.vendorId,
  );

  const registration = React.useMemo(() => {
    if (!registrationId) return null;

    const registrations = registrationsQuery.data?.data ?? [];
    const vendorId = detailQuery.data?.vendorId ?? null;
    const documentDetailId = detailQuery.data?.id ?? null;

    return (
      registrations.find((item) => {
        if (item.id !== registrationId) return false;
        if (vendorId != null && item.vendorId != null && Number(item.vendorId) !== Number(vendorId)) return false;
        if (documentDetailId != null && item.vehicleDocumentId != null && Number(item.vehicleDocumentId) !== Number(documentDetailId)) return false;
        return true;
      }) ?? null
    );
  }, [detailQuery.data?.id, detailQuery.data?.vendorId, registrationId, registrationsQuery.data?.data]);

  const handleSubmit = async ({ registrationPayload, vehicleDataPayload }: { registrationPayload: VehicleRegistrationPayload; vehicleDataPayload: Partial<VehicleDataPayload> }) => {
    if (!registrationId || !documentId) return;

    try {
      if (typeof window !== 'undefined') {
        console.group('[VehicleRegistrationPage][Submit]');
        console.log('registrationId', registrationId);
        console.log('documentId', documentId);
        console.log('vehicleDataId', registration?.vehicleDataId ?? null);
        console.log('registrationPayload', registrationPayload);
        console.log('vehicleDataPayload', vehicleDataPayload);
        console.groupEnd();
      }

      await updateMutation.mutateAsync({ id: registrationId, payload: registrationPayload });

      if (registration?.vehicleDataId) {
        if (typeof window !== 'undefined') {
          console.group('[VehicleData][Update]');
          console.log('vehicleDataId', registration.vehicleDataId);
          console.log('payload', vehicleDataPayload);
          console.groupEnd();
        }

        await updateVehicleDataMutation.mutateAsync({
          id: registration.vehicleDataId,
          data: vehicleDataPayload,
        });
      }

      toast.success('Detail STNK/BPKB berhasil diperbarui');
      router.push(`/dashboard/${slug}/stnk-bpkb/${documentId}/edit`);
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui detail STNK/BPKB');
    }
  };

  return (
    <DashboardLayout>
      {detailQuery.isLoading || registrationsQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat detail registrasi...</div>
      ) : detailQuery.isError || !registration ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Detail registrasi tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <VehicleRegistrationForm initialData={registration} onSubmit={handleSubmit} isSubmitting={updateMutation.isPending || updateVehicleDataMutation.isPending} />
      )}
    </DashboardLayout>
  );
}
