import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiDetailForm } from '@/components/features/do-ekspedisi/DOEkspedisiDetailForm';
import { useDoEkspedisiCustomerLookup, useDoEkspedisiDetail, useDoEkspedisiItemDetail, useDoEkspedisiItemDestinations } from '@/hooks/useDoEkspedisi';

export default function DetailDOEkspedisiItemPage() {
  const router = useRouter();
  const { itemId } = router.query;

  const [customerSearch, setCustomerSearch] = React.useState('');
  const detailQuery = useDoEkspedisiItemDetail(itemId ? String(itemId) : null);
  const destinationQuery = useDoEkspedisiItemDestinations({
    page: 1,
    perPage: 50,
    do_expedition_item_id: itemId ? String(itemId) : undefined,
    order_by: 'order_number',
    order_sort: 'asc',
    enabled: !!itemId,
  });
  const expeditionQuery = useDoEkspedisiDetail(detailQuery.data?.doExpeditionId ? String(detailQuery.data.doExpeditionId) : null);
  const customerLookup = useDoEkspedisiCustomerLookup(customerSearch);
  const detailData = detailQuery.data
    ? {
        ...detailQuery.data,
        destinations: destinationQuery.data?.data ?? detailQuery.data.destinations,
      }
    : null;

  if (detailQuery.isLoading || destinationQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">Memuat detail item DO...</div>
      </DashboardLayout>
    );
  }

  if (!detailData) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-red-500">Gagal memuat detail item DO</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">Detail DO</h1>
            <p className="text-sm text-slate-500">Nomor Polisi <span className="font-medium text-[#2563EB]">{expeditionQuery.data?.vehicle?.registrationNumber || '-'}</span></p>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="border-b border-[#E5E7EB] pb-4 text-[18px] font-semibold text-slate-900">Form Detail DO</h2>
          <DOEkspedisiDetailForm
            initialData={detailData}
            customerOptions={(customerLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
            onCustomerSearch={setCustomerSearch}
            readOnly
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
