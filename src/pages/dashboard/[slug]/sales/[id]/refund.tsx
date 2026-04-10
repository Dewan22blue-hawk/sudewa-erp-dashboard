'use client';

import Head from 'next/head';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useKas } from '@/hooks/useKas';
import { useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useSalesDetail } from '@/hooks/useSales';
import { SalesRefundForm, type SalesRefundFormValues } from '@/components/features/sales/SalesRefundForm';

const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
  return false;
};

const parseApiError = (error: any): string => {
  const details = error?.details ?? error?.response?.data?.errors;
  if (typeof details === 'string' && details.trim()) return details;

  if (details && typeof details === 'object') {
    const text = Object.entries(details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
      .join(', ')
      .trim();
    if (text) return text;
  }

  return error?.response?.data?.message || error?.message || 'Gagal memproses refund';
};

export default function SalesRefundPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const slugValue = Array.isArray(slug) ? slug[0] ?? '' : String(slug ?? '');
  const salesId = Array.isArray(id) ? id[0] ?? '' : String(id ?? '');

  const { data: salesResponse, isLoading: salesLoading } = useSalesDetail(salesId);
  const { data: cashResponse, isLoading: cashLoading } = useKas();
  const updateState = useUpdateUnitTransactionState();

  const salesData = salesResponse?.ui;
  const raw = salesResponse?.raw;

  const cashOptions = useMemo(() => (cashResponse?.data ?? []).filter((item) => item.type === 'cash'), [cashResponse]);

  const totalSales = Number(salesData?.totalJual ?? 0);
  const totalPaid = Number(salesData?.totalBayar ?? 0);
  const remainingByUi = Number(salesData?.kurangBayar ?? Math.max(0, totalSales - totalPaid));
  const remainingBySummary = Number(raw?.billing_summary?.remaining_payment ?? remainingByUi);
  const isPaidBySummary = toBool(raw?.billing_summary?.is_paid ?? raw?.unit_transaction_billing?.is_paid);
  const isFullyPaid = isPaidBySummary || remainingBySummary <= 0 || (totalSales > 0 && totalPaid >= totalSales);
  const isAlreadyRefunded = String(raw?.stock_state ?? salesData?.stockState ?? '').toLowerCase() === 'outbound_return';

  const basePath = slugValue ? `/dashboard/${slugValue}/sales` : '/sales';

  const handleSubmit = async (values: SalesRefundFormValues) => {
    if (!salesData?.id) return;

    if (isAlreadyRefunded) {
      toast.error('Transaksi ini sudah berstatus refund.');
      return;
    }

    if (!isFullyPaid) {
      toast.error('Transaction has not been paid. Refund hanya bisa dilakukan setelah transaksi lunas.');
      return;
    }

    try {
      await updateState.mutateAsync({
        id: salesData.id,
        stockState: 'outbound_return',
        cashId: values.cashId,
        description: values.description,
      });

      toast.success('Refund penjualan berhasil diproses');
      router.push(`${basePath}/${salesData.id}`);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  if (salesLoading || cashLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!salesData) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Penjualan tidak ditemukan</p>
          <Button onClick={() => router.push(basePath)}>Kembali ke List</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Refund Penjualan - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 shrink-0" onClick={() => router.push(`${basePath}/${salesData.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Refund Penjualan</h1>
            <p className="text-sm text-slate-500">
              Kode Jual <span className="font-medium text-blue-500">{salesData.kodeJual}</span>
            </p>
          </div>
        </div>

        {isAlreadyRefunded ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Transaksi ini sudah berstatus outbound_return.</div>
        ) : null}

        {!isAlreadyRefunded && !isFullyPaid ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Transaction has not been paid. Total dibayar {totalPaid.toLocaleString('id-ID')} dari total {totalSales.toLocaleString('id-ID')}.
          </div>
        ) : null}

        <SalesRefundForm
          sales={salesData}
          cashOptions={cashOptions}
          loading={updateState.isPending || !isFullyPaid}
          submitting={updateState.isPending}
          onCancel={() => router.push(`${basePath}/${salesData.id}`)}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  );
}
