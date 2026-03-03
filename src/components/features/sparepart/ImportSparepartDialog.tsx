'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useImportSparepart } from '@/hooks/useSparepart';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function ImportSparepartDialog({ open, onOpenChange, companyId }: Props) {
  const mutation = useImportSparepart(companyId);
  const [file, setFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    try {
      await mutation.mutateAsync({ file });
      toast.success('Data berhasil diimport');
      onOpenChange(false);
      setFile(null);
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>Masukkan file yang akan diunggah</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm" />

          <div className="space-y-2 pt-2">
            <Button className="w-full" onClick={handleImport}>
              Simpan
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
