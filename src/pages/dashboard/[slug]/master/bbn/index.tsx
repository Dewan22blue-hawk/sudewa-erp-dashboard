import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BBNTable } from '@/components/features/bbn/BBNTable';
import { DeleteBBNModal } from '@/components/features/bbn/DeleteBBNModal';
import { toast } from 'sonner';
import { useBBNs, useDeleteBBN } from '@/hooks/useBBN';
import type { BBN } from '@/@types/bbn.types';

export default function BBNPage() {
  const router = useRouter();
  const slug = router.query.slug as string;

  // Table state
  const [searchInput, setSearchInput] = useState('');  // immediate input value (for display)
  const [search, setSearch] = useState('');            // debounced value (sent to API)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Live search debounce — wait 400ms after user stops typing before firing API request
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: bbnData, isLoading } = useBBNs({ page, perPage, search });
  
  const deleteMutation = useDeleteBBN();

  // Modals state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBBN, setSelectedBBN] = useState<BBN | null>(null);

  // Handlers
  const handleAddClick = () => {
    router.push(`/dashboard/${slug}/master/bbn/create`);
  };

  const handleEditClick = (bbn: BBN) => {
    router.push(`/dashboard/${slug}/master/bbn/${bbn.id}/edit`);
  };

  const handleDeleteClick = (bbn: BBN) => {
    setSelectedBBN(bbn);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBBN) {
      try {
        await deleteMutation.mutateAsync(selectedBBN.id);
        toast.success('Data biaya berhasil dihapus');
        setIsDeleteOpen(false);
        setSelectedBBN(null);
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus data');
      }
    }
  };

  const bbnList = bbnData?.data || [];
  const totalBBNs = bbnData?.meta?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Biaya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data biaya dengan mudah</p>
        </div>

        {/* Content */}
        <BBNTable
          bbns={bbnList}
          search={searchInput}
          onSearchChange={(v) => setSearchInput(v)}
          isLoading={isLoading}
          page={page}
          perPage={perPage}
          totalData={totalBBNs}
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

      <DeleteBBNModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        isDeleting={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
