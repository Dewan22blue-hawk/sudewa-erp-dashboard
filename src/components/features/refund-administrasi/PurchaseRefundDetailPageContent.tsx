import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, MoreVertical, Plus, Search, ArrowLeft } from 'lucide-react';
import type { UnitTransactionRefundPayment } from '@/@types/refund.type';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BaseTable, { ColumnDef } from '@/components/ui/base-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteRefundPayment, useRefundDetail, useRefundTransactionDetail } from '@/hooks/useRefundAdministrasi';
import { toast } from 'sonner';
import PurchaseRefundPaymentDetailModal from './PurchaseRefundPaymentDetailModal';
import { refundInputClassName, refundPrimaryButtonClassName } from './purchase-refund.styles';
import { RefundPaymentProgressBadge } from '@/components/features/refund/RefundPaymentProgressBadge';
import { getRefundPaymentProgressStatus } from '@/components/features/refund/refund.utils';
import { currenciesFormat } from '@/components/ui/currenciesFormat';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PurchaseRefundDetailPageContent({ transactionId, refundId }: { transactionId: string; refundId: string }) {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [isAddDetailOpen, setIsAddDetailOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<UnitTransactionRefundPayment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<UnitTransactionRefundPayment | null>(null);
  const deletePaymentMutation = useDeleteRefundPayment();

  const transactionQuery = useRefundTransactionDetail(transactionId);
  const refundQuery = useRefundDetail(refundId);
  const refund = refundQuery.data;

  const totalPaid = (refund?.payments ?? []).reduce((total, item) => total + Number(item.amount), 0);
  const lessPayment = Math.max(0, Number(refund?.refund_amount || 0) - totalPaid);
  const qty = refund?.items?.length ?? 0;

  const columns = useMemo<ColumnDef<UnitTransactionRefundPayment>[]>(
    () => [
      {
        header: 'NO',
        alignment: 'left',
        cell: (_, index) => index + 1,
      },
      {
        header: 'TANGGAL REFUND',
        accessorKey: 'payment_date',
        sortable: true,
        alignment: 'left',
        cell: (payment) => formatDate(payment.payment_date),
      },
      {
        header: 'NOMINAL BAYAR',
        accessorKey: 'amount',
        sortable: true,
        alignment: 'left',
        cell: (payment) => currenciesFormat('idr', payment.amount),
      },
      {
        header: 'KETERANGAN',
        accessorKey: 'note',
        sortable: true,
        alignment: 'left',
        cell: (payment) => payment.note || 'Terbayar',
      },
      {
        header: 'ACTION',
        alignment: 'left',
        sticky: 'right',
        cell: (payment) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#111827]">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[162px] rounded-[14px] border border-[#E5E7EB] p-2 shadow-[0_12px_35px_rgba(15,23,42,0.14)]">
              <DropdownMenuItem className="rounded-[10px] px-4 py-3 text-sm text-[#111827]" onClick={() => setEditingPayment(payment)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-[10px] px-4 py-3 text-sm text-[#EF4444]" onClick={() => setDeletingPayment(payment)}>
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [router, slug, transactionId],
  );

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;

    try {
      await deletePaymentMutation.mutateAsync(deletingPayment.id);
      toast.success('Detail refund pembelian berhasil dihapus');
      setDeletingPayment(null);
    } catch (error: any) {
      toast.error(error?.message || 'Gagal menghapus detail refund pembelian');
    }
  };

  if (refundQuery.isLoading || transactionQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-[#6B7280]">Memuat detail refund pembelian...</div>
      </DashboardLayout>
    );
  }

  if (!refund) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-[#6B7280]">Data refund pembelian tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 p-6">
        {/* BREADCRUMB HEADER */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}>
            Pembelian Unit
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-800">Detail Refund</span>
        </div>

        {/* HEADLINE & ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/${slug}/transaksi/pembelian-unit`)}
              className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Data Refund</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Kode Beli:</span>
                <span className="text-blue-600 font-semibold">{refund.code}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">
          <RefundPaymentProgressBadge status={getRefundPaymentProgressStatus(refund)} />
          <p className="text-sm text-slate-600">Pembayaran refund hanya bisa ditambahkan setelah refund ini tersimpan.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Kode Refund</label>
            <Input readOnly value={refund.code || ''} className={refundInputClassName} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Nominal Refund</label>
            <Input readOnly value={currenciesFormat('idr', refund.refund_amount)} className={refundInputClassName} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Tanggal Refund</label>
            <Input readOnly value={formatDate(refund.refund_date)} className={refundInputClassName} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Kurang Bayar</label>
            <Input readOnly value={currenciesFormat('idr', lessPayment)} className={refundInputClassName} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">Tipe</label>
            <Input readOnly value={refund.items?.[0]?.unit_type_name || refund.note || ''} className={refundInputClassName} />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">QTY</label>
            <Input readOnly value={String(qty)} className={refundInputClassName} />
          </div>
        </div>

        <BaseTable
          data={refund.payments ?? []}
          columns={columns}
          headerRowClassName="bg-[#E9EEF5] hover:bg-[#E9EEF5]"
          defaultSort={{ key: 'payment_date', direction: 'desc' }}
          headerActions={
            <Button className={refundPrimaryButtonClassName} onClick={() => setIsAddDetailOpen(true)}>
              <Plus className="h-4 w-4" />
              Tambah Pembayaran Refund
            </Button>
          }
        />

        <PurchaseRefundPaymentDetailModal open={isAddDetailOpen} onClose={() => setIsAddDetailOpen(false)} refund={refund} />
        <PurchaseRefundPaymentDetailModal open={Boolean(editingPayment)} onClose={() => setEditingPayment(null)} refund={refund} payment={editingPayment} />

        <AlertDialog open={Boolean(deletingPayment)} onOpenChange={(open) => !open && setDeletingPayment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Detail Refund Pembelian</AlertDialogTitle>
              <AlertDialogDescription>Detail refund pembelian yang dihapus tidak bisa dikembalikan. Lanjutkan?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeletePayment}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
