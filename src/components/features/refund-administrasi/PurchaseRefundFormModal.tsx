import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Loader2 } from 'lucide-react';
import type { UnitTransactionRefund } from '@/@types/refund.type';
import { useCreateRefund, useRefundSelectableItems, useUpdateRefund } from '@/hooks/useRefundAdministrasi';
import { createRefundSchema, type CreateRefundFormValues } from '@/schemas/refund.schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { refundInputClassName, refundLabelClassName, refundPrimaryButtonClassName, refundSecondaryButtonClassName } from './purchase-refund.styles';

interface PurchaseRefundFormModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  refund?: UnitTransactionRefund | null;
  entityLabel?: 'pembelian' | 'penjualan';
}

const displayDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split('T')[0] || '';
};

const getDisplayStatus = (refund?: UnitTransactionRefund | null) => {
  if (!refund) return 'belum-dibayar';
  const totalPaid = (refund.payments ?? []).reduce((total, item) => total + Number(item.amount), 0);
  if (totalPaid <= 0) return 'belum-dibayar';
  if (totalPaid >= Number(refund.refund_amount || 0)) return 'lunas';
  return 'proses';
};

export default function PurchaseRefundFormModal({ open, onClose, transactionId, refund, entityLabel = 'pembelian' }: PurchaseRefundFormModalProps) {
  const isEdit = Boolean(refund);
  const titleLabel = entityLabel === 'penjualan' ? 'penjualan' : 'pembelian';
  const createMutation = useCreateRefund();
  const updateMutation = useUpdateRefund();
  const selectableItemsQuery = useRefundSelectableItems(transactionId);
  const defaultItemIds = selectableItemsQuery.items.map((item) => item.id);
  const lessPayment = refund
    ? Math.max(0, Number(refund.refund_amount || 0) - (refund.payments ?? []).reduce((total, item) => total + Number(item.amount), 0))
    : 0;
  const qty = refund?.items?.length ?? 0;

  const form = useForm<CreateRefundFormValues & { status?: string }>({
    resolver: zodResolver(createRefundSchema.extend({ status: z.string().optional() })),
    defaultValues: {
      unit_transaction_id: transactionId,
      refund_date: displayDate(refund?.refund_date) || new Date().toISOString().split('T')[0],
      refund_amount: Number(refund?.refund_amount || 0),
      note: refund?.note || '',
      unit_transaction_item_detail_ids: refund?.items?.map((item) => item.id) ?? defaultItemIds,
      status: getDisplayStatus(refund),
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      unit_transaction_id: transactionId,
      refund_date: displayDate(refund?.refund_date) || new Date().toISOString().split('T')[0],
      refund_amount: Number(refund?.refund_amount || 0),
      note: refund?.note || '',
      unit_transaction_item_detail_ids: refund?.items?.map((item) => item.id) ?? defaultItemIds,
      status: getDisplayStatus(refund),
    });
  }, [defaultItemIds, form, open, refund, transactionId]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (refund) {
        await updateMutation.mutateAsync({
          id: refund.id,
          payload: {
            refund_date: values.refund_date,
            refund_amount: values.refund_amount,
            note: values.note,
          },
        });
        toast.success(`Data refund ${titleLabel} berhasil diperbarui`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`Data refund ${titleLabel} berhasil ditambahkan`);
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.message || `Gagal menyimpan data refund ${titleLabel}`);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[430px] rounded-[14px] border-none p-0 shadow-[0_20px_50px_rgba(15,23,42,0.25)] sm:max-w-[430px]">
        <DialogHeader className="px-6 pb-0 pt-7 text-left">
          <DialogTitle className="text-[18px] font-semibold text-[#111827]">
            {isEdit ? `Ubah Data Refund ${titleLabel}` : `Tambah Data Refund ${titleLabel}`}
          </DialogTitle>
          <p className="mt-2 text-sm text-[#6B7280]">
            {isEdit ? 'Ubah detail refund dengan cepat dan mudah' : 'Tambah detail refund dengan cepat dan mudah'}
          </p>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 px-6 pb-7 pt-6">
          <div>
            <Label className={refundLabelClassName}>Tanggal Refund</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />
              <Input type="date" className={`${refundInputClassName} pl-12`} {...form.register('refund_date')} />
            </div>
          </div>

          <div>
            <Label className={refundLabelClassName}>Nominal Refund</Label>
            <Input type="number" className={refundInputClassName} placeholder="Rp" {...form.register('refund_amount')} />
          </div>

          <div>
            <Label className={refundLabelClassName}>Type</Label>
            <Input className={refundInputClassName} placeholder="Masukkan tipe" {...form.register('note')} />
          </div>

          {isEdit ? (
            <>
              <div>
                <Label className={refundLabelClassName}>Kurang Bayar</Label>
                <Input readOnly className={refundInputClassName} value={`Rp ${lessPayment.toLocaleString('id-ID')}`} />
              </div>

              <div>
                <Label className={refundLabelClassName}>QTY</Label>
                <Input readOnly className={refundInputClassName} value={String(qty)} />
              </div>

              <div>
                <Label className={refundLabelClassName}>Status</Label>
                <Select value={form.watch('status') || 'belum-dibayar'} onValueChange={(value) => form.setValue('status', value)}>
                  <SelectTrigger className={refundInputClassName}>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="proses">Proses</SelectItem>
                    <SelectItem value="belum-dibayar">Belum dibayar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          <div className="space-y-3 pt-1">
            <Button type="submit" className={`w-full ${refundPrimaryButtonClassName}`} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
            <Button type="button" variant="outline" className={`w-full ${refundSecondaryButtonClassName}`} onClick={onClose} disabled={isPending}>
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
