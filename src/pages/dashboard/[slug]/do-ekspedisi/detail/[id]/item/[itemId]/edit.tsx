import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiDetailForm, type DOEkspedisiDetailFormData } from '@/components/features/do-ekspedisi/DOEkspedisiDetailForm';
import { useDoEkspedisiCustomerLookup, useDoEkspedisiDetail, useDoEkspedisiItemDetail, useUpdateDoEkspedisiItem } from '@/hooks/useDoEkspedisi';

export default function EditDOEkspedisiItemPage() {
  const router = useRouter();
  const { slug, itemId } = router.query;

  const [customerSearch, setCustomerSearch] = React.useState('');
  const detailQuery = useDoEkspedisiItemDetail(itemId ? String(itemId) : null);
  const expeditionQuery = useDoEkspedisiDetail(detailQuery.data?.doExpeditionId ? String(detailQuery.data.doExpeditionId) : null);
  const customerLookup = useDoEkspedisiCustomerLookup(customerSearch);
  const updateMutation = useUpdateDoEkspedisiItem();

  const handleSave = async (values: DOEkspedisiDetailFormData) => {
    if (!itemId || !detailQuery.data) return;

    try {
      await updateMutation.mutateAsync({
        id: String(itemId),
        payload: {
          do_expedition_id: detailQuery.data.doExpeditionId,
          customer_id: values.customerId,
          loading_in: values.loadingIn,
          loading_out: values.loadingOut,
          destination: values.destination,
          invoice_fee: values.invoiceFee || 0,
          additional_cost_fee: values.additionalCostFee || 0,
          other_fee: values.otherFee || 0,
          driver_fee: values.driverFee || 0,
        },
      });

      toast.success('Item DO Ekspedisi berhasil diperbarui');
      if (slug) {
        router.push(`/dashboard/${slug}/do-ekspedisi/detail/${detailQuery.data.doExpeditionId}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui item DO Ekspedisi');
    }
  };

  if (detailQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">Memuat detail item DO...</div>
      </DashboardLayout>
    );
  }

  if (!detailQuery.data) {
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
            initialData={detailQuery.data}
            customerOptions={(customerLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
            onCustomerSearch={setCustomerSearch}
            onSubmit={handleSave}
            isSubmitting={updateMutation.isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
