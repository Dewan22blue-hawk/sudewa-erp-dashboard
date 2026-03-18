import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TarifTable, Tarif } from '@/components/features/tarif/TarifTable';
import { TarifFormModal, TarifFormData } from '@/components/features/tarif/TarifFormModal';
import { DeleteTarifModal } from '@/components/features/tarif/DeleteTarifModal';
import { DUMMY_TARIFS, setDummyTarifs } from '@/components/features/tarif/tarif.data';
import { toast } from 'sonner';

export default function TarifPage() {
  // Data state
  const [tarifs, setTarifs] = useState<Tarif[]>(DUMMY_TARIFS);

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
    return tarifs.filter((tarif) => tarif.namaDealer.toLowerCase().includes(search.toLowerCase()) || tarif.provinsi.toLowerCase().includes(search.toLowerCase()) || tarif.tujuan.toLowerCase().includes(search.toLowerCase()));
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
      setTarifs((prev) => {
        const updated = prev.map((t) => (t.id === selectedTarif.id ? { ...t, ...data } : t));
        setDummyTarifs(updated);
        return updated;
      });
      toast.success('Data tarif berhasil diubah');
    } else {
      // Add
      setTarifs((prev) => {
        const newId = prev.length > 0 ? Math.max(...prev.map((t) => t.id)) + 1 : 1;
        const updated = [{ id: newId, ...data }, ...prev];
        setDummyTarifs(updated);
        return updated;
      });
      toast.success('Data tarif berhasil ditambahkan');
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedTarif) {
      setTarifs((prev) => {
        const updated = prev.filter((t) => t.id !== selectedTarif.id);
        setDummyTarifs(updated);
        return updated;
      });
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
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={filteredTarifs.length}
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
      <TarifFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveForm} initialData={selectedTarif} />

      <DeleteTarifModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </DashboardLayout>
  );
}
