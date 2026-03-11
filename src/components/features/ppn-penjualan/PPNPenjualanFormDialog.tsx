'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ppnPenjualanSchema, PPNPenjualanFormValues } from '@/scheme/ppn-penjualan.schema';
import { PPNPenjualan } from '@/@types/ppn-penjualan.types';
import { useCreatePPNPenjualan, useUpdatePPNPenjualan } from '@/hooks/usePPNPenjualan';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: PPNPenjualan | null;
}

export default function PPNPenjualanFormDialog({ open, onClose, initialData }: Props) {
  const isEdit = !!initialData;

  const createMutation = useCreatePPNPenjualan();
  const updateMutation = useUpdatePPNPenjualan();

  const form = useForm<PPNPenjualanFormValues>({
    resolver: zodResolver(ppnPenjualanSchema) as any,
    defaultValues: {
      kodeJual: 'Generated XX',
      customer: '',
      nsfpkKeluaran: '',
      biaya: 0,
      qty: 0,
      tipeUnit: '',
      noMesin: '',
      noRangka: '',
      hargaJual: 0,
      hargaUnit: 0,
      dppJual: 0,
      ppn: 0,
      paymentJual: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        qty: initialData.qty ?? undefined,
        biaya: initialData.biaya ?? undefined,
        hargaJual: initialData.hargaJual ?? undefined,
        hargaUnit: initialData.hargaUnit ?? undefined,
        dppJual: initialData.dppJual ?? undefined,
        ppn: initialData.ppn ?? undefined,
        paymentJual: initialData.paymentJual ?? undefined,
        // Assuming Service returns strings for dates, we need to convert to Date object if needed
        // But for now let's assume we parse or default
        tanggalFPK: new Date(),
        masaNSFPK: new Date(),
      });
    } else {
      form.reset({
        kodeJual: 'Generated XX',
        customer: '',
        nsfpkKeluaran: '',
        biaya: 0,
        qty: 0,
        tipeUnit: '',
        noMesin: '',
        noRangka: '',
        hargaJual: 0,
        hargaUnit: 0,
        dppJual: 0,
        ppn: 0,
        paymentJual: 0,
        tanggalFPK: new Date(),
        masaNSFPK: new Date(),
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: PPNPenjualanFormValues) => {
    try {
      const formattedData = {
        ...values,
        tanggalFPK: format(values.tanggalFPK, 'dd/MM/yyyy'),
        masaNSFPK: format(values.masaNSFPK, 'MMM yyyy'),
      };

      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          ...initialData,
          ...formattedData,
          qty: formattedData.qty ?? 0,
          biaya: formattedData.biaya ?? 0,
          hargaJual: formattedData.hargaJual ?? 0,
          hargaUnit: formattedData.hargaUnit ?? 0,
          dppJual: formattedData.dppJual ?? 0,
          ppn: formattedData.ppn ?? 0,
          paymentJual: formattedData.paymentJual ?? 0,
        });
        toast.success('Data berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          ...formattedData,
          qty: formattedData.qty ?? 0,
          biaya: formattedData.biaya ?? 0,
          hargaJual: formattedData.hargaJual ?? 0,
          hargaUnit: formattedData.hargaUnit ?? 0,
          dppJual: formattedData.dppJual ?? 0,
          ppn: formattedData.ppn ?? 0,
          paymentJual: formattedData.paymentJual ?? 0,
          kodeJual: 'INV-WIN/' + Date.now(),
          tanggalJual: format(new Date(), 'dd/MM/yyyy'),
        });
        toast.success('Data berhasil ditambahkan');
      }

      onClose();
      form.reset();
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Data PPN Penjualan' : 'Tambah PPN Penjualan'}</DialogTitle>
          <p className="text-sm text-muted-foreground">Masukkan detail PPN Penjualan baru</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kodeJual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Jual</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Customer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggalFPK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal FPK</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder="Pilih Tanggal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="masaNSFPK"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Masa NSFPK</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder="Pilih Masa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nsfpkKeluaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NSFPK Keluaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor NSFPK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipeUnit"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tipe Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="Tipe Unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder="Masukkan Qty" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="noMesin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Mesin</FormLabel>
                    <FormControl>
                      <Input placeholder="No Mesin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noRangka"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Rangka</FormLabel>
                    <FormControl>
                      <Input placeholder="No Rangka" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hargaJual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Jual</FormLabel>
                    <FormControl>
                      <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="biaya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya</FormLabel>
                    <FormControl>
                      <MoneyInput {...field} value={field.value || 0} onChangeValue={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
              <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" disabled={form.formState.isSubmitting}>
                Simpan
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onClose}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
