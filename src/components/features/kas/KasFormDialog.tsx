'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kasSchema, KasFormValues } from '@/scheme/kas.schema';
import { Kas } from '@/@types/kas.types';
import { useCreateKas, useUpdateKas } from '@/hooks/useKas';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import RequiredMark from '@/components/ui/required-mark';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kas: Kas | null;
  companyId: string;
}

export function KasFormDialog({ open, onOpenChange, kas, companyId }: Props) {
  const isEdit = Boolean(kas);

  const createMutation = useCreateKas(companyId);
  const updateMutation = useUpdateKas(companyId);

  const form = useForm<KasFormValues>({
    resolver: zodResolver(kasSchema),
    defaultValues: {
      code: '',
      description: '',
      type: 'cash',
    },
  });

  // Reset or Prefill
  useEffect(() => {
    if (open) {
      if (kas) {
        form.reset({
          code: kas.code,
          description: kas.description,
          type: kas.type,
        });
      } else {
        form.reset({
          code: '',
          description: '',
          type: 'cash',
        });
      }
    }
  }, [open, kas, form]);

  const onSubmit = async (values: KasFormValues) => {
    // Double submit protection
    if (createMutation.isPending || updateMutation.isPending) return;

    try {
      if (isEdit && kas) {
        await updateMutation.mutateAsync({
          id: kas.id,
          payload: values,
        });
        toast.success('Data berhasil diperbarui');
      } else {
        await createMutation.mutateAsync({
          ...values,
          companyId,
        });
        toast.success('Data berhasil ditambahkan');
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error?.message || 'Terjadi kesalahan');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Data Kas' : 'Tambah Data Kas'}</DialogTitle>
          <DialogDescription className="hidden">Form untuk {isEdit ? 'mengubah' : 'menambah'} data kas</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Kas<RequiredMark /></FormLabel>
                  <FormControl>
                    <Input placeholder="Tambahkan kode" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi<RequiredMark /></FormLabel>
                  <FormControl>
                    <Input placeholder="Tambahkan nama" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis<RequiredMark /></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Jenis Kas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 pt-4">
              <Button type="submit" className="w-full bg-black hover:bg-black/90" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
