import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiTable } from '@/components/features/do-ekspedisi/DOEkspedisiTable';
import { DeleteDOEkspedisiModal } from '@/components/features/do-ekspedisi/DeleteDOEkspedisiModal';
import { CreateDOEkspedisiModal } from '@/components/features/do-ekspedisi/CreateDOEkspedisiModal';
import { EditDOEkspedisiModal } from '@/components/features/do-ekspedisi/EditDOEkspedisiModal';
import { DOEkspedisi, DUMMY_DO_EKSPEDISI, setDummyDOs } from '@/components/features/do-ekspedisi/do-ekspedisi.data';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

export default function DOEkspedisiPage() {
    const router = useRouter();
    const { slug } = router.query;

    const [dos, setDos] = useState<DOEkspedisi[]>(DUMMY_DO_EKSPEDISI);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDO, setSelectedDO] = useState<DOEkspedisi | null>(null);

    const filteredDOs = useMemo(() => {
        return dos.filter(item =>
            item.kodeDO.toLowerCase().includes(search.toLowerCase()) ||
            item.noPolisi.toLowerCase().includes(search.toLowerCase()) ||
            item.driver.toLowerCase().includes(search.toLowerCase())
        );
    }, [dos, search]);

    const paginatedDOs = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredDOs.slice(startIndex, startIndex + perPage);
    }, [filteredDOs, page, perPage]);

    const handleAddClick = () => {
        setIsAddOpen(true);
    };

    const handleEditClick = (item: DOEkspedisi) => {
        setSelectedDO(item);
        setIsEditOpen(true);
    };

    const handleDetailClick = (item: DOEkspedisi) => {
        if (slug) {
            router.push(`/dashboard/${slug}/do-ekspedisi/detail/${item.id}`);
        }
    };

    const handleDeleteClick = (item: DOEkspedisi) => {
        setSelectedDO(item);
        setIsDeleteOpen(true);
    };

    const handlePrintClick = (item: DOEkspedisi) => {
        toast.success(`Mencetak riwayat untuk DO: ${item.kodeDO}`);
    };

    const handleConfirmDelete = () => {
        if (selectedDO) {
            const updated = dos.filter(a => a.id !== selectedDO.id);
            setDos(updated);
            setDummyDOs(updated);
            toast.success('Data DO berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedDO(null);
        }
    };

    const handleRefreshList = () => {
        setDos([...DUMMY_DO_EKSPEDISI]); // Refresh list from dummy data source
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Data Operasional Ekspedisi</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data data operasional ekspedisi dengan mudah</p>
                </div>

                <DOEkspedisiTable
                    data={paginatedDOs}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    page={page}
                    perPage={perPage}
                    totalData={filteredDOs.length}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDetail={handleDetailClick}
                    onDelete={handleDeleteClick}
                    onPrint={handlePrintClick}
                />
            </div>

            <DeleteDOEkspedisiModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />

            <CreateDOEkspedisiModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={handleRefreshList}
            />

            <EditDOEkspedisiModal
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); setSelectedDO(null); }}
                initialData={selectedDO}
                onSuccess={handleRefreshList}
            />
        </DashboardLayout>
    );
}
