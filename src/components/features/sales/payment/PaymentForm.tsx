import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SalesItem } from '../sales.data';
import { useEffect } from 'react';

const paymentSchema = z.object({
  paymentBca: z.number().min(0),
  paymentBcaUsd: z.number().min(0),
  paymentCash: z.number().min(0),
  totalBayar: z.number(),
  kurangBayar: z.number(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
  salesData: SalesItem;
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('Rp', 'Rp ');
}

export function PaymentForm({ salesData, onSubmit, onCancel }: Props) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentBca: 0,
      paymentBcaUsd: 0,
      paymentCash: 0,
      totalBayar: 0,
      kurangBayar: salesData.totalJual,
    },
  });

  const paymentBca = form.watch('paymentBca');
  const paymentBcaUsd = form.watch('paymentBcaUsd');
  const paymentCash = form.watch('paymentCash');

  useEffect(() => {
    const total = (paymentBca || 0) + (paymentBcaUsd || 0) + (paymentCash || 0);
    form.setValue('totalBayar', total);
    form.setValue('kurangBayar', Math.max(0, salesData.totalJual - total));
  }, [paymentBca, paymentBcaUsd, paymentCash, salesData.totalJual, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <section className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm text-muted-foreground">Biaya</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm">Total Beli</label>
              <Input readOnly className="bg-muted/40" value={formatMoney(salesData.totalDpp)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Total PPN</label>
              <Input readOnly className="bg-muted/40" value={formatMoney(salesData.totalPpn)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Total Biaya</label>
              <Input readOnly className="bg-muted/40" value={formatMoney(salesData.totalJual)} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm text-muted-foreground">Pembayaran</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="paymentBca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BCA IDR</FormLabel>
                  <FormControl>
                    <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentBcaUsd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BCA USD</FormLabel>
                  <FormControl>
                    <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentCash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash</FormLabel>
                  <FormControl>
                    <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm text-muted-foreground">Invoice</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm">Tanggal</label>
              <Input readOnly className="bg-muted/40" value={salesData.tanggal} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Total Bayar</label>
              <Input readOnly className="bg-muted/40" value={formatMoney(form.watch('totalBayar'))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Kurang Bayar</label>
              <Input readOnly className="bg-muted/40" value={formatMoney(form.watch('kurangBayar'))} />
            </div>
          </div>
        </section>

        <div className="flex justify-center gap-3 pt-6">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" className="bg-emerald-500 text-white hover:bg-emerald-600">
            <Save className="mr-2 h-4 w-4" />
            Bayar
          </Button>
        </div>
      </form>
    </Form>
  );
}
