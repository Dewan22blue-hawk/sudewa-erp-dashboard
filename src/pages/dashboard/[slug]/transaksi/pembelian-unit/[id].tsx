'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchaseDetailCards } from '@/components/features/purchase/PurchaseDetailCards';
import PurchaseUnitTable from '@/components/features/purchase/PurchaseUnitTable';
import { usePurchaseById, useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useUnitBillings, useCurrentBilling, useBillingHistory } from '@/hooks/useUnitBilling';
import { usePurchaseUnitItems } from '@/hooks/useUnitTransactionItem';
import { unitItemDetailService } from '@/services/unitItemDetail.service';
import { warehouseActivityService } from '@/services/warehouseActivity.service';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PURCHASE_PREPARE_STOCK_STATE = 'inbound_incoming_goods';
const PURCHASE_RECEIVED_STOCK_STATE = 'inbound_receipt';
const PURCHASE_RECEIVED_STATE_SET = new Set(['receipt', 'inbound_receipt']);

const readApiError = (error: any): string => {
  const details = error?.details ?? error?.response?.data?.errors;
  if (typeof details === 'string' && details.trim()) return details;

  if (details && typeof details === 'object') {
    const text = Object.entries(details)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value[0] : String(value)}`)
      .join(', ')
      .trim();
    if (text) return text;
  }

  return error?.response?.data?.message || error?.message || 'Unexpected server error';
};

export default function PurchaseDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { data: purchase, isLoading, isError } = usePurchaseById(id as string);
  const { data: billings = [] } = useUnitBillings(purchase?.id);
  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(String(purchase?.id ?? ''));
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, String(purchase?.id ?? ''));
  const { data: unitItemsResponse, isLoading: unitItemsLoading } = usePurchaseUnitItems(purchase?.id);
  const updateState = useUpdateUnitTransactionState();

  const totalTagihan = Number(purchase?.unit_transaction_bruto_total ?? purchase?.unit_transaction_item_bruto_total ?? 0);
  const totalPaid = billings.reduce(
    (acc: number, item: any) => acc + Number(item.bca_payment ?? 0) + Number(item.cash_payment ?? 0) + Number(item.bca_payment_2 ?? 0),
    0,
  );
  const hasPaidBilling = billings.some((item: any) => Boolean(item.is_paid));
  const isPaid = hasPaidBilling || (totalPaid >= totalTagihan && totalTagihan > 0);
  const currentStockState = String(purchase?.stock_state ?? '').toLowerCase();
  const isRefunded = currentStockState === 'inbound_return';
  const isAlreadyReceived = PURCHASE_RECEIVED_STATE_SET.has(currentStockState);
  const canReceive = isPaid && !isAlreadyReceived && !isRefunded;
  const unitItems = unitItemsResponse?.data ?? [];
  const resolvedBillingHistories =
    billingHistories.length > 0
      ? billingHistories
      : (purchase?.unit_transaction_billing?.unit_transaction_billing_histories ?? []).map((history) => ({
          id: String(history.id ?? ''),
          unit_transaction_billing_id: String(history.unit_transaction_billing_id ?? purchase?.unit_transaction_billing?.id ?? ''),
          unit_transaction_id: purchase?.id,
          payment_proof: history.payment_proof ?? null,
          bca_payment_amount: Number(history.bca_payment_amount ?? 0),
          cash_payment_amount: Number(history.cash_payment_amount ?? 0),
          bca_payment_usd_amount: Number(history.bca_payment_usd_amount ?? 0),
          payment_at: String(history.payment_at ?? ''),
          note: history.note,
          created_at: history.created_at,
          updated_at: history.updated_at,
        }));

  useEffect(() => {
    if (router.query.print === 'true' && !isLoading && purchase) {
      setTimeout(() => {
        window.print();
      }, 800);
    }
  }, [router.query.print, isLoading, purchase]);

  const handleReceipt = async () => {
    if (!purchase?.id) return;

    try {
      const warehouseId = String(purchase.warehouse?.id ?? '').trim();
      const personId = String(purchase.person?.id ?? '').trim();

      if (!warehouseId) {
        toast.error('warehouse_id belum tersedia pada transaksi ini.');
        return;
      }
      if (!personId) {
        toast.error('person_id belum tersedia pada transaksi ini.');
        return;
      }
      if (unitItems.length === 0) {
        toast.error('Item transaksi belum tersedia. Tidak dapat melakukan Terima Barang.');
        return;
      }

      const detailRows = await Promise.all(
        unitItems.map((item) => unitItemDetailService.getDetails(String(item.id), { page: 1, perPage: 200 })),
      );

      const qtyTotal = unitItems.reduce((acc, item) => acc + Number(item.qty_total ?? 0), 0);
      const detailTotal = detailRows.reduce((acc, row) => acc + row.data.length, 0);
      if (qtyTotal !== detailTotal) {
        toast.error(`Jumlah detail unit tidak sesuai qty_total. qty_total=${qtyTotal}, detail=${detailTotal}.`);
        return;
      }

      const detailIds = detailRows
        .flatMap((row) => row.data)
        .map((detail) => Number(detail.id ?? 0))
        .filter((value) => Number.isFinite(value) && value > 0);

      if (detailIds.length === 0) {
        toast.error('Detail unit transaksi belum tersedia. Tidak dapat melakukan Terima Barang.');
        return;
      }

      let stockStateForWarehouse = currentStockState;
      if (stockStateForWarehouse !== PURCHASE_PREPARE_STOCK_STATE) {
        await updateState.mutateAsync({
          id: purchase.id,
          stockState: PURCHASE_PREPARE_STOCK_STATE,
          unitTransactionDetails: detailIds,
        });
        stockStateForWarehouse = PURCHASE_PREPARE_STOCK_STATE;
      }

      if (stockStateForWarehouse !== PURCHASE_PREPARE_STOCK_STATE) {
        toast.error('State transaksi harus inbound_incoming_goods sebelum membuat warehouse activity.');
        return;
      }

      const activityId = await warehouseActivityService.createReceiptActivity({
        unitTransactionId: String(purchase.id),
        warehouseId,
        personId,
        unitTransactionItemId: String(unitItems[0]?.id ?? ''),
      });

      await warehouseActivityService.receiptStock(activityId, detailIds);

      await updateState.mutateAsync({
        id: purchase.id,
        stockState: PURCHASE_RECEIVED_STOCK_STATE,
      });

      toast.success('Status pembelian diperbarui ke receipt dan stok warehouse berhasil diproses.');
    } catch (error: any) {
      const message = readApiError(error);
      console.error('[purchase.handleReceipt] failed', {
        purchaseId: purchase.id,
        stockState: currentStockState,
        error: message,
        raw: error,
      });

      toast.error(message || 'Gagal update state ke receipt', {
        action: {
          label: 'Retry',
          onClick: () => {
            void handleReceipt();
          },
        },
      });
    }
  };

  if (isLoading || unitItemsLoading || billingLoading || historyLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !purchase) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Pembelian tidak ditemukan</p>
          <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>Kembali ke List</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADLINE & ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2">
            <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-slate-900">Data Pembelian</h1>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Kode Beli:</span>
                <span className="text-blue-600 font-semibold">{purchase.code}</span>
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

          <div className="flex gap-2">
            <Button disabled={isRefunded} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchase.id}/payment`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Bayar
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50"
              disabled={!canReceive || updateState.isPending}
              onClick={handleReceipt}
            >
              {isAlreadyReceived ? 'Sudah Diterima' : updateState.isPending ? 'Memproses...' : 'Terima Barang'}
            </Button>
          </div>
        </div>

        {!canReceive && (
          <p className="text-xs text-muted-foreground">
            {isRefunded
              ? 'Transaksi sudah direfund (inbound_return). Proses terima barang dinonaktifkan.'
              : isAlreadyReceived
                ? 'Stok sudah diterima (inbound_receipt).'
                : 'Tombol Terima Barang aktif setelah pembayaran lunas.'}
          </p>
        )}

        {isRefunded ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Transaksi ini sudah direfund. Status stok saat ini: <span className="font-semibold">inbound_return</span>.
          </div>
        ) : null}

        {/* 3-COLUMN CARDS */}
        <PurchaseDetailCards data={purchase} />

        {/* UNIT TABLE */}
        <PurchaseUnitTable purchaseId={purchase.id} slug={slug as string} />

        {/* PAYMENT HISTORY TABLE */}
        {resolvedBillingHistories.length > 0 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">History Pembayaran</h2>
              <p className="text-xs text-muted-foreground">Rincian lengkap unit yang dibeli</p>
            </div>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-green-100 border-b border-slate-200">
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
                          {history.payment_proof ? (
                            <a href={history.payment_proof} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">
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
