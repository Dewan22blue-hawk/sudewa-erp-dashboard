import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteVehicleDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  itemName?: string;
}

export function DeleteVehicleDataDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  itemName,
}: DeleteVehicleDataDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Hapus Data Kendaraan?</DialogTitle>
          <DialogDescription>
            {itemName ? `Data ${itemName} akan dihapus permanen.` : 'Data kendaraan ini akan dihapus permanen.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
