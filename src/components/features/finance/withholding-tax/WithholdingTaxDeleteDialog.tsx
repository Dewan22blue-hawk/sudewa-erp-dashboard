import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteWithholdingTax } from '@/hooks/useWithholdingTax';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | null;
  withholdingNumber: string | null;
}

export default function WithholdingTaxDeleteDialog({ isOpen, onClose, itemId, withholdingNumber }: Props) {
  const { mutate: deleteItem, isPending } = useDeleteWithholdingTax();

  const handleDelete = () => {
    if (!itemId) return;

    deleteItem(itemId, {
      onSuccess: () => {
        toast.success(`Data Bukti Potong berhasil dihapus.`);
        onClose();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus data.';
        toast.error(message);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Data Ini?</DialogTitle>
          <DialogDescription>
            Apa anda yakin ingin menghapus data {withholdingNumber ? `dengan Nomor Bukpot ${withholdingNumber}` : 'ini'}? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
