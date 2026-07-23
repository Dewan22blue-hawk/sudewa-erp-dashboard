import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierName?: string | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteSupplierModal({ open, onOpenChange, supplierName, onConfirm, isDeleting = false }: DeleteSupplierModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl border-0 bg-white p-0 shadow-2xl sm:max-w-[400px]">
        <div className="px-6 py-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[18px] font-semibold text-[#171717]">Hapus Data Supplier</DialogTitle>
            <DialogDescription className="text-[15px] leading-6 text-[#71717A]">
              {supplierName ? `Apakah anda yakin ingin menghapus supplier ${supplierName}?` : 'Apakah anda yakin ingin menghapus data supplier ini?'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3">
            <Button className="h-11 rounded-md bg-[#DC2626] text-[15px] font-medium text-white hover:bg-[#B91C1C]" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-md border-[#D4D4D8] text-[15px] text-[#171717]" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
