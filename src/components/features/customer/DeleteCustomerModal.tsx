import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteCustomerModal({ open, onOpenChange, customerName, onConfirm, isDeleting = false }: DeleteCustomerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl border-0 bg-white p-0 shadow-2xl sm:max-w-[400px]">
        <div className="px-6 py-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[18px] font-semibold text-[#171717]">Hapus Data Customer</DialogTitle>
            <DialogDescription className="text-[15px] leading-6 text-[#71717A]">
              {customerName ? `Apakah anda yakin ingin menghapus customer ${customerName}?` : 'Apakah anda yakin ingin menghapus data customer ini?'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3">
            <Button className="h-11 rounded-xl bg-[#DC2626] text-[15px] font-medium text-white hover:bg-[#B91C1C]" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-xl border-[#D4D4D8] text-[15px] text-[#171717]" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
