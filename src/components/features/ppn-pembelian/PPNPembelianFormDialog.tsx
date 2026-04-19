'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ApiError } from '@/@types/api';
import { type PPNPembelian, UpdatePPNPembelianSchema, type UpdatePPNPembelianFormValues } from '@/@types/ppn-pembelian.types';
import { useUpdatePPNPembelian } from '@/hooks/usePPNPembelian';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: PPNPembelian | null;
}

const toDate = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeFieldErrors = (error: unknown): Partial<Record<keyof UpdatePPNPembelianFormValues, string>> => {
  if (!error || typeof error !== 'object' || !('details' in error)) return {};

  const details = (error as ApiError).details;
  if (!details || typeof details !== 'object') return {};

  const entries = Object.entries(details).filter(([, value]) => Array.isArray(value) && value.length > 0);

  return entries.reduce<Partial<Record<keyof UpdatePPNPembelianFormValues, string>>>((accumulator, [field, messages]) => {
    if (field in UpdatePPNPembelianSchema.shape) {
      accumulator[field as keyof UpdatePPNPembelianFormValues] = String((messages as unknown[])[0]);
    }

    return accumulator;
  }, {});
};

export default function PPNPembelianFormDialog({ open, onClose, initialData }: Props) {
  const updateMutation = useUpdatePPNPembelian();

  const form = useForm<UpdatePPNPembelianFormValues>({
    resolver: zodResolver(UpdatePPNPembelianSchema),
    defaultValues: {
      fp_date: null,
      nsfp_age: null,
      nsfp_amount: null,
      amount: null,
    },
  });

  useEffect(() => {
    if (!initialData) {
      form.reset({
        fp_date: null,
        nsfp_age: null,
        nsfp_amount: null,
        amount: null,
      });
      return;
    }

    form.reset({
      fp_date: toDate(initialData.fp_date),
      nsfp_age: toDate(initialData.nsfp_age),
      nsfp_amount: initialData.nsfp_input || null,
      amount: initialData.payment_amount || null,
    });
  }, [form, initialData]);

  const onSubmit = async (values: UpdatePPNPembelianFormValues) => {
    if (!initialData) return;

    try {
      await updateMutation.mutateAsync({
        id: initialData.id,
        payload: {
          fp_date: values.fp_date ? format(values.fp_date, 'yyyy-MM-dd') : undefined,
          nsfp_age: values.nsfp_age ? format(values.nsfp_age, 'yyyy-MM-dd') : undefined,
          nsfp_amount: values.nsfp_amount ?? undefined,
          amount: values.amount ?? undefined,
        },
      });

      toast.success('Data PPN pembelian berhasil diperbarui');
      onClose();
    } catch (error) {
      const fieldErrors = normalizeFieldErrors(error);

      Object.entries(fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof UpdatePPNPembelianFormValues, { message });
      });

      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Gagal memperbarui data PPN pembelian';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit PPN</DialogTitle>
          <DialogDescription>Edit detail PPN</DialogDescription>
        </DialogHeader>

        {initialData ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="grid gap-2">
                <FormLabel>Kode Beli</FormLabel>
                <Input value={initialData.code} readOnly placeholder="Generated XX" />
              </div>

              <div className="grid gap-2">
                <FormLabel>No Mesin</FormLabel>
                <Input value={initialData.unit_transaction_item_detail?.machine_number || ''} readOnly placeholder="Tambahkan no mesin" />
              </div>

              <FormField
                control={form.control}
                name="fp_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal FPM</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} placeholder="Jan 20, 2025" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nsfp_age"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Masa FPM</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} placeholder="Jan 20, 2025" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nsfp_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NFP Masukan</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value ?? 0} onChangeValue={(value) => field.onChange(value)} placeholder="Tambahkan NFP" />
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
                    <FormLabel>Biaya</FormLabel>
                    <FormControl>
                      <MoneyInput value={field.value ?? 0} onChangeValue={(value) => field.onChange(value)} placeholder="Tambahkan biaya" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={updateMutation.isPending}>
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
