import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1160px] rounded-[34px] border-0 p-0 shadow-2xl">
        <div className="rounded-[34px] border border-slate-200 bg-white px-20 py-20">
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-6xl font-semibold tracking-tight text-slate-950">Hapus Data Ini?</h2>
              <p className="text-3xl leading-relaxed text-slate-500">Apa anda yakin ingin menghapus data ini?</p>
            </div>

            <div className="flex justify-end gap-5 pt-4">
              <Button type="button" variant="outline" className="h-[86px] rounded-[22px] border-slate-300 px-16 text-4xl" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="button" className="h-[86px] rounded-[22px] bg-[#ea2626] px-16 text-4xl hover:bg-[#c81f1f]" onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
