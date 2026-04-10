import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { SalesItem } from '@/components/features/sales/sales.data';
import { Kas } from '@/@types/kas.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils/currency';

const refundSchema = z.object({
  cashId: z.string().min(1, 'Kas wajib dipilih'),
  refundDate: z.date().optional(),
  description: z.string().min(1, 'Keterangan wajib diisi').max(500, 'Maksimal 500 karakter'),
});

export type SalesRefundFormValues = z.infer<typeof refundSchema>;

interface Props {
  sales: SalesItem;
  cashOptions: Kas[];
  loading?: boolean;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: SalesRefundFormValues) => Promise<void>;
}

export function SalesRefundForm({ sales, cashOptions, loading = false, submitting = false, onCancel, onSubmit }: Props) {
  const totalSales = Number(sales.totalJual ?? 0);
  const totalPaid = Number(sales.totalBayar ?? 0);
  const refundAmount = useMemo(() => Math.max(0, totalPaid), [totalPaid]);

  const form = useForm<SalesRefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      cashId: '',
      refundDate: new Date(),
      description: '',
    },
  });

  const isCashEmpty = cashOptions.length === 0;

  useEffect(() => {
    if (cashOptions.length === 1) {
      form.setValue('cashId', String(cashOptions[0]?.id ?? ''));
    }
  }, [cashOptions, form]);

  return (
    <Card className="rounded-[20px] border border-gray-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Informasi Penjualan</h2>
            <div className="mt-5 h-px bg-gray-200" />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                await onSubmit(values);
              })}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-900">Kode Penjualan</FormLabel>
                  <Input value={sales.kodeJual} readOnly className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]" />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-900">Customer</FormLabel>
                  <Input value={sales.customer ?? '-'} readOnly className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]" />
                </div>

                <FormField
                  control={form.control}
                  name="refundDate"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-slate-900">Tanggal Refund</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ?? null}
                          onChange={field.onChange}
                          placeholder="Pick a date"
                          className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 md:col-span-2">
                  <FormLabel className="text-sm font-medium text-slate-900">Total Penjualan</FormLabel>
                  <Input value={formatCurrency(totalSales)} readOnly className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]" />
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-900">Telah Dibayar</FormLabel>
                  <Input value={formatCurrency(totalPaid)} readOnly className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]" />
                </div>

                <FormField
                  control={form.control}
                  name="cashId"
                  render={({ field }) => (
                    <FormItem className="space-y-2 md:col-span-2">
                      <FormLabel className="text-sm font-medium text-slate-900">Kas Refund</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isCashEmpty || loading}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
                            <SelectValue placeholder={isCashEmpty ? 'Kas tidak tersedia' : 'Pilih Kas'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cashOptions.map((cash) => (
                            <SelectItem key={cash.id} value={String(cash.id)}>
                              {cash.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-sm font-medium text-slate-900">Nominal Refund</FormLabel>
                  <Input value={formatCurrency(refundAmount)} readOnly className="h-12 rounded-xl border-gray-200 bg-white text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-900">Keterangan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Type your message here."
                            className="min-h-[94px] rounded-xl border-gray-200 bg-white px-3 py-2 text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 pt-8">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting} className="text-base font-medium text-slate-600 hover:bg-transparent hover:text-slate-900">
                  Batal
                </Button>
                <Button type="submit" disabled={submitting || loading} className="h-12 min-w-[104px] rounded-xl bg-[#284d74] px-6 text-base font-medium text-white shadow-none hover:bg-[#1f3f5f]">
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
