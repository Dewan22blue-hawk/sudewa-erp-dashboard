import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchUserCompanies } from '@/services/company.service';
import { useKas } from '@/hooks/useKas';
import { useUpdateKasHarian } from '@/hooks/useKasHarian';
import { kasHarianSchema, type KasHarianFormValues } from '@/scheme/kas-harian.schema';
import type { KasHarian } from '@/@types/kas-harian.types';
import KasHarianForm from './KasHarianForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KasHarian | null;
}

export default function EditKasHarianDialog({ open, onOpenChange, data }: Props) {
  const { mutateAsync: updateKasHarian, isPending } = useUpdateKasHarian();
  const form = useForm<KasHarianFormValues>({
    resolver: zodResolver(kasHarianSchema),
    defaultValues: {
      company_id: 0,
      cash_id: 0,
      date: new Date(),
      note: '',
      debet: 0,
      credit: 0,
    },
  });

  const companyQuery = useQuery({
    queryKey: ['companies', 'selector'],
    queryFn: fetchUserCompanies,
    staleTime: 10 * 60 * 1000,
  });

  const cashQuery = useKas(data?.company_id);

  useEffect(() => {
    if (data && open) {
      form.reset({
        company_id: data.company_id,
        cash_id: data.cash_id,
        date: data.date ? new Date(data.date) : new Date(),
        note: data.note,
        debet: data.debet,
        credit: data.credit,
      });
    }
  }, [data, open, form]);

  const onSubmit = async (values: KasHarianFormValues) => {
    if (!data) return;

    try {
      await updateKasHarian({
        id: data.id,
        payload: {
          company_id: values.company_id,
          cash_id: values.cash_id,
          date: format(values.date, 'yyyy-MM-dd'),
          note: values.note,
          debet: values.debet,
          credit: values.credit,
        },
      });

      toast.success('Transaksi kas harian berhasil diperbarui');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Gagal memperbarui transaksi kas harian';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] rounded-[28px] border-0 p-0 shadow-2xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-[24px] font-semibold text-slate-950">Edit Transasaksi KAS</DialogTitle>
            <p className="text-lg text-slate-500">Perbarui detail transaksi kas harian</p>
          </DialogHeader>

          <div className="mt-7">
            <KasHarianForm
              form={form}
              onSubmit={onSubmit}
              id="edit-kas-form"
              companies={companyQuery.data ?? []}
              cashOptions={cashQuery.data?.data ?? []}
              isLoadingCash={cashQuery.isLoading}
            />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="h-12 rounded-2xl bg-[#18385b] text-base hover:bg-[#102843]" form="edit-kas-form" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200 text-base" onClick={() => onOpenChange(false)} disabled={isPending}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
