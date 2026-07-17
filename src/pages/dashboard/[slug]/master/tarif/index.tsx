import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TarifTable } from '@/components/features/tarif/TarifTable';
import { DeleteTarifModal } from '@/components/features/tarif/DeleteTarifModal';
import { toast } from 'sonner';
import { useTarifs, useDeleteTarif } from '@/hooks/useTarif';
import type { Tarif } from '@/@types/tarif.types';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function TarifPage() {
    const router = useRouter();
    const slug = router.query.slug as string;

    const { hasPermission } = usePermissionGuard();
    const canCreate = hasPermission('master-data:create');
    const canEdit = hasPermission('master-data:edit');
    const canDelete = hasPermission('master-data:delete');

    // Table state
    const [searchInput, setSearchInput] = useState('');   // immediate input
    const [search, setSearch] = useState('');              // debounced
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    // Live search debounce — 400ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: tarifData, isLoading } = useTarifs({ page, perPage, search });
    const deleteMutation = useDeleteTarif();

    // Modals state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);

    // Handlers
    const handleAddClick = () => {
        if (!canCreate) return;
        router.push(`/dashboard/${slug}/master/tarif/create`);
    };

    const handleEditClick = (tarif: Tarif) => {
        if (!canEdit) return;
        router.push(`/dashboard/${slug}/master/tarif/${tarif.id}/edit`);
    };

    const handleDeleteClick = (tarif: Tarif) => {
        if (!canDelete) return;
        setSelectedTarif(tarif);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!canDelete) return;
        if (!selectedTarif) return;
        try {
            await deleteMutation.mutateAsync(selectedTarif.id);
            toast.success('Data tarif berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedTarif(null);
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus data tarif');
        }
    };

    const tarifList = tarifData?.data || [];
    const totalTarifs = tarifData?.meta?.total || 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Tarif</h1>
                        <p className="text-sm text-muted-foreground">Kelola data tarif dengan mudah</p>
                    </div>
                </div>

                {/* Content */}
                <TarifTable
                    tarifs={tarifList}
                    search={searchInput}
                    onSearchChange={(v) => setSearchInput(v)}
                    isLoading={isLoading}
                    page={page}
                    perPage={perPage}
                    totalData={totalTarifs}
                    onPageChange={setPage}
                    onPerPageChange={(v) => {
                        setPerPage(v);
                        setPage(1);
                    }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </div>

            <DeleteTarifModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />
        </DashboardLayout>
    );
}
