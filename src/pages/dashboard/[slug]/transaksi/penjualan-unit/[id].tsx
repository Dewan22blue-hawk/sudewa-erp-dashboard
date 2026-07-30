import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, ChevronRight, CreditCard, Wallet, AlertTriangle, Info } from 'lucide-react';
import { SalesDetailCards } from '@/components/features/sales/detail/SalesDetailCards';
import { SalesUnitTable } from '@/components/features/sales/detail/SalesUnitTable';
import { toast } from 'sonner';
import { useSalesDetail } from '@/hooks/useSales';
import { useCurrentBilling, useBillingHistory, useUpdateBillingIsPaid, useUnitBillings } from '@/hooks/useUnitBilling';
import { useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { mapSalesDetailCard, mapSalesDetailToUI } from '@/services/sales.mapper';
import { warehouseActivityService } from '@/services/warehouseActivity.service';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { useQueryClient } from '@tanstack/react-query';
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
import { formatDate } from '@/lib/utils/format';
import { LoadingState } from '@/components/ui/loading-state';

/**
 * Detail Data Penjualan Unit - Image 4
 */
export default function SalesDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const salesId = Array.isArray(id) ? id[0] : id;
  const { slug } = router.query;
  const { data, isLoading } = useSalesDetail(salesId);

  useEffect(() => {
    if (!isLoading && data && data.raw?.type !== 'sales') {
      router.push(`/dashboard/${slug}/transaksi/penjualan-unit`);
    }
  }, [data, isLoading, router, slug]);

  const { hasPermission } = usePermissionGuard();
  const canCreate = hasPermission('transaction:create');
  const canEdit = hasPermission('transaction:edit');
  const canDelete = hasPermission('transaction:delete');

  const basePath = slug ? `/dashboard/${slug}/transaksi/penjualan-unit` : '/transaksi/penjualan-unit';
  const salesData = data?.ui ?? null;
  const rawData = data?.raw ?? null;

  const { data: billings = [] } = useUnitBillings(data?.raw?.id);

  const { data: currentBilling, isLoading: billingLoading } = useCurrentBilling(String(salesId ?? ''));
  const billingId = String(currentBilling?.id ?? '');
  const { data: billingHistories = [], isLoading: historyLoading } = useBillingHistory(billingId || undefined, String(salesId ?? ''));
  const stockState = String(rawData?.stock_state ?? '').toLowerCase();
  const isRefunded = stockState === 'outbound_return';

  const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const updateBillingIsPaid = useUpdateBillingIsPaid();
  const updateState = useUpdateUnitTransactionState();

  const SALES_PREPARE_STOCK_STATE = 'outbound_in_transit';
  const SALES_DELIVERED_STOCK_STATE = 'outbound_delivered';
  const SALES_DELIVERED_STATE_SET = new Set(['outbound_delivered', 'delivered']);

  const isAlreadyDelivered = SALES_DELIVERED_STATE_SET.has(stockState);

  const billingSummary = rawData?.billing_summary;
  const totalTagihan = Number(billingSummary?.grand_total ?? rawData?.unit_transaction_bruto_total ?? 0);
  const totalPaid = Number(billingSummary?.total_paid ?? 0);

  const hasPaidBilling = billings.some((item: any) => Boolean(item.is_paid));
  const isPaid = billingSummary?.is_paid ?? (hasPaidBilling || (totalPaid >= totalTagihan && totalTagihan > 0));

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
            ? formatDate(item?.payment_at)
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
    const targetBillingId = String(currentBilling?.id || rawData?.unit_transaction_billing?.id || '');
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
      const warehouseId = String(rawData?.warehouse?.id ?? (rawData as any)?.warehouse_id ?? '').trim();
      const personId = String(rawData?.person?.id ?? (rawData as any)?.person_id ?? '').trim();

      if (!warehouseId) {
        toast.error('warehouse_id belum tersedia pada transaksi ini.');
        setIsDeliveryDialogOpen(false);
        return;
      }
      if (!personId) {
        toast.error('person_id belum tersedia pada transaksi ini.');
        setIsDeliveryDialogOpen(false);
        return;
      }

      const items = rawData?.unit_transaction_items ?? [];
      if (items.length === 0) {
        toast.error('Item transaksi belum tersedia. Tidak dapat melakukan Proses Unit.');
        setIsDeliveryDialogOpen(false);
        return;
      }

      // Check if all items are fully assigned
      const incompleteItems: string[] = [];
      items.forEach((item: any) => {
        const qty = Number(item.qty_total ?? 0);
        const assignedCount = (item.unit_type_sold_details ?? []).length;
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
        setIsDeliveryDialogOpen(false);
        return;
      }

      const detailIds = items
        .flatMap((item: any) => item.unit_type_sold_details ?? [])
        .map((row: any) => Number(row.id ?? row.unit_transaction_item_detail_id))
        .filter((val: number) => Number.isFinite(val) && val > 0);

      if (detailIds.length === 0) {
        toast.error('Belum ada unit terpilih untuk dikirim.');
        setIsDeliveryDialogOpen(false);
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

      if (stockStateForWarehouse !== SALES_PREPARE_STOCK_STATE) {
        toast.error('State transaksi harus outbound_in_transit sebelum membuat warehouse activity.');
        setIsDeliveryDialogOpen(false);
        return;
      }

      const description = String(`Pengiriman Stok Transaksi beli ${data?.raw?.code} Sebanyak ${detailIds?.length} Unit`);

      const activityId = await warehouseActivityService.createIssueActivity({
        unitTransactionId: String(salesId),
        warehouseId,
        personId,
        description,
        unitTransactionItemId: String(items[0]?.id ?? ''),
      });

      await warehouseActivityService.dispatchStock(activityId, detailIds);

      await updateState.mutateAsync({
        id: salesId,
        stockState: SALES_DELIVERED_STOCK_STATE,
      });

      await queryClient.invalidateQueries({ queryKey: ['sales-transaction', salesId] });
      await queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase-unit-items', salesId] });
      await queryClient.invalidateQueries({ queryKey: ['stock-units'] });

      toast.success('Status penjualan diperbarui ke delivered dan stok berhasil dikirim.');
      setIsDeliveryDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal mengirim barang.');
      setIsDeliveryDialogOpen(false);
    }
  };

  if (isLoading || billingLoading || historyLoading || !salesData) {
    return (
      <DashboardLayout>
        <LoadingState variant="page" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: 'Penjualan Unit', onClick: () => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`) },
            { label: 'Detail Penjualan' }
          ]}
          title="Data Penjualan"
          onBack={() => router.push(`/dashboard/${slug}/transaksi/penjualan-unit`)}
          subtitle={
            <>
              <span>Kode Jual: </span>
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
            </>
          }
          actions={
            <>
              <Button
                disabled={isRefunded}
                className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handlePayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                {isPaid ? 'Sudah Dibayar' : 'Bayar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPaid || !rawData?.unit_transaction_billing}
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
                onClick={() => setIsDeliveryDialogOpen(true)}
              >
                {isAlreadyDelivered ? 'Sudah Terkirim' : updateState.isPending ? 'Memproses...' : 'Proses Unit'}
              </Button>
            </>
          }
        />

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
        <SalesUnitTable lineItems={salesData.lineItems} salesId={salesData.id} onAddUnit={handleCreateUnit} canEdit={canEdit} canDelete={canDelete} canCreate={canCreate} isPaid={isPaid} />

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
            <div className="border border-slate-200 bg-slate-50 text-slate-700 text-sm rounded-md p-2 text-justify">
              <div className="flex gap-2">
                <span>
                  <Info />
                </span>
                <span>
                  Proses ini akan menambah data baru pada <b>Administrasi Arus Transaksi</b> dan <b>Finance Transaksi Kas Harian</b>, dan data <b>Administrasi</b> yang sudah dibilling tidak bisa dirubah data didalamnya.
                </span>
              </div>
            </div>
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

      {/* CONFIRMATION DIALOG Proses Unit */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Proses Unit</DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin mengirim barang ini?
            </DialogDescription>
            <div className="border border-slate-200 bg-slate-50 text-slate-700 text-sm rounded-md p-2 text-justify">
              <div className="flex gap-2">
                <span>
                  <Info />
                </span>
                <span>
                  Dengan klik Proses Unit maka akan masuk ke dalam aktifitas gudang untuk selanjutnya barang akan diproses digudang.
                </span>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeliveryDialogOpen(false)}
              disabled={updateState.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleDelivery}
              disabled={updateState.isPending}
            >
              {updateState.isPending ? 'Memproses...' : 'Ya, Proses Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
