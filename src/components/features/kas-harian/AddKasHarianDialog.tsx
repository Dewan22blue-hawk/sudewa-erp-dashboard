import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies } from '@/services/company.service';
import { useKas } from '@/hooks/useKas';
import { useCreateKasHarian } from '@/hooks/useKasHarian';
import { kasHarianSchema, type KasHarianFormValues } from '@/scheme/kas-harian.schema';
import KasHarianForm from './KasHarianForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddKasHarianDialog({ open, onOpenChange }: Props) {
  const { companyId } = useCompany();
  const selectedCompanyId = Number(companyId || 0);
  const { mutateAsync: createKasHarian, isPending } = useCreateKasHarian();
  const form = useForm<KasHarianFormValues>({
    resolver: zodResolver(kasHarianSchema),
    defaultValues: {
      company_id: selectedCompanyId || 0,
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

  const cashQuery = useKas(selectedCompanyId);

  useEffect(() => {
    if (open) {
      form.reset({
        company_id: selectedCompanyId || 0,
        cash_id: 0,
        date: new Date(),
        note: '',
        debet: 0,
        credit: 0,
      });
    }
  }, [form, open, selectedCompanyId]);

  const onSubmit = async (data: KasHarianFormValues) => {
    try {
      await createKasHarian({
        company_id: data.company_id,
        cash_id: data.cash_id,
        date: format(data.date, 'yyyy-MM-dd'),
        note: data.note,
        debet: data.debet,
        credit: data.credit,
      });

      toast.success('Transaksi kas harian berhasil ditambahkan');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Gagal menambahkan transaksi kas harian';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] rounded-[28px] border-0 p-0 shadow-2xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-[24px] font-semibold text-slate-950">Tambah Transasaksi KAS</DialogTitle>
            <p className="text-lg text-slate-500">Masukkan detail transaksi baru</p>
          </DialogHeader>

          <div className="mt-7">
            <KasHarianForm
              form={form}
              onSubmit={onSubmit}
              id="add-kas-form"
              companies={companyQuery.data ?? []}
              cashOptions={cashQuery.data?.data ?? []}
              isLoadingCash={cashQuery.isLoading}
            />
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <Button type="submit" className="h-12 rounded-2xl bg-[#18385b] text-base hover:bg-[#102843]" form="add-kas-form" disabled={isPending}>
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
