import * as React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SearchableSelect } from '@/components/features/vehicle-data/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { useDitlantasProcessOptions } from '@/hooks/useVehicleDocument';
import { useBBNBillDetail, useUpdateBBNBill } from '@/hooks/useBBNBill';
import { toDateValue, toPayloadDate } from '@/components/features/tagihan-bbn/utils';

type FormValues = {
  ditlantasProcessId: string;
  billDate?: Date;
  paidDate?: Date;
};

export default function EditBBNBillPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = typeof router.query.id === 'string' ? router.query.id : null;

  const [ditlantasSearch, setDitlantasSearch] = React.useState('');
  const detailQuery = useBBNBillDetail(id);
  const ditlantasQuery = useDitlantasProcessOptions(ditlantasSearch, false);
  const updateMutation = useUpdateBBNBill();
  const form = useForm<FormValues>({
    defaultValues: {
      ditlantasProcessId: '',
      billDate: undefined,
      paidDate: undefined,
    },
  });

  React.useEffect(() => {
    if (!detailQuery.data) return;
    form.reset({
      ditlantasProcessId: detailQuery.data.ditlantasProcess?.id
        ? String(detailQuery.data.ditlantasProcess.id)
        : detailQuery.data.dealerId
        ? String(detailQuery.data.dealerId)
        : '',
      billDate: toDateValue(detailQuery.data.billDate),
      paidDate: toDateValue(detailQuery.data.paidDate),
    });
  }, [detailQuery.data, form]);

  const currentDitlantas = detailQuery.data?.ditlantasProcess;

  const ditlantasOptions = React.useMemo(() => {
    const list = (ditlantasQuery.data ?? [])
      .filter((item) => {
        if (item.isAlreadyProcessed === true) return false;
        if (item.unprocessedCount === 0) return false;
        return true;
      })
      .map((item) => ({
        value: String(item.id),
        label: `${item.code} - ${item.vendorName || ''}`,
        subtitle: item.vendorName || undefined,
      }));

    if (currentDitlantas && currentDitlantas.id) {
      const exists = list.some((opt) => opt.value === String(currentDitlantas.id));
      if (!exists) {
        list.unshift({
          value: String(currentDitlantas.id),
          label: `${currentDitlantas.code} - ${currentDitlantas.vendor?.name || ''}`,
          subtitle: currentDitlantas.vendor?.name || undefined,
        });
      }
    }

    return list;
  }, [ditlantasQuery.data, currentDitlantas]);

  return (
    <DashboardLayout>
      {detailQuery.isLoading ? (
        <div className="flex h-[360px] items-center justify-center text-slate-500">Memuat data tagihan BBN...</div>
      ) : detailQuery.isError || !detailQuery.data ? (
        <div className="flex h-[360px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-500">Data tagihan BBN tidak ditemukan.</p>
          <button onClick={() => router.back()} className="text-sm text-blue-600 underline">Kembali</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-[30px] font-semibold tracking-[-0.02em] text-slate-950">Ubah Data Tagihan BBN</h1>
              <p className="mt-1 text-sm text-slate-500">Perbarui proses ditlantas dan tanggal tagihan sesuai kebutuhan.</p>
            </div>
          </div>

          <Card className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <form
              onSubmit={form.handleSubmit(async (values) => {
                if (!id) return;

                try {
                  await updateMutation.mutateAsync({
                    id,
                    payload: {
                      ditlantasProcessId: values.ditlantasProcessId,
                      billDate: toPayloadDate(values.billDate),
                      paidDate: toPayloadDate(values.paidDate),
                    },
                  });
                  toast.success('Tagihan BBN berhasil diperbarui');
                  router.push(`/dashboard/${slug}/tagihan-bbn/${id}`);
                } catch (error: any) {
                  toast.error(getApiErrorMessage(error));
                }
              })}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Proses Ditlantas</Label>
                <Controller
                  name="ditlantasProcessId"
                  control={form.control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={ditlantasOptions}
                      onSearchChange={setDitlantasSearch}
                      placeholder="Pilih kode proses Ditlantas"
                      searchPlaceholder="Cari proses Ditlantas..."
                      emptyText="Proses Ditlantas tidak ditemukan."
                      className="h-11 rounded-xl border-slate-200"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Tanggal Tagihan</Label>
                <Controller
                  name="billDate"
                  control={form.control}
                  render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick a date" className="h-11 rounded-xl border-slate-200" />}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">Tanggal Bayar</Label>
                <Controller
                  name="paidDate"
                  control={form.control}
                  render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} placeholder="Pick a date" className="h-11 rounded-xl border-slate-200" />}
                />
              </div>

              <div className="flex items-end justify-end">
                <Button type="submit" disabled={updateMutation.isPending} className="h-11 rounded-xl bg-[#1f4163] px-6 hover:bg-[#183552]">
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
