import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DriverTable, Driver } from '@/components/features/driver/DriverTable';
import { DriverFormModal, DriverFormData } from '@/components/features/driver/DriverFormModal';
import { DeleteDriverModal } from '@/components/features/driver/DeleteDriverModal';
import { DUMMY_DRIVERS, setDummyDrivers } from '@/components/features/driver/driver.data';
import { toast } from 'sonner';

export default function DriverPage() {
  // Data state
  const [drivers, setDrivers] = useState<Driver[]>(DUMMY_DRIVERS);

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
    return drivers.filter((driver) => driver.namaDriver.toLowerCase().includes(search.toLowerCase()) || driver.ktp.includes(search) || driver.sim.toLowerCase().includes(search.toLowerCase()) || driver.handphone.includes(search));
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
      setDrivers((prev) => {
        const updated = prev.map((d) => (d.id === selectedDriver.id ? { ...d, ...data } : d));
        setDummyDrivers(updated);
        return updated;
      });
      toast.success('Data driver berhasil diubah');
    } else {
      // Add
      setDrivers((prev) => {
        const newId = prev.length > 0 ? Math.max(...prev.map((d) => d.id)) + 1 : 1;
        const updated = [{ id: newId, ...data }, ...prev];
        setDummyDrivers(updated);
        return updated;
      });
      toast.success('Data driver berhasil ditambahkan');
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedDriver) {
      setDrivers((prev) => {
        const updated = prev.filter((d) => d.id !== selectedDriver.id);
        setDummyDrivers(updated);
        return updated;
      });
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
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={filteredDrivers.length}
          onPageChange={setPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          onAdd={handleAddClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Modals */}
      <DriverFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveForm} initialData={selectedDriver} />

      <DeleteDriverModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </DashboardLayout>
  );
}
