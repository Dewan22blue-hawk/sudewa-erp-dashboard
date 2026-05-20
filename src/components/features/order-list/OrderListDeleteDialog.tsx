import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrderListDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  itemName?: string;
}

export function OrderListDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  itemName,
}: OrderListDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Order List</AlertDialogTitle>
          <AlertDialogDescription>
            {itemName ? `Data ${itemName} akan dihapus dari daftar order list.` : 'Data ini akan dihapus dari daftar order list.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="rounded-xl bg-red-600 hover:bg-red-700">
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
