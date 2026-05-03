import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiForm, type DOEkspedisiFormData } from '@/components/features/do-ekspedisi/DOEkspedisiForm';
import {
  useCreateDoEkspedisi,
  useCreateDoEkspedisiItem,
  useDoEkspedisiCustomerLookup,
  useDoEkspedisiDriverLookup,
  useDoEkspedisiVehicleLookup,
} from '@/hooks/useDoEkspedisi';

const toApiDate = (value?: Date) => {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CreateDOEkspedisiPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [vehicleSearch, setVehicleSearch] = React.useState('');
  const [driverSearch, setDriverSearch] = React.useState('');
  const [customerSearch, setCustomerSearch] = React.useState('');

  const vehicleLookup = useDoEkspedisiVehicleLookup(vehicleSearch);
  const driverLookup = useDoEkspedisiDriverLookup(driverSearch);
  const customerLookup = useDoEkspedisiCustomerLookup(customerSearch);

  const createExpeditionMutation = useCreateDoEkspedisi();
  const createItemMutation = useCreateDoEkspedisiItem();

  const handleSave = async (values: DOEkspedisiFormData) => {
    try {
      const expedition = await createExpeditionMutation.mutateAsync({
        date: toApiDate(values.date),
        vehicle_id: values.vehicleId,
        driver_id: values.driverId,
      });

      await createItemMutation.mutateAsync({
        do_expedition_id: expedition.id,
        customer_id: values.customerId,
        loading_in: values.loadingIn,
        loading_out: values.loadingOut,
        destination: values.destination,
        invoice_fee: values.invoiceFee || 0,
        additional_cost_fee: values.additionalCostFee || 0,
        other_fee: values.otherFee || 0,
        driver_fee: values.driverFee || 0,
      });

      toast.success('Data DO Ekspedisi berhasil ditambahkan');
      if (slug) {
        router.push(`/dashboard/${slug}/do-ekspedisi`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data DO Ekspedisi');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="rounded-md p-1 transition-colors hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">Form Data Ekspedisi</h1>
            <p className="text-sm text-slate-500">Nomor Polisi akan mengikuti armada yang dipilih</p>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="border-b border-[#E5E7EB] pb-4 text-[18px] font-semibold text-slate-900">Form Detail DO</h2>
          <DOEkspedisiForm
            mode="create"
            vehicleOptions={(vehicleLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
            driverOptions={(driverLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
            customerOptions={(customerLookup.data ?? []).map((item) => ({ value: String(item.id), label: item.label, subtitle: item.subtitle }))}
            vehicleLoading={vehicleLookup.isLoading}
            driverLoading={driverLookup.isLoading}
            customerLoading={customerLookup.isLoading}
            onVehicleSearch={setVehicleSearch}
            onDriverSearch={setDriverSearch}
            onCustomerSearch={setCustomerSearch}
            onSubmit={handleSave}
            isSubmitting={createExpeditionMutation.isPending || createItemMutation.isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
