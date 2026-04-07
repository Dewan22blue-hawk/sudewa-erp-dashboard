import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteKasHarian } from '@/hooks/useKasHarian';
import type { KasHarian } from '@/@types/kas-harian.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KasHarian | null;
}

export default function DeleteKasHarianDialog({ open, onOpenChange, data }: Props) {
  const { mutateAsync: deleteKasHarian, isPending } = useDeleteKasHarian();

  const handleDelete = async () => {
    if (!data) return;

    try {
      await deleteKasHarian(data.id);
      toast.success('Transaksi kas harian berhasil dihapus');
      onOpenChange(false);
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Gagal menghapus transaksi kas harian';
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>Data transaksi {data?.code ?? ''} akan dihapus permanen dan tidak dapat dikembalikan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isPending}>
            {isPending ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
