import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaTable } from '@/components/features/armada/ArmadaTable';
import { DeleteArmadaModal } from '@/components/features/armada/DeleteArmadaModal';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useArmadas, useDeleteArmada, useImportArmada } from '@/hooks/useArmada';
import type { Armada } from '@/@types/armada.types';

export default function VehicleFleetPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedArmadaId, setSelectedArmadaId] = useState<string | number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useArmadas({ page, perPage, search });
  const deleteMutation = useDeleteArmada();
  const importMutation = useImportArmada();

  const handleAddClick = () => {
    if (slug) {
      router.push(`/dashboard/${slug}/data-kendaraan/create`);
    }
  };

  const handleEditClick = (armada: Armada) => {
    if (slug) {
      router.push(`/dashboard/${slug}/data-kendaraan/${armada.id}/edit`);
    }
  };

  const handleDetailClick = (armada: Armada) => {
    if (slug) {
      router.push(`/dashboard/${slug}/data-kendaraan/${armada.id}`);
    }
  };

  const handleDeleteClick = (armada: Armada) => {
    setSelectedArmadaId(armada.id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedArmadaId) return;

    try {
      await deleteMutation.mutateAsync(selectedArmadaId);
      toast.success('Data kendaraan berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedArmadaId(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data kendaraan');
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync(file);
      toast.success('Import data kendaraan berhasil');
      setIsImportOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengimport data kendaraan');
      throw error;
    }
  };

  const armadas = data?.data ?? [];
  const totalData = data?.meta.total ?? 0;
  const totalPages = data?.meta.lastPage ?? 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Kendaraan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola data kendaraan dengan mudah</p>
        </div>

        <ArmadaTable
          armadas={armadas}
          search={searchInput}
          onSearchChange={setSearchInput}
          page={page}
          perPage={perPage}
          totalData={totalData}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onAdd={handleAddClick}
          onImport={() => setIsImportOpen(true)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onDetail={handleDetailClick}
        />
      </div>

      <DeleteArmadaModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      <DataImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Data Kendaraan"
        description="Unggah file Excel untuk menambahkan data kendaraan secara massal."
        onImport={handleImport}
        isPending={importMutation.isPending}
        templateUrl="https://docs.google.com/spreadsheets/d/1cdvmtF4S7LrDJoyWmNDR9dd-CQz2OPj7B7EAbUwQSU4/edit?usp=sharing"
      />
    </DashboardLayout>
  );
}
