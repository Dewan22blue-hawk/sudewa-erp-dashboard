import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaTable } from '@/components/features/armada/ArmadaTable';
import { DeleteArmadaModal } from '@/components/features/armada/DeleteArmadaModal';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useArmadas, useDeleteArmada } from '@/hooks/useArmada';

export default function ArmadaPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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

  const handleAddClick = () => {
    if (slug) {
      router.push(`/dashboard/${slug}/master/armada/create`);
    }
  };

  const handleEditClick = (armada: { id: string | number }) => {
    if (slug) {
      router.push(`/dashboard/${slug}/master/armada/edit/${armada.id}`);
    }
  };

  const handleDeleteClick = (armada: { id: string | number }) => {
    setSelectedArmadaId(armada.id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedArmadaId) return;

    try {
      await deleteMutation.mutateAsync(selectedArmadaId);
      toast.success('Data armada berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedArmadaId(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data armada');
    }
  };

  const armadas = data?.data ?? [];
  const totalData = data?.meta.total ?? 0;
  const totalPages = data?.meta.lastPage ?? 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Armada</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola data armada dengan mudah</p>
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
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <DeleteArmadaModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
