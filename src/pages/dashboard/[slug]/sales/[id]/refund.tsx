'use client';

import Head from 'next/head';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { SalesRefundForm, type SalesRefundFormValues } from '@/components/features/sales/SalesRefundForm';
import { useSubmitTransactionAdjustment } from '@/hooks/useUnitTransaction';
import { useBillingHistory, useCurrentBilling } from '@/hooks/useUnitBilling';
import { useKas } from '@/hooks/useKas';
import { useSalesDetail } from '@/hooks/useSales';
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

export default function SalesRefundPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const slugValue = Array.isArray(slug) ? slug[0] ?? '' : String(slug ?? '');
  const salesId = Array.isArray(id) ? id[0] ?? '' : String(id ?? '');

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const { data: salesResponse, isLoading: salesLoading } = useSalesDetail(salesId);
  const sales = salesResponse?.raw;
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(salesId);
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, salesId);
  const { data: cashResponse, isLoading: cashLoading } = useKas();
  const { data: typeUnitsRes } = useTypeUnits();
  const typeUnits = typeUnitsRes?.data ?? [];

  // Extracted item details
  const unitItemDetails = useMemo(() => {
    if (!sales?.unit_transaction_items) return [];

    return sales.unit_transaction_items.flatMap((item: any) => {
      // In Sales, details are typically placed inside unit_type_sold_details instead of unit_transaction_item_details
      const sourceList = item.unit_type_sold_details || item.unit_transaction_item_details;
      const details = Array.isArray(sourceList) ? sourceList : typeof sourceList === 'object' && sourceList !== null ? Object.values(sourceList) : [];
      
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
  }, [sales, typeUnits]);

  const unitItemDetailsLoading = salesLoading;
  
  const adjustmentHistory = sales?.unit_transaction_adjustments ?? [];
  const adjustmentLoading = salesLoading;

  const submitAdjustment = useSubmitTransactionAdjustment();

  // ── Derived ─────────────────────────────────────────────────────────────────
  const cashOptions = useMemo(() => (cashResponse?.data ?? []).filter((item) => item.type === 'cash'), [cashResponse]);

  const totalTagihan = Number(sales?.unit_transaction_bruto_total ?? sales?.unit_transaction_item_bruto_total ?? 0);
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
  
  // For sales, refund is outbound_return (unit is being returned to our warehouse)
  const isAlreadyRefunded = String(sales?.stock_state ?? '').toLowerCase() === 'outbound_return';

  const refundedItems = useMemo(() => {
    return unitItemDetails.filter((d) => d.status?.toLowerCase() === 'refunded' || d.status?.toLowerCase() === 'returned');
  }, [unitItemDetails]);

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async (values: SalesRefundFormValues) => {
    if (!sales?.id) return;

    if (values.selectedDetailIds.length === 0) {
      toast.error('Pilih minimal 1 unit untuk direfund.');
      return;
    }

    try {
      await submitAdjustment.mutateAsync({
        id: String(sales.id),
        payload: {
          cashId: values.cashId,
          amount: values.nominalRefund,
          description: values.description,
          itemDetailIds: values.selectedDetailIds.map(String),
        },
      });

      toast.success('Refund penjualan berhasil diproses');
      router.push(`/dashboard/${slugValue}/sales/${sales.id}`);
    } catch (error: any) {
      toast.error(parseApiError(error));
    }
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  const isPageLoading = salesLoading || billingLoading || historyLoading || cashLoading;

  if (isPageLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sales) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Penjualan tidak ditemukan</p>
          <Button onClick={() => router.push(`/dashboard/${slugValue}/sales`)}>Kembali ke List</Button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Head>
        <title>Refund Penjualan - Wajira Dashboard</title>
      </Head>

      <div className="space-y-6 p-4 md:p-6">
        {/* ── Page Header ── */}
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 h-8 w-8 shrink-0"
            onClick={() => router.push(`/dashboard/${slugValue}/sales/${sales.id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="space-y-0.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Refund Penjualan</h1>
            <p className="text-sm text-slate-500">
              Kode Jual <span className="font-medium text-blue-500">{sales.code}</span>
            </p>
          </div>
        </div>

        {/* ── Status banners ── */}
        {isAlreadyRefunded && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ Transaksi ini sudah berstatus <strong>outbound_return</strong> (sudah pernah direfund). Anda dapat meretur sisa unit yang ada jika diperlukan.
          </div>
        )}

        {!isAlreadyRefunded && !isFullyPaid && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Transaksi belum lunas. Total dibayar {formatCurrency(totalPaid)} dari total {formatCurrency(totalTagihan)}.
            Refund hanya bisa dilakukan setelah transaksi lunas.
          </div>
        )}

        {/* ── Refund Form ── */}
        <SalesRefundForm
          sales={sales as any}
          totalPaid={Math.min(totalPaid, totalTagihan || totalPaid)}
          unitItemDetails={unitItemDetails as any}
          unitItemDetailsLoading={unitItemDetailsLoading}
          cashOptions={cashOptions}
          submitting={submitAdjustment.isPending}
          disabled={!isFullyPaid}
          onCancel={() => router.push(`/dashboard/${slugValue}/sales/${sales.id}`)}
          onSubmit={handleSubmit}
        />

        {/* ── History Refund ── */}
        <div className="pt-2">
          <h3 className="mb-1 text-lg font-semibold text-slate-900">History Refund</h3>
          <p className="mb-4 text-sm text-slate-500">Rincian lengkap unit yang direfund</p>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-[#f4fbf7] text-xs font-semibold uppercase tracking-wider text-slate-800">
                <tr>
                  <th className="px-5 py-4 font-medium">Tanggal</th>
                  <th className="px-5 py-4 font-medium">Tipe Unit</th>
                  <th className="px-5 py-4 font-medium">Qty</th>
                  <th className="px-5 py-4 font-medium">Nominal Refund</th>
                  <th className="px-5 py-4 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adjustmentLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Memuat histori...
                    </td>
                  </tr>
                ) : adjustmentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada history refund.
                    </td>
                  </tr>
                ) : (
                  adjustmentHistory.map((adj: any) => (
                    <tr key={adj.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">{formatDate(adj.created_at ?? adj.date)}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{adj.unit_type_name || refundedItems.map(x => x.unit_type_name).find(x => x) || '-'}</td>
                      <td className="px-5 py-4">{adj.qty || refundedItems.length || 0}</td>
                      <td className="px-5 py-4 font-semibold text-amber-600">{formatCurrency(adj.amount)}</td>
                      <td className="px-5 py-4">{adj.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
