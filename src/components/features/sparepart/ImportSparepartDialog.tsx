'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useImportSparepart } from '@/hooks/useSparepart';
import { SPAREPART_EXPORT_PATH } from '@/services/sparepart.service';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { Download, Upload } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function ImportSparepartDialog({ open, onOpenChange, companyId }: Props) {
  const mutation = useImportSparepart(companyId);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

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

  const handleDownloadTemplate = () => {
    if (typeof window === 'undefined') return;
    window.open(`${apiClient.defaults.baseURL}${SPAREPART_EXPORT_PATH}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>Unggah file import sparepart atau unduh template terlebih dahulu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button type="button" variant="outline" className="w-full" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Template Export
          </Button>

          <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100">
            <Upload className="mx-auto mb-2 h-5 w-5" />
            <span className="block font-medium">{file ? file.name : 'Pilih file .csv atau .xlsx'}</span>
            <span className="mt-1 block text-xs text-slate-500">Klik area ini untuk memilih file import</span>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" />
          </label>

          <div className="space-y-2 pt-2">
            <Button className="w-full" onClick={handleImport} disabled={!file || mutation.isPending}>
              {mutation.isPending ? 'Mengimpor...' : 'Import'}
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
