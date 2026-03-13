import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DealerTable, Dealer } from '@/components/features/dealer/DealerTable';
import { DealerFormModal, DealerFormData } from '@/components/features/dealer/DealerFormModal';
import { DeleteDealerModal } from '@/components/features/dealer/DeleteDealerModal';
import { toast } from 'sonner';

// DUMMY DATA INITIALIZATION
const INITIAL_DEALERS: Dealer[] = [
    { id: 1, namaDealer: 'PT Jawara Jogja', alamat: 'Jalan Banguntapan no 25, sewon, bantul, yogyakarta', pic: 'John Doe', handphone: '089089089089' },
    { id: 2, namaDealer: 'CV Makmur Abadi', alamat: 'Jl. Magelang KM 5.5, Kutu Patran, Sinduadi', pic: 'Budi Santoso', handphone: '081234567890' },
    { id: 3, namaDealer: 'PT Lintas Samudera', alamat: 'Jl. Ringroad Utara No. 12, Depok, Sleman', pic: 'Siti Rahmawati', handphone: '085712345678' },
    { id: 4, namaDealer: 'UD Sumber Rejeki', alamat: 'Pasar Beringharjo Lt. 1 Blok B', pic: 'Ahmad Dahlan', handphone: '081398765432' },
    { id: 5, namaDealer: 'PT Teknologi Nusantara', alamat: 'Gedung Cyber, Lt 3, Jl. Kuningan Barat', pic: 'Kevin Wijaya', handphone: '087811223344' },
    { id: 6, namaDealer: 'CV Global Sinergi', alamat: 'Jl. Kaliurang KM 8.5, Sinduharjo, Ngaglik', pic: 'Andi Setiawan', handphone: '082188997766' },
    { id: 7, namaDealer: 'Koperasi Karyawan Maju', alamat: 'Jl. Jendral Sudirman No. 45, Kota Yogyakarta', pic: 'Dewi Lestari', handphone: '089566778899' },
];

export default function DealerPage() {
    // Data state
    const [dealers, setDealers] = useState<Dealer[]>(INITIAL_DEALERS);

    // Table state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);

    // Filter & Pagination logic
    const filteredDealers = useMemo(() => {
        return dealers.filter(dealer =>
            dealer.namaDealer.toLowerCase().includes(search.toLowerCase()) ||
            dealer.pic.toLowerCase().includes(search.toLowerCase()) ||
            dealer.handphone.includes(search)
        );
    }, [dealers, search]);

    const paginatedDealers = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredDealers.slice(startIndex, startIndex + perPage);
    }, [filteredDealers, page, perPage]);

    // Handlers
    const handleAddClick = () => {
        setSelectedDealer(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (dealer: Dealer) => {
        setSelectedDealer(dealer);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (dealer: Dealer) => {
        setSelectedDealer(dealer);
        setIsDeleteOpen(true);
    };

    const handleSaveForm = (data: DealerFormData) => {
        if (selectedDealer) {
            // Edit
            setDealers(dealers.map(d => d.id === selectedDealer.id ? { ...d, ...data } : d));
            toast.success('Data dealer berhasil diubah');
        } else {
            // Add
            const newId = Math.max(0, ...dealers.map(d => d.id)) + 1;
            setDealers([{ id: newId, ...data }, ...dealers]);
            toast.success('Data dealer berhasil ditambahkan');
        }
        setIsFormOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedDealer) {
            setDealers(dealers.filter(d => d.id !== selectedDealer.id));
            toast.success('Data dealer berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedDealer(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dealer</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola akun Dealer dengan mudah</p>
                </div>

                {/* Content */}
                <DealerTable
                    dealers={paginatedDealers}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    page={page}
                    perPage={perPage}
                    totalData={filteredDealers.length}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Modals */}
            <DealerFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveForm}
                initialData={selectedDealer}
            />

            <DeleteDealerModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </DashboardLayout>
    );
}
