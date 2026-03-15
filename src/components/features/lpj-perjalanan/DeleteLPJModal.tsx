import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteLPJModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteLPJModal({ isOpen, onClose, onConfirm }: DeleteLPJModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle className="text-xl">Hapus Data LPJ?</DialogTitle>
          <DialogDescription className="text-base pt-2">Apa anda yakin ingin menghapus data LPJ ini?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={onConfirm}>
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
