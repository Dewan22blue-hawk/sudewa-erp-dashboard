"use client";

import { useEffect, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Paperclip, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePembayaranHutangPayment } from '@/hooks/usePembayaranHutang';
import type { CreateLiabilityPaymentPayload } from '@/types/pembayaran-hutang.types';

type FormValues = {
  cash_payment_amount: string;
  bca_payment_amount: string;
  bca_payment_usd_amount: string;
  payment_at: string;
  note: string;
  payment_proof: FileList | null;
};

const currentDate = () => new Date().toISOString().slice(0, 10);

const createSchema = (remainingPayment: number) =>
  z
    .object({
      cash_payment_amount: z.string().trim().default(''),
      bca_payment_amount: z.string().trim().default(''),
      bca_payment_usd_amount: z.string().trim().default(''),
      payment_at: z.string().optional().default(''),
      note: z.string().optional().default(''),
      payment_proof: z.any().optional().nullable(),
    })
    .superRefine((values, context) => {
      const cashAmount = Number(values.cash_payment_amount || 0);
      const bcaAmount = Number(values.bca_payment_amount || 0);
      const usdAmount = Number(values.bca_payment_usd_amount || 0);
      const primaryPayment = cashAmount + bcaAmount;
      const totalPayment = primaryPayment + usdAmount;

      if (!Number.isFinite(cashAmount) || cashAmount < 0) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Nominal cash tidak valid', path: ['cash_payment_amount'] });
      }

      if (!Number.isFinite(bcaAmount) || bcaAmount < 0) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Nominal BCA tidak valid', path: ['bca_payment_amount'] });
      }

      if (!Number.isFinite(usdAmount) || usdAmount < 0) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Nominal USD tidak valid', path: ['bca_payment_usd_amount'] });
      }

      if (primaryPayment <= 0) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Minimal isi cash atau BCA lebih dari 0', path: ['cash_payment_amount'] });
      }

      if (remainingPayment > 0 && totalPayment > remainingPayment) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'Total pembayaran tidak boleh melebihi sisa hutang', path: ['cash_payment_amount'] });
      }
    });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billingId: number | null;
  remainingPayment: number;
  code?: string;
}

export default function PembayaranHutangPaymentDialog({ open, onOpenChange, billingId, remainingPayment, code }: Props) {
  const mutation = useCreatePembayaranHutangPayment();
  const schema = useMemo(() => createSchema(remainingPayment), [remainingPayment]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cash_payment_amount: '',
      bca_payment_amount: '',
      bca_payment_usd_amount: '',
      payment_at: currentDate(),
      note: '',
      payment_proof: null,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        cash_payment_amount: '',
        bca_payment_amount: '',
        bca_payment_usd_amount: '',
        payment_at: currentDate(),
        note: '',
        payment_proof: null,
      });
    }
  }, [open, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!billingId) return;

    const payload: CreateLiabilityPaymentPayload = {
      unit_transaction_billing_id: billingId,
      cash_payment_amount: values.cash_payment_amount || 0,
      bca_payment_amount: values.bca_payment_amount || 0,
      bca_payment_usd_amount: values.bca_payment_usd_amount || 0,
      payment_at: values.payment_at || undefined,
      note: values.note || undefined,
      payment_proof: values.payment_proof?.[0] ?? null,
    };

    try {
      await mutation.mutateAsync(payload);
      toast.success('Pembayaran berhasil disimpan');
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error?.message ?? 'Gagal menyimpan pembayaran');
    }
  };

  const proofFile = form.watch('payment_proof');
  const isBusy = mutation.isPending || form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran Hutang</DialogTitle>
          <DialogDescription>
            {code ? `Invoice ${code}` : 'Lengkapi nominal pembayaran dan unggah bukti jika tersedia.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cash Payment</label>
              <Input type="number" min="0" step="0.01" placeholder="0" {...form.register('cash_payment_amount')} disabled={isBusy} />
              {form.formState.errors.cash_payment_amount && <p className="text-xs text-destructive">{form.formState.errors.cash_payment_amount.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">BCA Payment</label>
              <Input type="number" min="0" step="0.01" placeholder="0" {...form.register('bca_payment_amount')} disabled={isBusy} />
              {form.formState.errors.bca_payment_amount && <p className="text-xs text-destructive">{form.formState.errors.bca_payment_amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">BCA Payment USD</label>
            <Input type="number" min="0" step="0.01" placeholder="0" {...form.register('bca_payment_usd_amount')} disabled={isBusy} />
            {form.formState.errors.bca_payment_usd_amount && <p className="text-xs text-destructive">{form.formState.errors.bca_payment_usd_amount.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Bayar</label>
              <Input type="date" {...form.register('payment_at')} disabled={isBusy} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bukti Pembayaran</label>
              <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <Input type="file" accept="image/*,application/pdf" {...form.register('payment_proof')} className="border-0 px-0 py-0 shadow-none file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-medium" disabled={isBusy} />
              </div>
              {proofFile?.[0] ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {proofFile[0].name}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keterangan</label>
            <Textarea placeholder="Catatan pembayaran" {...form.register('note')} disabled={isBusy} />
          </div>

          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Sisa hutang saat ini: <span className="font-semibold text-foreground">Rp{remainingPayment.toLocaleString('id-ID')}</span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Batal
            </Button>
            <Button type="submit" disabled={isBusy || !billingId} className="bg-black text-white hover:bg-black/90">
              {isBusy ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan
                </span>
              ) : (
                'Simpan Pembayaran'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
