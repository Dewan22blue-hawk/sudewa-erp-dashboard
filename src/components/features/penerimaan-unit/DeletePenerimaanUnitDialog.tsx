'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useDeletePenerimaanUnit } from '@/hooks/usePenerimaanUnit';

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
}

export default function DeletePenerimaanUnitDialog({ id, open, onClose }: Props) {
  const deleteMutation = useDeletePenerimaanUnit();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Penerimaan unit berhasil dihapus');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus penerimaan unit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Hapus Data Ini?</DialogTitle>
          <DialogDescription>Apa anda yakin ingin menghapus data ini?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={deleteMutation.isPending}>
            Batal
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
