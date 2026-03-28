'use client';

import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PurchaseDetailCards } from '@/components/features/purchase/PurchaseDetailCards';
import PurchaseUnitTable from '@/components/features/purchase/PurchaseUnitTable';
import { usePurchaseById, useUpdateUnitTransactionState } from '@/hooks/useUnitTransaction';
import { useUnitBillings } from '@/hooks/useUnitBilling';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PURCHASE_RECEIPT_STATE = 'receipt';

export default function PurchaseDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;
  const { data: purchase, isLoading, isError } = usePurchaseById(id as string);
  const { data: billings = [] } = useUnitBillings(purchase?.id);
  const updateState = useUpdateUnitTransactionState();

  const totalTagihan = Number(purchase?.unit_transaction_item_bruto_total ?? 0);
  const totalPaid = billings.reduce(
    (acc, item) => acc + Number(item.bca_payment ?? 0) + Number(item.cash_payment ?? 0) + Number(item.bca_payment_2 ?? 0),
    0,
  );
  const isPaid = totalPaid >= totalTagihan && totalTagihan > 0;

  const handleReceipt = async () => {
    if (!purchase?.id) return;

    try {
      await updateState.mutateAsync({ id: purchase.id, state: PURCHASE_RECEIPT_STATE });
      toast.success('Status pembelian diperbarui ke receipt');
    } catch (error: any) {
      toast.error(error?.message || 'Gagal update state ke receipt', {
        action: {
          label: 'Retry',
          onClick: () => {
            void handleReceipt();
          },
        },
      });
    }
  };

  if (isLoading) {
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
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit/${purchase.id}/payment`)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Bayar
            </Button>
            {isPaid && purchase.stock_state !== PURCHASE_RECEIPT_STATE && (
              <Button variant="outline" className="bg-white hover:bg-gray-50" disabled={updateState.isPending} onClick={handleReceipt}>
                {updateState.isPending ? 'Memproses...' : 'Terima Barang'}
              </Button>
            )}
          </div>
        </div>

        {/* 3-COLUMN CARDS */}
        <PurchaseDetailCards data={purchase} />

        {/* UNIT TABLE */}
        <PurchaseUnitTable purchaseId={purchase.id} slug={slug as string} />
      </div>
    </DashboardLayout>
  );
}
