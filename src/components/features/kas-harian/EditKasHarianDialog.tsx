import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { kasHarianSchema, type KasHarianFormValues } from '@/scheme/kas-harian.schema';
import { useUpdateKasHarian } from '@/hooks/useKasHarian';
import { useKas } from '@/hooks/useKas';
import { fetchUserCompanies } from '@/services/company.service';
import KasHarianForm from './KasHarianForm';
import type { KasHarian } from '@/@types/kas-harian.types';

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

  const cashQuery = useKas();

  useEffect(() => {
    if (data && open) {
      form.reset({
        company_id: data.company.id,
        cash_id: data.cash.id,
        date: new Date(data.date),
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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Ubah Transaksi KAS</DialogTitle>
          <p className="text-sm text-gray-500">Perbarui detail transaksi kas harian</p>
        </DialogHeader>

        <KasHarianForm
          form={form}
          onSubmit={onSubmit}
          id="edit-kas-form"
          companies={companyQuery.data ?? []}
          cashOptions={cashQuery.data?.data ?? []}
          isLoadingCompanies={companyQuery.isLoading}
          isLoadingCash={cashQuery.isLoading}
        />

        <div className="flex flex-col gap-3 mt-4">
          <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" form="edit-kas-form" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
