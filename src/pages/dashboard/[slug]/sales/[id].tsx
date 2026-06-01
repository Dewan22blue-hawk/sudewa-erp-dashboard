import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Wallet } from 'lucide-react';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCurrentBilling, useBillingHistory } from '@/hooks/useUnitBilling';
import { mapSalesDetailCard } from '@/services/sales.mapper';

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { data, isLoading } = useSalesDetail(salesId);

  const { slug } = router.query;
  const basePath = slug ? `/dashboard/${slug}/sales` : '/sales';
  const salesData = data?.ui ?? null;
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(String(salesId ?? ''));
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, String(salesId ?? ''));
  const stockState = String(data?.raw?.stock_state ?? salesData?.stockState ?? '').toLowerCase();
  const isRefunded = stockState === 'outbound_return';
  
  const totalTagihan = salesData?.totalJual ?? 0;
  const totalPaid = salesData?.totalBayar ?? 0;
  const isPaidFromBilling = data?.raw?.billing_summary?.is_paid || data?.raw?.unit_transaction_billing?.is_paid;
  const isPaid = Boolean(isPaidFromBilling) || (totalPaid >= totalTagihan && totalTagihan > 0);
  const resolvedBillingHistories =
    billingHistories.length > 0
      ? billingHistories
      : (data?.raw?.unit_transaction_billing?.unit_transaction_billing_histories ?? []).map((history) => ({
          id: String(history.id ?? ''),
          unit_transaction_billing_id: String(history.unit_transaction_billing_id ?? data?.raw?.unit_transaction_billing?.id ?? ''),
          unit_transaction_id: String(salesId ?? ''),
          bca_payment_amount: Number(history.bca_payment_amount ?? 0),
          cash_payment_amount: Number(history.cash_payment_amount ?? 0),
          bca_payment_usd_amount: Number(history.bca_payment_usd_amount ?? 0),
          payment_at: String(history.payment_at ?? ''),
          note: history.note,
          created_at: history.created_at,
          updated_at: history.updated_at,
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-1 h-8 w-8" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Data Penjualan</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Kode Jual</span>
                <span className="font-medium text-blue-600">{salesData.kodeJual}</span>
                {isPaid ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Lunas
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                    Belum Lunas
                  </Badge>
                )}
                {isRefunded ? (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                    Sudah Refund
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-3 ml-12 md:ml-0">
            <Button disabled={isRefunded} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={handlePayment}>
              <Wallet className="mr-2 h-4 w-4" />
              Bayar
            </Button>
            <Button variant="outline" disabled={isRefunded} className="bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => router.push(`${basePath}/${id}/refund`)}>
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
        <SalesDetailCards data={salesData} />

        {/* Detail Unit Table */}
        <SalesUnitTable lineItems={salesData.lineItems} salesId={salesData.id} onAddUnit={handleCreateUnit} />

        {/* PAYMENT HISTORY TABLE */}
        {resolvedBillingHistories.length > 0 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">History Pembayaran</h2>
              <p className="text-xs text-muted-foreground">Rincian lengkap unit yang terjual</p>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tanggal</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Bukti Pembayaran</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran Cash BCA</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran USD BCA</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Nominal Pembayaran Cash</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedBillingHistories.map((history, index) => {
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
                      <tr key={history.id ?? index} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{paymentDate}</td>
                        <td className="px-4 py-3 text-slate-900">
                          {history.note ? (
                            <a href="#" className="text-blue-600 hover:underline text-xs font-medium">
                              Lihat
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">
                          {bcaPayment > 0 ? `Rp ${bcaPayment.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">
                          {usdPayment > 0 ? `$ ${usdPayment.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900 font-medium">
                          {cashPayment > 0 ? `Rp ${cashPayment.toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
