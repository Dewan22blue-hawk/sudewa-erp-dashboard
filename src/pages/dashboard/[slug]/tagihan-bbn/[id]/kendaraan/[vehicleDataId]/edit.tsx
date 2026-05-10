import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BBNBillVehicleFeeForm } from '@/components/features/tagihan-bbn/BBNBillVehicleFeeForm';
import { useBBNBillDetail, useUpdateBBNBillVehicleData } from '@/hooks/useBBNBill';

export default function EditBBNBillVehiclePage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = typeof router.query.id === 'string' ? router.query.id : null;
  const vehicleDataId = typeof router.query.vehicleDataId === 'string' ? Number(router.query.vehicleDataId) : null;

  const detailQuery = useBBNBillDetail(id);
  const updateMutation = useUpdateBBNBillVehicleData();

  const vehicle = React.useMemo(() => {
    if (!vehicleDataId) return null;
    return detailQuery.data?.dealerDetail?.vehicleDatas.find((item) => item.id === vehicleDataId) ?? null;
  }, [detailQuery.data?.dealerDetail?.vehicleDatas, vehicleDataId]);

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat detail kendaraan...</div>
      ) : detailQuery.isError || !vehicle ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Detail kendaraan tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <BBNBillVehicleFeeForm
          vehicle={vehicle}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push(`/dashboard/${slug}/tagihan-bbn/${id}`)}
          onSubmit={async (payload) => {
            if (!vehicleDataId) return;

            try {
              await updateMutation.mutateAsync({ vehicleDataId, payload });
              toast.success('Data detail STNK/BPKB berhasil diperbarui');
              router.push(`/dashboard/${slug}/tagihan-bbn/${id}`);
            } catch (error: any) {
              toast.error(error.message || 'Gagal memperbarui detail STNK/BPKB');
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}
