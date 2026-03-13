import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DriverTable, Driver } from '@/components/features/driver/DriverTable';
import { DriverFormModal, DriverFormData } from '@/components/features/driver/DriverFormModal';
import { DeleteDriverModal } from '@/components/features/driver/DeleteDriverModal';
import { toast } from 'sonner';

// DUMMY DATA INITIALIZATION
const INITIAL_DRIVERS: Driver[] = [
    {
        id: 1,
        namaDriver: "Ella Young Widjayanto Nugraha",
        alamat: "Jl. Raya Kalimalang No, Rt 000, Rw 000, Duren Sawit, Duren Sawit, Kota Adm. Jakarta Timur, DKI Jakarta 00000",
        handphone: "08xx xxxx xxxx",
        ktp: "00000000220202020",
        sim: "B1"
    },
    {
        id: 2,
        namaDriver: "Budi Santoso",
        alamat: "Jl. Diponegoro No 10, Gowongan, Jetis, Kota Yogyakarta, DIY 55233",
        handphone: "0812 3456 7890",
        ktp: "3404000100020003",
        sim: "A"
    },
    {
        id: 3,
        namaDriver: "Ahmad Fauzi",
        alamat: "Jl. Magelang KM 5.5, Kutu Patran, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284",
        handphone: "0857 1122 3344",
        ktp: "3404000200030004",
        sim: "B2"
    },
    {
        id: 4,
        namaDriver: "Siti Rahmawati",
        alamat: "Jl. Laksda Adisucipto No 15, Ambarukmo, Caturtunggal, Depok, Sleman, DIY 55281",
        handphone: "0878 9988 5544",
        ktp: "3404000300040005",
        sim: "C"
    },
    {
        id: 5,
        namaDriver: "Dewi Kartika",
        alamat: "Jl. Ringroad Utara, Jombor Kidul, Sinduadi, Mlati, Kabupaten Sleman, DIY 55284",
        handphone: "0819 6633 2211",
        ktp: "3404000400050006",
        sim: "B1"
    },
];

export default function DriverPage() {
    // Data state
    const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);

    // Table state
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // Filter & Pagination logic
    const filteredDrivers = useMemo(() => {
        return drivers.filter(driver =>
            driver.namaDriver.toLowerCase().includes(search.toLowerCase()) ||
            driver.ktp.includes(search) ||
            driver.sim.toLowerCase().includes(search.toLowerCase()) ||
            driver.handphone.includes(search)
        );
    }, [drivers, search]);

    const paginatedDrivers = useMemo(() => {
        const startIndex = (page - 1) * perPage;
        return filteredDrivers.slice(startIndex, startIndex + perPage);
    }, [filteredDrivers, page, perPage]);

    // Handlers
    const handleAddClick = () => {
        setSelectedDriver(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDeleteOpen(true);
    };

    const handleSaveForm = (data: DriverFormData) => {
        if (selectedDriver) {
            // Edit
            setDrivers(drivers.map(d => d.id === selectedDriver.id ? { ...d, ...data } : d));
            toast.success('Data driver berhasil diubah');
        } else {
            // Add
            const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
            setDrivers([{ id: newId, ...data }, ...drivers]);
            toast.success('Data driver berhasil ditambahkan');
        }
        setIsFormOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedDriver) {
            setDrivers(drivers.filter(d => d.id !== selectedDriver.id));
            toast.success('Data driver berhasil dihapus');
            setIsDeleteOpen(false);
            setSelectedDriver(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Driver</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola data driver dengan mudah</p>
                </div>

                {/* Content */}
                <DriverTable
                    drivers={paginatedDrivers}
                    search={search}
                    onSearchChange={(v) => { setSearch(v); setPage(1); }}
                    page={page}
                    perPage={perPage}
                    totalData={filteredDrivers.length}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                    onAdd={handleAddClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Modals */}
            <DriverFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveForm}
                initialData={selectedDriver}
            />

            <DeleteDriverModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
            />
        </DashboardLayout>
    );
}
