import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, ChevronRight, CreditCard, Wallet, AlertTriangle } from 'lucide-react';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCurrentBilling, useBillingHistory, useUpdateBillingIsPaid } from '@/hooks/useUnitBilling';
import { useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useDispatchStockLifecycle } from '@/hooks/useUnitTransactionItemSales';
import { mapSalesDetailCard, mapSalesDetailToUI } from '@/services/sales.mapper';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { currenciesFormat } from '@/components/ui/currenciesFormat';

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
  const rawData = data?.raw ?? null;

  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(String(salesId ?? ''));
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, String(salesId ?? ''));
  const stockState = String(rawData?.stock_state ?? '').toLowerCase();
  const isRefunded = stockState === 'outbound_return';

  console.log(data?.raw);

  const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = useState(false);
  const updateBillingIsPaid = useUpdateBillingIsPaid();
  const updateState = useUpdateUnitTransactionState();
  const dispatchMutation = useDispatchStockLifecycle();

  const SALES_PREPARE_STOCK_STATE = 'outbound_in_transit';
  const SALES_DELIVERED_STOCK_STATE = 'outbound_delivered';
  const SALES_DELIVERED_STATE_SET = new Set(['outbound_delivered', 'delivered']);

  const isAlreadyDelivered = SALES_DELIVERED_STATE_SET.has(stockState);

  const billingSummary = rawData?.billing_summary;
  const totalTagihan = Number(billingSummary?.grand_total ?? rawData?.unit_transaction_bruto_total ?? 0);
  const totalPaid = Number(billingSummary?.total_paid ?? 0);
  const isPaidFromBilling = billingSummary?.is_paid ?? rawData?.unit_transaction_billing?.is_paid;
  const isPaid = billingSummary?.is_paid ?? (Boolean(isPaidFromBilling) || (totalPaid >= totalTagihan && totalTagihan > 0));
  const canDeliver = isPaid && !isAlreadyDelivered && !isRefunded;
  const resolvedBillingHistories =
    billingHistories.length > 0
      ? billingHistories
      : (rawData?.unit_transaction_billing?.unit_transaction_billing_histories ?? []).map((history) => ({
        id: String((history as any).id ?? ''),
        unit_transaction_billing_id: String((history as any).unit_transaction_billing_id ?? rawData?.unit_transaction_billing?.id ?? ''),
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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Tanggal',
        alignment: 'left',
        cell: (item) =>
          item.payment_at
            ? new Date(item.payment_at).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            : '-',
      },
      {
        header: 'Bukti Pembayaran',
        alignment: 'left',
        cell: (item) =>
          item.payment_proof ? (
            <a
              href={item.payment_proof}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline text-xs font-medium"
            >
              Lihat Bukti
            </a>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
      {
        header: 'Nominal Pembayaran BCA USD',
        alignment: 'right',
        cell: (item) => currenciesFormat('usd', Number(item.bca_payment_usd_amount ?? 0))
      },
      {
        header: 'Nominal Pembayaran BCA IDR',
        alignment: 'right',
        cell: (item) => currenciesFormat('idr', Number(item.bca_payment_amount ?? 0))
      },
      {
        header: 'Nominal Pembayaran CASH IDR',
        alignment: 'right',
        cell: (item) => currenciesFormat('idr', Number(item.cash_payment_amount ?? 0))
      },
    ],
    []
  );

  const mappedDetail = rawData
    ? {
      code: rawData.code ?? '-',
      customerName: rawData.person?.name ?? '-',
      warehouse: rawData.warehouse?.name ?? '-',
      total: Number(rawData.unit_transaction_bruto_total ?? 0),
      dpp: Number(rawData.unit_transaction_item_total_dpp ?? 0),
      ppn: Number(rawData.unit_transaction_item_total_ppn ?? 0),
    }
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

  const handleMarkAsPaid = async () => {
    const targetBillingId = String(currentBilling?.id || data?.unit_transaction_billing?.id || '');
    if (!targetBillingId) {
      toast.error('Data billing tidak ditemukan pada transaksi ini.');
      return;
    }

    try {
      await updateBillingIsPaid.mutateAsync({ billingId: targetBillingId, isPaid: 'true' });
      toast.success('Transaksi berhasil ditandai sebagai Lunas.');
      setIsMarkAsPaidDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menandai transaksi sebagai Lunas.');
    }
  };

  const handleDelivery = async () => {
    if (!salesId || !data) return;

    try {
      const warehouseId = String(data.warehouse?.id ?? data.warehouse_id ?? '').trim();
      const personId = String(data.person?.id ?? data.person_id ?? '').trim();

      if (!warehouseId) {
        toast.error('warehouse_id belum tersedia pada transaksi ini.');
        return;
      }
      if (!personId) {
        toast.error('person_id belum tersedia pada transaksi ini.');
        return;
      }

      const items = data.unit_transaction_items ?? [];
      if (items.length === 0) {
        toast.error('Item transaksi belum tersedia. Tidak dapat melakukan Kirim Barang.');
        return;
      }

      // Check if all items are fully assigned
      const incompleteItems: string[] = [];
      items.forEach((item: any) => {
        const qty = Number(item.qty_total ?? 0);
        const assignedCount = (item.unit_transaction_item_sales ?? []).length;
        if (qty !== assignedCount) {
          const typeName = item.unit_type?.name || `Tipe #${item.unit_type_id}`;
          incompleteItems.push(`${typeName} (Qty: ${qty}, Assigned: ${assignedCount})`);
        }
      });

      if (incompleteItems.length > 0) {
        toast.error(
          `Belum semua unit dialokasikan:\n- ${incompleteItems.join('\n- ')}\n\nSilakan klik tombol Action > Detail pada tabel di bawah untuk memilih stock unit yang ingin dialokasikan.`,
          { duration: 8000 }
        );
        return;
      }

      const detailIds = items
        .flatMap((item: any) => item.unit_transaction_item_sales ?? [])
        .map((row: any) => Number(row.unit_transaction_item_detail_id))
        .filter((val: number) => Number.isFinite(val) && val > 0);

      if (detailIds.length === 0) {
        toast.error('Belum ada unit terpilih untuk dikirim.');
        return;
      }

      let stockStateForWarehouse = stockState;
      if (stockStateForWarehouse !== SALES_PREPARE_STOCK_STATE) {
        await updateState.mutateAsync({
          id: salesId,
          stockState: SALES_PREPARE_STOCK_STATE,
          unitTransactionDetails: detailIds,
        });
        stockStateForWarehouse = SALES_PREPARE_STOCK_STATE;
      }

      await dispatchMutation.mutateAsync({
        transactionId: String(salesId),
        personId,
        warehouseId,
        unitTransactionDetails: detailIds,
      });

      await updateState.mutateAsync({
        id: salesId,
        stockState: SALES_DELIVERED_STOCK_STATE,
      });

      toast.success('Status penjualan diperbarui ke delivered dan stok berhasil dikirim.');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal mengirim barang.');
    }
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
            <Button onClick={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`)} variant="ghost" size="icon" className="h-10 w-10 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
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
                {isAlreadyDelivered ? (
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold">
                    Stok Terkirim
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={isRefunded} className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={handlePayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              {isPaid ? 'Sudah Dibayar' : 'Bayar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(isPaid)}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setIsMarkAsPaidDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {isPaid ? 'Sudah Lunas' : 'Tandai Lunas'}
            </Button>
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 border-gray-200"
              disabled={!canDeliver || updateState.isPending}
              onClick={handleDelivery}
            >
              {isAlreadyDelivered ? 'Sudah Terkirim' : updateState.isPending ? 'Memproses...' : 'Kirim Barang'}
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
        <SalesUnitTable lineItems={salesData.lineItems} salesId={salesData.id} onAddUnit={handleCreateUnit} canEdit={canEdit} canDelete={canDelete} canCreate={canCreate} />

        {/* PAYMENT HISTORY TABLE */}
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">History Pembayaran</h2>
            <p className="text-xs text-muted-foreground">Rincian lengkap unit yang terjual</p>
          </div>

          <BaseTable
            data={resolvedBillingHistories}
            columns={columns}
            loading={isLoading || billingLoading || historyLoading}
          />
        </div>
      </div>

      {/* CONFIRMATION DIALOG TANDAI LUNAS */}
      <Dialog open={isMarkAsPaidDialogOpen} onOpenChange={setIsMarkAsPaidDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Tandai Lunas</DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menandai transaksi ini sebagai <strong>Lunas</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMarkAsPaidDialogOpen(false)}
              disabled={updateBillingIsPaid.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleMarkAsPaid}
              disabled={updateBillingIsPaid.isPending}
            >
              {updateBillingIsPaid.isPending ? 'Memproses...' : 'Ya, Tandai Lunas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
