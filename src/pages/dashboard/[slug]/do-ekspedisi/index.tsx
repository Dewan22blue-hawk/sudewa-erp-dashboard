import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DOEkspedisiTable } from '@/components/features/do-ekspedisi/DOEkspedisiTable';
import { DeleteDOEkspedisiModal } from '@/components/features/do-ekspedisi/DeleteDOEkspedisiModal';
import type { DoEkspedisi } from '@/@types/do-ekspedisi.types';
import { useDeleteDoEkspedisi, useDoEkspedisis } from '@/hooks/useDoEkspedisi';

export default function DOEkspedisiPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DoEkspedisi | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listQuery = useDoEkspedisis({
    page,
    perPage,
    search,
    order_by: 'created_at',
    order_sort: 'desc',
  });
  const deleteMutation = useDeleteDoEkspedisi();

  const handleDelete = (item: DoEkspedisi) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Data DO Ekspedisi berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data DO Ekspedisi');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900 md:text-[20px]">Delivery Order Ekspedisi</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data data delivery order ekspedisi dengan mudah</p>
        </div>

        <DOEkspedisiTable
          data={listQuery.data?.data ?? []}
          search={searchInput}
          page={page}
          perPage={perPage}
          totalData={listQuery.data?.meta.total ?? 0}
          totalPages={listQuery.data?.meta.lastPage ?? 1}
          isLoading={listQuery.isLoading}
          onSearchChange={setSearchInput}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          onAdd={() => slug && router.push(`/dashboard/${slug}/do-ekspedisi/create`)}
          onEdit={(item) => slug && router.push(`/dashboard/${slug}/do-ekspedisi/${item.id}/edit`)}
          onDetail={(item) => slug && router.push(`/dashboard/${slug}/do-ekspedisi/detail/${item.id}`)}
          onDelete={handleDelete}
          onPrint={(item) => {
            if (!slug) return;
            toast.info(`Buka detail untuk print DO ${item.doCode}`);
            router.push(`/dashboard/${slug}/do-ekspedisi/detail/${item.id}`);
          }}
        />
      </div>

      <DeleteDOEkspedisiModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
        itemName={selectedItem?.doCode}
      />
    </DashboardLayout>
  );
}
