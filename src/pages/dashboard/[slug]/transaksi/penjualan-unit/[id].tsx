import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, Wallet } from 'lucide-react';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCurrentBilling, useBillingHistory } from '@/hooks/useUnitBilling';
import { mapSalesDetailCard } from '@/services/sales.mapper';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { data, isLoading } = useSalesDetail(salesId);

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');
  const canEdit = hasPermission('transaction:edit');
  const canDelete = hasPermission('transaction:delete');

  const { slug } = router.query;
  const basePath = slug ? `/dashboard/${slug}/transaksi/penjualan-unit` : '/transaksi/penjualan-unit';
  const salesData = data?.ui ?? null;
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(String(salesId ?? ''));
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, String(salesId ?? ''));
  const stockState = String(data?.raw?.stock_state ?? salesData?.stockState ?? '').toLowerCase();
  const isRefunded = stockState === 'outbound_return';

  const billingSummary = data?.raw?.billing_summary;
  const totalTagihan = Number(billingSummary?.grand_total ?? salesData?.totalJual ?? 0);
  const totalPaid = Number(billingSummary?.total_paid ?? salesData?.totalBayar ?? 0);
  const isPaidFromBilling = billingSummary?.is_paid ?? data?.raw?.unit_transaction_billing?.is_paid;
  const isPaid = billingSummary?.is_paid ?? (Boolean(isPaidFromBilling) || (totalPaid >= totalTagihan && totalTagihan > 0));
  const resolvedBillingHistories =
    billingHistories.length > 0
      ? billingHistories
      : (data?.raw?.unit_transaction_billing?.unit_transaction_billing_histories ?? []).map((history) => ({
        id: String((history as any).id ?? ''),
        unit_transaction_billing_id: String((history as any).unit_transaction_billing_id ?? data?.raw?.unit_transaction_billing?.id ?? ''),
        unit_transaction_id: String(salesId ?? ''),
        payment_proof: (history as any).payment_proof ?? null,
        bca_payment_amount: Number((history as any).bca_payment_amount ?? (history as any).bca_payment ?? 0),
        cash_payment_amount: Number((history as any).cash_payment_amount ?? (history as any).cash_payment ?? 0),
        bca_payment_usd_amount: Number((history as any).bca_payment_usd_amount ?? (history as any).bca_payment_2 ?? 0),
        payment_at: String((history as any).payment_at ?? ''),
        note: (history as any).note,
        created_at: (history as any).created_at,
        updated_at: (history as any).updated_at,
        cashes: (history as any).cashes,
      }));

  const mappedDetail = data?.raw
    ? mapSalesDetailCard(data.raw)
    : {
      code: '-',
      customerName: '-',
      warehouse: '-',
      total: 0,
      dpp: 0,
      ppn: 0,
    };

  useEffect(() => {
    if (!salesId || isLoading) return;

    if (!salesData) {
      toast.error('Data penjualan tidak ditemukan');
    }
  }, [salesData, salesId, isLoading, slug]);

  useEffect(() => {
    if (router.query.print === 'true' && !isLoading && salesData) {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [router.query.print, isLoading, salesData]);

  const handleCreateUnit = () => {
    router.push(`${basePath}/${id}/create-unit`);
  };

  const handlePayment = () => {
    router.push(`${basePath}/${id}/payment`);
  };

  if (isLoading || billingLoading || historyLoading || !salesData) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-slate-500 print:hidden">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`)}>
            Penjualan Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800">Detail Penjualan</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`)}
              className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Data Penjualan</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Kode Jual:</span>
                <span className="font-semibold text-blue-600">{salesData.kodeJual}</span>
                {isPaid ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold">
                    Lunas
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 font-semibold">
                    Belum Lunas
                  </Badge>
                )}
                {isRefunded ? (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 font-semibold">
                    Sudah Refund
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={isRefunded} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={handlePayment}>
              <Wallet className="mr-2 h-4 w-4" />
              Bayar
            </Button>
            <Button variant="outline" disabled={isRefunded} className="bg-white hover:bg-gray-50 border-gray-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => router.push(`${basePath}/${id}/refund`)}>
              {isRefunded ? 'Sudah Refund' : 'Refund'}
            </Button>
          </div>
        </div>

        {/* Print Header - Visible only on Print */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold mb-2">Detail Penjualan Unit</h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Kode Jual</p>
              <p className="text-lg">{mappedDetail.code}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {isRefunded ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
            Transaksi ini sudah direfund. Status stok saat ini: <span className="font-semibold">outbound_return</span>.
          </div>
        ) : null}

        {/* 3 Info Cards */}
        <SalesDetailCards data={salesData} billingHistories={resolvedBillingHistories} />

        {/* Detail Unit Table */}
        <SalesUnitTable lineItems={salesData.lineItems} salesId={salesData.id} onAddUnit={handleCreateUnit} canEdit={canEdit} canDelete={canDelete} />

        {/* PAYMENT HISTORY TABLE */}
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">History Pembayaran</h2>
            <p className="text-xs text-muted-foreground">Rincian lengkap unit yang terjual</p>
          </div>

          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 w-12">No</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Tanggal</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Bukti Pembayaran</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran BCA USD</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran BCA IDR</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran CASH IDR</th>
                </tr>
              </thead>
              <tbody>
                {resolvedBillingHistories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <p className="font-medium text-slate-700">Belum ada riwayat pembayaran</p>
                        <p className="text-xs">Data pembayaran akan muncul di sini setelah proses bayar dilakukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  resolvedBillingHistories.map((history, index) => {
                    const paymentDate = history.payment_at
                      ? new Date(history.payment_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      : '-';

                    const bcaPayment = Number(history.bca_payment_amount ?? 0);
                    const usdPayment = Number(history.bca_payment_usd_amount ?? 0);
                    const cashPayment = Number(history.cash_payment_amount ?? 0);

                    return (
                      <tr key={history.id || index} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{index + 1}</td>
                        <td className="px-4 py-3 text-slate-900">{paymentDate}</td>
                        <td className="px-4 py-3 text-slate-900">
                          {history.payment_proof ? (
                            <a href={history.payment_proof} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">
                              Lihat Bukti
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">{usdPayment > 0 ? `$ ${usdPayment.toLocaleString('id-ID')}` : '-'}</td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">{bcaPayment > 0 ? `Rp ${bcaPayment.toLocaleString('id-ID')}` : '-'}</td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">{cashPayment > 0 ? `Rp ${cashPayment.toLocaleString('id-ID')}` : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
