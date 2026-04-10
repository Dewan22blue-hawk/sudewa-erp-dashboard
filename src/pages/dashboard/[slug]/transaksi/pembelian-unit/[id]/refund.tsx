'use client';

import Head from 'next/head';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PurchaseRefundForm, type PurchaseRefundFormValues } from '@/components/features/purchase/PurchaseRefundForm';
import { usePurchaseById, useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useBillingHistory, useCurrentBilling } from '@/hooks/useUnitBilling';
import { useKas } from '@/hooks/useKas';

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

export default function PurchaseRefundPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const slugValue = Array.isArray(slug) ? slug[0] ?? '' : String(slug ?? '');
  const purchaseId = Array.isArray(id) ? id[0] ?? '' : String(id ?? '');

  const { data: purchase, isLoading: purchaseLoading } = usePurchaseById(purchaseId);
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(purchaseId);
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, purchaseId);
  const { data: cashResponse, isLoading: cashLoading } = useKas();
  const updateState = useUpdateUnitTransactionState();

  const cashOptions = useMemo(() => (cashResponse?.data ?? []).filter((item) => item.type === 'cash'), [cashResponse]);

  const totalTagihan = Number(purchase?.unit_transaction_bruto_total ?? purchase?.unit_transaction_item_bruto_total ?? 0);
  const historyPaid = useMemo(
    () =>
      (billingHistories ?? []).reduce(
        (acc, item) => acc + Number(item.bca_payment_amount ?? 0) + Number(item.cash_payment_amount ?? 0) + Number(item.bca_payment_usd_amount ?? 0),
        0,
      ),
    [billingHistories],
  );
  const totalPaidFromBilling = Number(
    currentBilling?.total_paid ??
      (Number(currentBilling?.bca_payment ?? 0) + Number(currentBilling?.cash_payment ?? 0) + Number(currentBilling?.bca_payment_2 ?? 0)),
  );
  const totalPaid = currentBilling?.is_paid ? Math.max(totalPaidFromBilling, historyPaid) : historyPaid;
  const remainingPayment = Number(currentBilling?.remaining_payment ?? Math.max(0, totalTagihan - totalPaid));
  const isFullyPaid = Boolean(currentBilling?.is_paid) || remainingPayment <= 0;
  const isAlreadyRefunded = String(purchase?.stock_state ?? '').toLowerCase() === 'inbound_return';

  const handleSubmit = async (values: PurchaseRefundFormValues) => {
    if (!purchase?.id) return;

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
        id: purchase.id,
        stockState: 'inbound_return',
        cashId: values.cashId,
        description: values.description,
      });

      toast.success('Refund pembelian berhasil diproses');
      router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  if (purchaseLoading || billingLoading || historyLoading || cashLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!purchase) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Pembelian tidak ditemukan</p>
          <Button onClick={() => router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit`)}>Kembali ke List</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Refund Pembelian - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-1 h-8 w-8 shrink-0" onClick={() => router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Refund Pembelian</h1>
            <p className="text-sm text-slate-500">
              Kode Beli <span className="font-medium text-blue-500">{purchase.code}</span>
            </p>
          </div>
        </div>

        {isAlreadyRefunded ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Transaksi ini sudah berstatus inbound_return.</div>
        ) : null}

        {!isAlreadyRefunded && !isFullyPaid ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Transaction has not been paid. Total dibayar {totalPaid.toLocaleString('id-ID')} dari total {totalTagihan.toLocaleString('id-ID')}.
          </div>
        ) : null}

        <PurchaseRefundForm
          purchase={purchase}
          totalPaid={Math.min(totalPaid, totalTagihan || totalPaid)}
          cashOptions={cashOptions}
          loading={updateState.isPending || !isFullyPaid}
          submitting={updateState.isPending}
          onCancel={() => router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`)}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  );
}