'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreatePenerimaanUnit } from '@/hooks/usePenerimaanUnit';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PenerimaanUnitFormDialog({ open, onClose }: Props) {
  const create = useCreatePenerimaanUnit();
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    supplier: '',
    keterangan: '',
  });

  const handleSubmit = async () => {
    if (!form.tanggal || !form.supplier) {
      toast.error('Tanggal penerimaan dan supplier wajib diisi');
      return;
    }
    await create.mutateAsync(form);
    toast.success('Data berhasil disimpan');
    onClose();
    setForm({ tanggal: new Date().toISOString().split('T')[0], supplier: '', keterangan: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Input Penerimaan Unit</DialogTitle>
          <p className="text-sm text-gray-500">Masukkan detail penerimaan unit baru</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <label className="text-gray-700">Kode Akun</label>
            <Input value="Auto Generated" disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2 text-sm">
            <label className="text-gray-700">Tanggal Penerimaan</label>
            <Input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          </div>

          <div className="space-y-2 text-sm">
            <label className="text-gray-700">Nama Supplier</label>
            <Input placeholder="Masukkan nama supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          </div>

          <div className="space-y-2 text-sm">
            <label className="text-gray-700">Keterangan</label>
            <Textarea placeholder="Tulis keterangan di sini" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={3} />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Batal
          </Button>
          <Button className="w-full sm:w-auto bg-[#19355d]" onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
