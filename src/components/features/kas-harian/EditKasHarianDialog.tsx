import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { kasHarianSchema, KasHarianFormValues } from '@/scheme/kas-harian.schema';
import { useUpdateKasHarian } from '@/hooks/useKasHarian';
import KasHarianForm from './KasHarianForm';
import { KasHarian } from '@/@types/kas-harian.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KasHarian | null;
}

export default function EditKasHarianDialog({ open, onOpenChange, data }: Props) {
  const { mutate: updateKasHarian, isPending } = useUpdateKasHarian();

  const form = useForm<KasHarianFormValues>({
    resolver: zodResolver(kasHarianSchema),
    defaultValues: {
      tanggal: new Date(),
      akun: '',
      keterangan: '',
      nominal: 0,
      type: 'debit',
    },
  });

  useEffect(() => {
    if (data && open) {
      form.reset({
        tanggal: new Date(data.tanggal),
        akun: data.akun || '',
        keterangan: data.keterangan || '',
        nominal: data.debit > 0 ? data.debit : data.kredit,
        type: data.debit > 0 ? 'debit' : 'kredit',
      });
    }
  }, [data, open, form]);

  const onSubmit = (values: KasHarianFormValues) => {
    if (!data) return;
    updateKasHarian(
      { id: data.id, data: values },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Transaksi KAS</DialogTitle>
          <p className="text-sm text-gray-500">Masukkan detail transaksi baru</p>
        </DialogHeader>

        <KasHarianForm form={form} onSubmit={onSubmit} id="edit-kas-form" />

        <div className="flex flex-col gap-3 mt-4">
          <Button type="submit" className="w-full bg-[#1e293b] hover:bg-[#0f172a]" form="edit-kas-form" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
