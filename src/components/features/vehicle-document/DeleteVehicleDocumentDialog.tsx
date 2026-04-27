import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  code?: string;
}

export function DeleteVehicleDocumentDialog({ open, onOpenChange, onConfirm, isDeleting = false, code }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Hapus Data Penerimaan?</DialogTitle>
          <DialogDescription>{code ? `Data ${code} akan dihapus permanen.` : 'Data penerimaan akan dihapus permanen.'}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Menghapus...' : 'Hapus'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
