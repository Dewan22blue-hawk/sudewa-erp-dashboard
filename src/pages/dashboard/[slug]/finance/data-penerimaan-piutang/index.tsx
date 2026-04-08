import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PenerimaanPiutangTable from '@/components/features/penerimaan-piutang/PenerimaanPiutangTable';
import { useDeletePenerimaanPiutang, usePenerimaanPiutang } from '@/hooks/usePenerimaanPiutang';
import type { PenerimaanPiutang } from '@/@types/penerimaan-piutang.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function DataPenerimaanPiutangPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const [selectedItem, setSelectedItem] = useState<PenerimaanPiutang | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    const query = usePenerimaanPiutang({
        page: currentPage,
        perPage,
        search: debouncedSearch || undefined,
    });

    const deleteMutation = useDeletePenerimaanPiutang();

    const handleDelete = async () => {
        if (!selectedItem) return;

        try {
            await deleteMutation.mutateAsync(selectedItem.id);
            toast.success('Data penerimaan berhasil dihapus');
            setSelectedItem(null);
        } catch (error: any) {
            toast.error(error?.message ?? 'Gagal menghapus data');
        }
    };

    const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Gagal mengambil data penerimaan piutang' : null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Data Penerimaan Piutang</h1>
                    <p className="text-sm text-gray-500">Kelola data penerimaan piutang</p>
                </div>

                <PenerimaanPiutangTable
                    data={query.data?.data ?? []}
                    meta={query.data?.meta ?? null}
                    loading={query.isLoading || query.isFetching}
                    error={errorMessage}
                    search={search}
                    perPage={perPage}
                    currentPage={currentPage}
                    onSearchChange={setSearch}
                    onPerPageChange={(value) => {
                        setPerPage(value);
                        setCurrentPage(1);
                    }}
                    onPageChange={setCurrentPage}
                    onDelete={(item) => setSelectedItem(item)}
                    onRetry={() => query.refetch()}
                />
            </div>

            <AlertDialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Penerimaan?</AlertDialogTitle>
                        <AlertDialogDescription>Data penerimaan piutang akan dihapus dan tidak dapat dikembalikan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-orange-600 hover:bg-orange-700" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menghapus
                                </span>
                            ) : (
                                'Hapus'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
