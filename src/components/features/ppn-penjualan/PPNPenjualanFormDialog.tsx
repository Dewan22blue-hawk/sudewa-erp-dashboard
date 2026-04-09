'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ApiError } from '@/@types/api';
import { type PPNPenjualan, UpdatePPNPenjualanSchema, type UpdatePPNPenjualanFormValues } from '@/@types/ppn-penjualan.types';
import { useUpdatePPNPenjualan } from '@/hooks/usePPNPenjualan';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: PPNPenjualan | null;
}

const toDate = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeFieldErrors = (error: unknown): Partial<Record<keyof UpdatePPNPenjualanFormValues, string>> => {
  if (!error || typeof error !== 'object' || !('details' in error)) return {};

  const details = (error as ApiError).details;
  if (!details || typeof details !== 'object') return {};

  const entries = Object.entries(details).filter(([, value]) => Array.isArray(value) && value.length > 0);

  return entries.reduce<Partial<Record<keyof UpdatePPNPenjualanFormValues, string>>>((accumulator, [field, messages]) => {
    if (field in UpdatePPNPenjualanSchema.shape) {
      accumulator[field as keyof UpdatePPNPenjualanFormValues] = String((messages as unknown[])[0]);
    }

    return accumulator;
  }, {});
};

export default function PPNPenjualanFormDialog({ open, onClose, initialData }: Props) {
  const updateMutation = useUpdatePPNPenjualan();

  const form = useForm<UpdatePPNPenjualanFormValues>({
    resolver: zodResolver(UpdatePPNPenjualanSchema),
    defaultValues: {
      fpm_date: null,
      nsfpm_age: null,
      nsfp_amount: null,
      amount: null,
    },
  });

  useEffect(() => {
    if (!initialData) {
      form.reset({
        fpm_date: null,
        nsfpm_age: null,
        nsfp_amount: null,
        amount: null,
      });
      return;
    }

    form.reset({
      fpm_date: toDate(initialData.fpm_date),
      nsfpm_age: toDate(initialData.nsfpm_age),
      nsfp_amount: initialData.nsfpm_input || null,
      amount: initialData.payment_amount || null,
    });
  }, [form, initialData]);

  const onSubmit = async (values: UpdatePPNPenjualanFormValues) => {
    if (!initialData) return;

    try {
      await updateMutation.mutateAsync({
        id: initialData.id,
        payload: {
          fpm_date: values.fpm_date ? format(values.fpm_date, 'yyyy-MM-dd') : undefined,
          nsfpm_age: values.nsfpm_age ? format(values.nsfpm_age, 'yyyy-MM-dd') : undefined,
          nsfp_amount: values.nsfp_amount ?? undefined,
          amount: values.amount ?? undefined,
        },
      });

      toast.success('Data PPN penjualan berhasil diperbarui');
      onClose();
    } catch (error) {
      const fieldErrors = normalizeFieldErrors(error);

      Object.entries(fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof UpdatePPNPenjualanFormValues, { message });
      });

      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Gagal memperbarui data PPN penjualan';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ubah Data PPN Penjualan</DialogTitle>
          <p className="text-sm text-muted-foreground">Perubahan disimpan melalui endpoint report PPN sales.</p>
        </DialogHeader>

        {initialData ? (
          <>
            <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs uppercase text-slate-500">Kode Invoice</div>
                <div className="font-medium text-slate-900">{initialData.code}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Customer</div>
                <div className="font-medium text-slate-900">{initialData.supplier}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Tipe Unit</div>
                <div className="font-medium text-slate-900">{initialData.unit_type.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-500">Harga Unit</div>
                <div className="font-medium text-slate-900">{formatCurrency(initialData.unit_price)}</div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fpm_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal FPM</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} placeholder="Pilih tanggal FPM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nsfpm_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia NSFPM</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} placeholder="Pilih usia NSFPM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nsfp_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nilai NSFPM</FormLabel>
                        <FormControl>
                          <MoneyInput value={field.value ?? 0} onChangeValue={(value) => field.onChange(value)} placeholder="Masukkan nilai NSFPM" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Pembayaran</FormLabel>
                        <FormControl>
                          <MoneyInput value={field.value ?? 0} onChangeValue={(value) => field.onChange(value)} placeholder="Masukkan jumlah pembayaran" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel>Nomor Mesin</FormLabel>
                    <Input value={initialData.unit_transaction_item_detail.machine_number} readOnly className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Nomor Rangka</FormLabel>
                    <Input value={initialData.unit_transaction_item_detail.chassis_number} readOnly className="bg-slate-50" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={updateMutation.isPending}>
                    Batal
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
