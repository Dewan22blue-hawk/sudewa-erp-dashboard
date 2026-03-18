import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DealerTable, Dealer } from '@/components/features/dealer/DealerTable';
import { DealerFormModal, DealerFormData } from '@/components/features/dealer/DealerFormModal';
import { DeleteDealerModal } from '@/components/features/dealer/DeleteDealerModal';
import { DUMMY_DEALERS, setDummyDealers } from '@/components/features/dealer/dealer.data';
import { toast } from 'sonner';

export default function DealerPage() {
  // Data state
  const [dealers, setDealers] = useState<Dealer[]>(DUMMY_DEALERS);

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
    return dealers.filter((dealer) => dealer.namaDealer.toLowerCase().includes(search.toLowerCase()) || dealer.pic.toLowerCase().includes(search.toLowerCase()) || dealer.handphone.includes(search));
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
      setDealers((prev) => {
        const updated = prev.map((d) => (d.id === selectedDealer.id ? { ...d, ...data } : d));
        setDummyDealers(updated);
        return updated;
      });
      toast.success('Data dealer berhasil diubah');
    } else {
      // Add
      setDealers((prev) => {
        const newId = Math.max(0, ...prev.map((d) => d.id)) + 1;
        const updated = [{ id: newId, ...data }, ...prev];
        setDummyDealers(updated);
        return updated;
      });
      toast.success('Data dealer berhasil ditambahkan');
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedDealer) {
      setDealers((prev) => {
        const updated = prev.filter((d) => d.id !== selectedDealer.id);
        setDummyDealers(updated);
        return updated;
      });
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
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={filteredDealers.length}
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
      <DealerFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveForm} initialData={selectedDealer} />

      <DeleteDealerModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </DashboardLayout>
  );
}
