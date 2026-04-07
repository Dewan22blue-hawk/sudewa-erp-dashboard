import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { kasHarianSchema, type KasHarianFormValues } from '@/scheme/kas-harian.schema';
import { useCreateKasHarian } from '@/hooks/useKasHarian';
import { useKas } from '@/hooks/useKas';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies } from '@/services/company.service';
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

  const cashQuery = useKas();

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
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi KAS</DialogTitle>
          <p className="text-sm text-gray-500">Masukkan detail transaksi baru</p>
        </DialogHeader>

        <KasHarianForm
          form={form}
          onSubmit={onSubmit}
          id="add-kas-form"
          companies={companyQuery.data ?? []}
          cashOptions={cashQuery.data?.data ?? []}
          isLoadingCompanies={companyQuery.isLoading}
          isLoadingCash={cashQuery.isLoading}
        />

        <div className="flex flex-col gap-3 mt-4">
          <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" form="add-kas-form" disabled={isPending}>
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
