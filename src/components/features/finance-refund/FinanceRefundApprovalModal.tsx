import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { FinanceRefundRecord, RefundTransactionType } from '@/@types/finance-refund.types';
import type { UnitTransactionRefund } from '@/@types/refund.type';
import { useApproveFinanceRefund } from '@/hooks/useFinanceRefund';
import { useKas } from '@/hooks/useKas';
import { useRefundList } from '@/hooks/useRefundAdministrasi';
import { financeApprovalRefundSchema, type FinanceApprovalRefundFormValues } from '@/schemas/refund.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils/currency';
import { RefundStatusBadge } from '@/components/features/refund/RefundStatusBadge';
import { refundStatusLabel, refundTypeLabel } from '@/components/features/refund/refund.utils';
import { toast } from 'sonner';

interface FinanceRefundApprovalModalProps {
  open: boolean;
  onClose: () => void;
  refund: FinanceRefundRecord;
  transactionType: RefundTransactionType;
}

const formatDate = (value: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID');
};

export default function FinanceRefundApprovalModal({ open, onClose, refund, transactionType }: FinanceRefundApprovalModalProps) {
  const approveMutation = useApproveFinanceRefund(transactionType);
  const kasQuery = useKas();
  const refundHistoryQuery = useRefundList({ page: 1, perPage: 100, search: refund.transactionCode });

  const relatedRefund = useMemo<UnitTransactionRefund | undefined>(() => {
    return (refundHistoryQuery.data?.data ?? []).find(
      (item) => item.unit_transaction_id === refund.transactionId || item.code === refund.refundCode,
    );
  }, [refund.refundCode, refund.transactionId, refundHistoryQuery.data?.data]);

  const payments = relatedRefund?.payments ?? refund.payments ?? [];
  const totalPaid = payments.reduce((total, item) => total + Number(item.amount), 0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FinanceApprovalRefundFormValues>({
    resolver: zodResolver(financeApprovalRefundSchema),
    defaultValues: {
      status: refund.status,
      cash_id: refund.cashId,
    },
  });

  const selectedStatus = watch('status');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        status: refund.status,
        cash_id: refund.cashId,
      });
      onClose();
    }
  };

  const onSubmit = async (values: FinanceApprovalRefundFormValues) => {
    try {
      await approveMutation.mutateAsync({
        refundId: refund.id,
        payload: {
          status: values.status,
          cash_id: values.status === 'approve' ? values.cash_id : undefined,
        },
      });
      toast.success(`Refund ${refundStatusLabel[values.status]!.toLowerCase()} dengan sukses`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Gagal memperbarui approval refund');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <DialogTitle>Approval Refund Finance</DialogTitle>
          <DialogDescription>
            Review refund {refund.refundCode} untuk transaksi {refund.transactionCode} sebelum memproses approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tipe Refund</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{refundTypeLabel[refund.transactionType]}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Nominal Refund</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{formatCurrency(refund.refundAmount)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Dibayar</p>
              <p className="mt-2 text-sm font-semibold text-emerald-700">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status Saat Ini</p>
              <div className="mt-2">
                <RefundStatusBadge status={refund.status} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Informasi Refund</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-slate-500">Kode Refund</dt>
                  <dd className="font-medium text-slate-900">{refund.refundCode}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-slate-500">Tanggal Refund</dt>
                  <dd className="font-medium text-slate-900">{formatDate(refund.refundDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-slate-500">Kode Transaksi</dt>
                  <dd className="font-medium text-slate-900">{refund.transactionCode}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-slate-500">Relasi</dt>
                  <dd className="font-medium text-slate-900">{refund.partnerName}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Catatan Refund</Label>
                <Textarea value={refund.note || '-'} readOnly className="mt-2 min-h-24 resize-none bg-white" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Form Approval</h3>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Status Approval</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="waiting">Menunggu</SelectItem>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status ? <p className="text-sm text-red-600">{errors.status.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label>Cash Account</Label>
                  <Controller
                    control={control}
                    name="cash_id"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={selectedStatus !== 'approve' || kasQuery.isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedStatus === 'approve' ? 'Pilih cash account' : 'Cash account hanya diperlukan saat approve'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(kasQuery.data?.data ?? []).map((kas) => (
                            <SelectItem key={kas.id} value={String(kas.id)}>
                              {kas.description || kas.code || `Kas ${kas.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.cash_id ? <p className="text-sm text-red-600">{errors.cash_id.message}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Histori Pembayaran Refund</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundHistoryQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-slate-500">
                      Memuat histori pembayaran...
                    </TableCell>
                  </TableRow>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.payment_date || payment.created_at)}</TableCell>
                      <TableCell className="font-medium text-slate-900">{formatCurrency(payment.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-slate-500">
                      Belum ada pembayaran refund.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={approveMutation.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={approveMutation.isPending}>
              {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
