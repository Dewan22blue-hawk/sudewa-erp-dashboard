import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

const paymentSchema = z.object({
  payment_at: z.string().min(1, "Tanggal bayar wajib diisi"),
  cash_payment_amount: z.coerce.number().min(0).default(0),
  bca_payment_amount: z.coerce.number().min(0).default(0),
  bca_payment_usd_amount: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  defaultValues?: Partial<PaymentFormData>;
  loading?: boolean;
}

export function PaymentModal({ open, onClose, onSubmit, defaultValues, loading }: Props) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      payment_at: new Date().toISOString().split('T')[0],
      cash_payment_amount: 0,
      bca_payment_amount: 0,
      bca_payment_usd_amount: 0,
      note: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        form.reset({
          payment_at: defaultValues.payment_at || new Date().toISOString().split('T')[0],
          cash_payment_amount: defaultValues.cash_payment_amount || 0,
          bca_payment_amount: defaultValues.bca_payment_amount || 0,
          bca_payment_usd_amount: defaultValues.bca_payment_usd_amount || 0,
          note: defaultValues.note || '',
        });
      } else {
        form.reset({
          payment_at: new Date().toISOString().split('T')[0],
          cash_payment_amount: 0,
          bca_payment_amount: 0,
          bca_payment_usd_amount: 0,
          note: '',
        });
      }
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (data: PaymentFormData) => {
    if (data.cash_payment_amount === 0 && data.bca_payment_amount === 0 && data.bca_payment_usd_amount === 0) {
      form.setError('cash_payment_amount', { message: 'Minimal salah satu nominal pembayaran harus diisi' });
      return;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Riwayat Pembayaran' : 'Tambah Riwayat Pembayaran'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="payment_at" render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Transaksi Pembayaran</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="cash_payment_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pembayaran Cash/Tunai</FormLabel>
                  <FormControl>
                    <MoneyInput name={field.name} value={field.value} onChangeValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bca_payment_amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pembayaran Transfer (BCA)</FormLabel>
                  <FormControl>
                    <MoneyInput name={field.name} value={field.value} onChangeValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="note" render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan Tambahan</FormLabel>
                <FormControl><Textarea {...field} placeholder="Tulis asalmula uang atau referensi (opsional)" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Batal</Button>
              <Button type="submit" className="bg-[#1e293b] text-white" disabled={loading}>
                 <Save className="w-4 h-4 mr-2" /> Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
