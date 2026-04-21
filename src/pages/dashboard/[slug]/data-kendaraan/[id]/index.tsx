import * as React from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VehicleDataDetail } from '@/components/features/vehicle-data/VehicleDataDetail';
import { useVehicleDataDetail } from '@/hooks/useVehicleData';

export default function VehicleDataDetailPage() {
  const router = useRouter();
  const slug = router.isReady && typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? router.query.id : null;
  const detailQuery = useVehicleDataDetail(id);

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat detail data kendaraan...</div>
      ) : detailQuery.isError || !detailQuery.data ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Data kendaraan tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">
            Kembali
          </button>
        </div>
      ) : (
        <VehicleDataDetail data={detailQuery.data} slug={slug} />
      )}
    </DashboardLayout>
  );
}
