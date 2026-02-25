'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDeletePenerimaanUnit } from '@/hooks/usePenerimaanUnit';
import { toast } from 'sonner';

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
}

export default function DeletePenerimaanUnitDialog({ id, open, onClose }: Props) {
  const mutation = useDeletePenerimaanUnit();

  const handleDelete = async () => {
    await mutation.mutateAsync(id);
    toast.success('Data berhasil dihapus');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Hapus Data Ini?</DialogTitle>
          <DialogDescription>Apa anda yakin ingin menghapus data ini?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Batal
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDelete} disabled={mutation.isPending}>
            {mutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
