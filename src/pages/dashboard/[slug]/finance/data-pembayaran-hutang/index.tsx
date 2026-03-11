import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PembayaranHutangTable from '@/components/features/pembayaran-hutang/PembayaranHutangTable';
import { usePembayaranHutang } from '@/hooks/usePembayaranHutang';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function DataPembayaranHutangPage() {
  const { data, loading, deletePembayaranHutang } = usePembayaranHutang();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!selectedId) return;
    const success = deletePembayaranHutang(selectedId);
    if (success) toast.success('Data berhasil dihapus');
    else toast.error('Gagal menghapus data');
    setSelectedId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Pembayaran Hutang</h1>
          <p className="text-sm text-gray-500">Kelola data pembayaran hutang</p>
        </div>

        {loading ? <div>Loading...</div> : <PembayaranHutangTable data={data} onDelete={(id) => setSelectedId(id)} />}
      </div>

      <AlertDialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pembayaran?</AlertDialogTitle>
            <AlertDialogDescription>Data pembayaran hutang akan dihapus dan tidak dapat dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
