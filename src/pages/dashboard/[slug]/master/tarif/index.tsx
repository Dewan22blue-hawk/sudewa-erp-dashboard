import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TarifTable, Tarif } from '@/components/features/tarif/TarifTable';
import { TarifFormModal, TarifFormData } from '@/components/features/tarif/TarifFormModal';
import { DeleteTarifModal } from '@/components/features/tarif/DeleteTarifModal';
import { toast } from 'sonner';

// DUMMY DATA INITIALIZATION
const INITIAL_TARIFS: Tarif[] = [
    { id: 1, namaDealer: "CV Honda Jaya", provinsi: "Yogyakarta", tujuan: "Semarang", jarak: "100 km", day: 1, invCdd: 450000, invFuso: 350000, ujCdd: 500000, ujFuso: 350000 },
    { id: 2, namaDealer: "PT Suzuki Makmur", provinsi: "Jawa Tengah", tujuan: "Solo", jarak: "60 km", day: 1, invCdd: 300000, invFuso: 250000, ujCdd: 350000, ujFuso: 250000 },
    { id: 3, namaDealer: "Yamaha Mataram", provinsi: "Jawa Timur", tujuan: "Surabaya", jarak: "350 km", day: 2, invCdd: 1200000, invFuso: 950000, ujCdd: 1500000, ujFuso: 1000000 },
    { id: 4, namaDealer: "Kawasaki Abadi", provinsi: "DKI Jakarta", tujuan: "Jakarta Selatan", jarak: "550 km", day: 3, invCdd: 2500000, invFuso: 1800000, ujCdd: 2800000, ujFuso: 2000000 },
    { id: 5, namaDealer: "Toyota Nasmoco", provinsi: "Jawa Barat", tujuan: "Bandung", jarak: "450 km", day: 2, invCdd: 1800000, invFuso: 1400000, ujCdd: 2000000, ujFuso: 1500000 },
    { id: 6, namaDealer: "Daihatsu Mandiri", provinsi: "Banten", tujuan: "Tangerang", jarak: "580 km", day: 3, invCdd: 2600000, invFuso: 1900000, ujCdd: 2900000, ujFuso: 2100000 },
    { id: 7, namaDealer: "Mitsubishi Motors", provinsi: "DI Yogyakarta", tujuan: "Gunung Kidul", jarak: "45 km", day: 1, invCdd: 250000, invFuso: 200000, ujCdd: 300000, ujFuso: 200000 },
];

export default function TarifPage() {
    // Data state
    const [tarifs, setTarifs] = useState<Tarif[]>(INITIAL_TARIFS);

    // Table state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTarif, setSelectedTarif] = useState<Tarif | null>(null);

    // Filter & Pagination logic
    const filteredTarifs = useMemo(() => {
        return tarifs.filter(tarif =>
            tarif.namaDealer.toLowerCase().includes(search.toLowerCase()) ||
            tarif.provinsi.toLowerCase().includes(search.toLowerCase()) ||
            tarif.tujuan.toLowerCase().includes(search.toLowerCase())
        );
    }, [tarifs, search]);

    const paginatedTarifs = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredTarifs.slice(startIndex, startIndex + perPage);
    }, [filteredTarifs, page, perPage]);

    // Handlers
    const handleAddClick = () => {
        setSelectedTarif(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (tarif: Tarif) => {
        setSelectedTarif(tarif);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (tarif: Tarif) => {
        setSelectedTarif(tarif);
        setIsDeleteOpen(true);
    };

    const handleSaveForm = (data: TarifFormData) => {
        if (selectedTarif) {
            // Edit
            setTarifs(tarifs.map(t => t.id === selectedTarif.id ? { ...t, ...data } : t));
            toast.success('Data tarif berhasil diubah');
        } else {
            // Add
            const newId = tarifs.length > 0 ? Math.max(...tarifs.map(t => t.id)) + 1 : 1;
            setTarifs([{ id: newId, ...data }, ...tarifs]);
            toast.success('Data tarif berhasil ditambahkan');
        }
        setIsFormOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedTarif) {
            setTarifs(tarifs.filter(t => t.id !== selectedTarif.id));
            toast.success('Data tarif berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedTarif(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Tarif</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data tarif dengan mudah</p>
                </div>

                {/* Content */}
                <TarifTable
                    tarifs={paginatedTarifs}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    page={page}
                    perPage={perPage}
                    totalData={filteredTarifs.length}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Modals */}
            <TarifFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveForm}
                initialData={selectedTarif}
            />

            <DeleteTarifModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </DashboardLayout>
    );
}
