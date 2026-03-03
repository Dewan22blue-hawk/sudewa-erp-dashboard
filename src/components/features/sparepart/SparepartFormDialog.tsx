'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sparepartSchema, SparepartFormValues } from '@/scheme/sparepart.schema';
import { Sparepart } from '@/@types/sparepart.types';
import { useCreateSparepart, useSparepartCategories, useUpdateSparepart } from '@/hooks/useSparepart';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sparepart: Sparepart | null;
  companyId: string;
}

export function SparepartFormDialog({ open, onOpenChange, sparepart, companyId }: Props) {
  const isEdit = Boolean(sparepart);

  const createMutation = useCreateSparepart(companyId);
  const updateMutation = useUpdateSparepart(companyId);
  const { data: categories, isLoading: loadingCategories } = useSparepartCategories();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SparepartFormValues>({
    resolver: zodResolver(sparepartSchema),
    defaultValues: {
      code: '',
      name: '',
      categoryId: 0,
      unit: '',
      purchasePrice: 0,
      sellingPrice: 0,
    },
  });

  useEffect(() => {
    if (sparepart) {
      reset({
        code: sparepart.code,
        name: sparepart.name,
        categoryId: sparepart.categoryId ?? sparepart.category?.id ?? 0,
        unit: sparepart.unit,
        purchasePrice: sparepart.purchasePrice,
        sellingPrice: sparepart.sellingPrice,
      });
    } else {
      reset({
        code: '',
        name: '',
        categoryId: 0,
        unit: '',
        purchasePrice: 0,
        sellingPrice: 0,
      });
    }
  }, [sparepart, reset]);

  const selectedCategoryId = watch('categoryId');
  const selectedUnit = watch('unit');

  const onSubmit = async (values: SparepartFormValues) => {
    try {
      const payload = {
        ...values,
        categoryId: Number(values.categoryId),
        companyId,
      };

      if (isEdit && sparepart) {
        await updateMutation.mutateAsync({
          id: sparepart.id,
          payload,
        });
        toast.success('Data berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Data berhasil ditambahkan');
      }

      onOpenChange(false);
      reset();
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah Data SparePart' : 'Tambah Data SparePart'}</DialogTitle>
          <DialogDescription>Masukkan detail sparepart baru</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Kode Part</label>
            <Input placeholder="Tambahkan kode" {...register('code')} />
            {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Nama Part</label>
            <Input placeholder="Tambahkan nama" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Kategori</label>
            <Select onValueChange={(value) => setValue('categoryId', Number(value))} value={selectedCategoryId ? String(selectedCategoryId) : ''} disabled={loadingCategories}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? 'Memuat kategori...' : 'Pilih kategori'} />
              </SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Satuan</label>
            <Select onValueChange={(value) => setValue('unit', value)} value={selectedUnit || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Satuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pcs">Pcs</SelectItem>
                <SelectItem value="Set">Set</SelectItem>
                <SelectItem value="Box">Box</SelectItem>
              </SelectContent>
            </Select>
            {errors.unit && <p className="text-xs text-destructive mt-1">{errors.unit.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Harga Beli</label>
            <Input type="number" placeholder="Tambahkan harga beli" {...register('purchasePrice')} />
            {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Harga Jual</label>
            <Input type="number" placeholder="Tambahkan harga" {...register('sellingPrice')} />
            {errors.sellingPrice && <p className="text-xs text-destructive mt-1">{errors.sellingPrice.message}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Simpan
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
