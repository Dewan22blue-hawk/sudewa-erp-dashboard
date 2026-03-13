import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaTable } from '@/components/features/armada/ArmadaTable';
import { DeleteArmadaModal } from '@/components/features/armada/DeleteArmadaModal';
import { Armada, DUMMY_ARMADAS, setDummyArmadas } from '@/components/features/armada/armada.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

export default function ArmadaPage() {
    const router = useRouter();
    const { slug } = router.query;

    // Use current global state (DUMMY_ARMADAS) to render records
    // This allows records to persist when navigating back and forth in the client.
    const [armadas, setArmadas] = useState<Armada[]>(DUMMY_ARMADAS);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedArmada, setSelectedArmada] = useState<Armada | null>(null);

    const filteredArmadas = useMemo(() => {
        return armadas.filter(armada =>
            armada.noPolisi.toLowerCase().includes(search.toLowerCase()) ||
            armada.noMesin.toLowerCase().includes(search.toLowerCase()) ||
            armada.noRangka.toLowerCase().includes(search.toLowerCase())
        );
    }, [armadas, search]);

    const paginatedArmadas = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredArmadas.slice(startIndex, startIndex + perPage);
    }, [filteredArmadas, page, perPage]);

    const handleAddClick = () => {
        if (slug) {
            router.push(`/dashboard/${slug}/master/armada/create`);
        }
    };

    const handleEditClick = (armada: Armada) => {
        if (slug) {
            router.push(`/dashboard/${slug}/master/armada/edit/${armada.id}`);
        }
    };

    const handleDeleteClick = (armada: Armada) => {
        setSelectedArmada(armada);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedArmada) {
            const updated = armadas.filter(a => a.id !== selectedArmada.id);
            setArmadas(updated);
            setDummyArmadas(updated); // Update the global module state as well
            toast.success('Data armada berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedArmada(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Armada</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data armada dengan mudah</p>
                </div>

                <ArmadaTable
                    armadas={paginatedArmadas}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    page={page}
                    perPage={perPage}
                    totalData={filteredArmadas.length}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            <DeleteArmadaModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </DashboardLayout>
    );
}
