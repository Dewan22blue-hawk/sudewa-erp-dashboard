'use client';

import Head from 'next/head';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PurchaseRefundForm, type PurchaseRefundFormValues } from '@/components/features/purchase/PurchaseRefundForm';
import { usePurchaseById, useSubmitTransactionAdjustment } from '@/hooks/useUnitTransaction';
import { useBillingHistory, useCurrentBilling } from '@/hooks/useUnitBilling';
import { useKas } from '@/hooks/useKas';
import { formatCurrency } from '@/lib/utils/currency';
import { useTypeUnits } from '@/hooks/useTypeUnit';

// ─── Error helpers ────────────────────────────────────────────────────────────

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

  const rawMessage: string = error?.response?.data?.message || error?.message || '';

  // Friendly-fy known backend messages
  if (/already.*adjusted|already.*refunded/i.test(rawMessage)) {
    return 'Transaksi ini sudah pernah direfund sebelumnya. Tidak bisa direfund dua kali.';
  }

  return rawMessage || 'Gagal memproses refund';
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PurchaseRefundPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const slugValue = Array.isArray(slug) ? slug[0] ?? '' : String(slug ?? '');
  const purchaseId = Array.isArray(id) ? id[0] ?? '' : String(id ?? '');

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const { data: purchase, isLoading: purchaseLoading } = usePurchaseById(purchaseId);
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(purchaseId);
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, purchaseId);
  const { data: cashResponse, isLoading: cashLoading } = useKas();
  const { data: typeUnitsRes } = useTypeUnits();
  const typeUnits = typeUnitsRes?.data ?? [];

  // Extracted item details from parent endpoint exactly as instructed
  const unitItemDetails = useMemo(() => {
    if (!purchase?.unit_transaction_items) return [];
    
    return purchase.unit_transaction_items.flatMap((item: any) => {
      const details = Array.isArray(item.unit_transaction_item_details) ? item.unit_transaction_item_details : typeof item.unit_transaction_item_details === 'object' && item.unit_transaction_item_details !== null ? Object.values(item.unit_transaction_item_details) : [];
      
      const foundType = typeUnits.find((t: any) => String(t.id) === String(item.unit_type_id));
      const typeName = foundType?.name ?? item.unit_type?.name ?? '-';

      return details.map((detail: any) => {
        return {
          id: String(detail.id ?? ''),
          unit_transaction_item_id: String(detail.unit_transaction_item_id ?? item.id ?? ''),
          unit_type_name: typeName,  
          price: item.price !== undefined ? Number(item.price) : undefined,
          color: detail.color ?? '-',
          machine_number: detail.machine_number ?? '-',
          chassis_number: detail.chassis_number ?? '-',
          in_stock: detail.in_stock === true || detail.in_stock === 1 || detail.in_stock === '1',
          status: String(detail.status ?? ''),
          created_at: detail.created_at,
        };
      });
    });
  }, [purchase, typeUnits]);

  const unitItemDetailsLoading = purchaseLoading;
  
  const adjustmentHistory = purchase?.unit_transaction_adjustments ?? [];
  const adjustmentLoading = purchaseLoading;

  const submitAdjustment = useSubmitTransactionAdjustment();

  // ── Derived ─────────────────────────────────────────────────────────────────
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
  const isAlreadyAdjusted = !adjustmentLoading && adjustmentHistory.length > 0;

  const refundedItems = useMemo(() => {
    return unitItemDetails.filter((d) => d.status?.toLowerCase() === 'refunded' || d.status?.toLowerCase() === 'returned');
  }, [unitItemDetails]);

  const refundedUnitSummary = useMemo(() => {
    if (refundedItems.length === 0) return '-';
    return Array.from(new Set(refundedItems.map((d) => d.unit_type_name ?? 'Unit'))).join(', ');
  }, [refundedItems]);

  const refundedQty = refundedItems.length;

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async (values: PurchaseRefundFormValues) => {
    if (!purchase?.id) return;

    if (values.selectedDetailIds.length === 0) {
      toast.error('Pilih minimal 1 unit untuk direfund.');
      return;
    }

    try {
      await submitAdjustment.mutateAsync({
        id: purchase.id,
        payload: {
          cashId: values.cashId,
          amount: values.nominalRefund,
          description: values.description,
          itemDetailIds: values.selectedDetailIds.map(String),
        },
      });

      toast.success('Refund pembelian berhasil diproses');
      router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  const isPageLoading = purchaseLoading || billingLoading || historyLoading || cashLoading;

  if (isPageLoading) {
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Head>
        <title>Refund Pembelian - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-4 md:p-6">
        {/* ── Page Header ── */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-8 w-8 shrink-0"
            onClick={() => router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="space-y-0.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Refund Pembelian</h1>
            <p className="text-sm text-slate-500">
              Kode Beli <span className="font-medium text-blue-500">{purchase.code}</span>
            </p>
          </div>
        </div>

        {/* ── Status banners ── */}
        {isAlreadyRefunded && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ Transaksi ini sudah berstatus <strong>inbound_return</strong> (sudah pernah direfund). Anda dapat meretur sisa unit yang ada jika diperlukan.
          </div>
        )}

        {!isAlreadyRefunded && !isFullyPaid && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Transaksi belum lunas. Total dibayar {formatCurrency(totalPaid)} dari total {formatCurrency(totalTagihan)}.
            Refund hanya bisa dilakukan setelah transaksi lunas.
          </div>
        )}

        {/* ── Refund Form ── */}
        <PurchaseRefundForm
          purchase={purchase}
          totalPaid={Math.min(totalPaid, totalTagihan || totalPaid)}
          unitItemDetails={unitItemDetails}
          unitItemDetailsLoading={unitItemDetailsLoading}
          cashOptions={cashOptions}
          submitting={submitAdjustment.isPending}
          disabled={!isFullyPaid}
          onCancel={() => router.push(`/dashboard/${slugValue}/transaksi/pembelian-unit/${purchase.id}`)}
          onSubmit={handleSubmit}
        />

        {/* ── History Refund ── */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">History Refund</h2>
            <p className="text-sm text-slate-400">Rincian lengkap unit yang direfund</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0f5f0] hover:bg-[#f0f5f0]">
                  <TableHead className="py-3 pl-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Tanggal
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Tipe Unit
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    QTY
                  </TableHead>
                  <TableHead className="py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Nominal Refund
                  </TableHead>
                  <TableHead className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Keterangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustmentLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Memuat history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : adjustmentHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-400">
                      Belum ada riwayat refund
                    </TableCell>
                  </TableRow>
                ) : (
                  adjustmentHistory.map((adj) => (
                    <TableRow key={adj.id} className="hover:bg-slate-50">
                      <TableCell className="py-3 pl-4 text-sm text-slate-700">
                        {formatDate(adj.created_at ?? adj.date)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-700">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{refundedUnitSummary}</span>
                          {refundedItems.length > 0 && (
                            <div className="flex flex-col text-xs text-slate-500 mt-1">
                              {refundedItems.map((item, idx) => (
                                <span key={idx}>
                                  - {item.color} ({item.machine_number})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-sm text-slate-700">
                        {refundedQty > 0 ? `${refundedQty} Unit` : '-'}
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-slate-800">
                        {formatCurrency(adj.amount)}
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-sm text-slate-600">{adj.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}