'use client';
// Force HMR update

import { useRouter } from 'next/router';

import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import TransactionForm from '@/components/features/transaction/TransactionForm';
import { useCreateTransaction } from '@/hooks/useTransaction';
import { useCompany } from '@/contexts/CompanyContext';
import { ChevronRight } from 'lucide-react';

import { TransactionFormValues } from '@/scheme/transaction.schema';

export default function CreateTransactionPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();
  const safeCompanyId = companyId || '1';
  const basePath = slug ? `/dashboard/${slug}/transaksi/arus-transaksi` : '/transaksi/arus-transaksi';

  const createMutation = useCreateTransaction(safeCompanyId);

  const handleSubmit = async (data: TransactionFormValues) => {
    try {
      await createMutation.mutateAsync({
        companyId: safeCompanyId,
        date: data.date,
        name: data.name,
        description: data.description ?? data.name,
        debitUSD: data.debitUSD ?? 0,
        creditUSD: data.creditUSD ?? 0,
        debitIDR: data.debitIDR ?? 0,
        creditIDR: data.creditIDR ?? 0,
        debitCash: data.debitCash ?? 0,
        creditCash: data.creditCash ?? 0,
      });

      toast.success('Transaksi berhasil ditambahkan');
      router.push(basePath);
    } catch {
      toast.error('Gagal menambahkan transaksi');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer" onClick={() => router.push(basePath)}>
            Arus Transaksi
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Tambah Transaksi</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambahkan Transaksi</h1>
          <p className="text-muted-foreground">Masukkan detail transaksi operasional baru</p>
        </div>

        <div className="rounded-xl border bg-white p-6 md:p-8">
          <TransactionForm
            defaultValues={{
              date: new Date().toISOString().split('T')[0], // Default today
              name: '',
              debitUSD: undefined,
              creditUSD: undefined,
              debitIDR: undefined,
              creditIDR: undefined,
              debitCash: undefined,
              creditCash: undefined,
              description: '',
            }}
            onSubmit={handleSubmit}
            onCancel={() => router.push(basePath)}
            isBusy={createMutation.isPending}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
