import { useEffect } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchUserCompanies } from '@/services/company.service';
import { useAccounts } from '@/hooks/useAccount';
import { useKas } from '@/hooks/useKas';
import { useCreateKasHarian } from '@/hooks/useKasHarian';
import { kasHarianSchema, type KasHarianFormInput, type KasHarianFormValues } from '@/scheme/kas-harian.schema';
import KasHarianForm from './KasHarianForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddKasHarianDialog({ open, onOpenChange }: Props) {
  const { companyId } = useCompany();
  const selectedCompanyId = Number(companyId || 0);
  const { mutateAsync: createKasHarian, isPending } = useCreateKasHarian();
  const form = useForm<KasHarianFormInput, unknown, KasHarianFormValues>({
    resolver: zodResolver(kasHarianSchema) as Resolver<KasHarianFormInput, unknown, KasHarianFormValues>,
    defaultValues: {
      company_id: selectedCompanyId || 0,
      cash_id: 0,
      account_id: 0,
      date: new Date(),
      note: '',
      debet: 0,
      credit: 0,
      transaction_category: 'general',
      payment_proof: null,
    },
  });

  const companyQuery = useQuery({
    queryKey: ['companies', 'selector'],
    queryFn: fetchUserCompanies,
    staleTime: 10 * 60 * 1000,
  });

  const cashQuery = useKas(selectedCompanyId);
  const accountQuery = useAccounts({
    page: 1,
    perPage: 1000,
    search: '',
    company_id: selectedCompanyId,
    enabled: open && selectedCompanyId > 0,
  });

  useEffect(() => {
    if (open) {
      form.reset({
        company_id: selectedCompanyId || 0,
        cash_id: 0,
        account_id: 0,
        date: new Date(),
        note: '',
        debet: 0,
        credit: 0,
        transaction_category: 'general',
        payment_proof: null,
      });
    }
  }, [form, open, selectedCompanyId]);

  const onSubmit = async (data: KasHarianFormValues) => {
    try {
      await createKasHarian({
        company_id: data.company_id,
        cash_id: data.cash_id,
        account_id: data.account_id,
        date: format(data.date, 'yyyy-MM-dd'),
        note: data.note,
        debet: data.debet,
        credit: data.credit,
        transaction_category: data.transaction_category,
        payment_proof: data.payment_proof,
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
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-[520px] overflow-hidden rounded-[28px] border-0 p-0 shadow-2xl">
        <div className="flex max-h-[92vh] flex-col rounded-[28px] border border-slate-200 bg-white">
          <DialogHeader className="space-y-2 px-6 pt-6 text-left sm:px-8 sm:pt-8">
            <DialogTitle className="text-[24px] font-semibold text-slate-950">Tambah Transaksi KAS</DialogTitle>
            <p className="text-lg text-slate-500">Masukkan detail transaksi baru</p>
          </DialogHeader>

          <div className="mt-6 flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
            <KasHarianForm
              form={form}
              onSubmit={onSubmit}
              id="add-kas-form"
              companies={companyQuery.data ?? []}
              cashOptions={cashQuery.data?.data ?? []}
              accountOptions={accountQuery.data?.data ?? []}
              isLoadingCash={cashQuery.isLoading}
              isLoadingAccount={accountQuery.isLoading}
            />
          </div>

          <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4">
              <Button type="submit" className="h-12 rounded-2xl bg-[#18385b] text-base hover:bg-[#102843]" form="add-kas-form" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200 text-base" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
