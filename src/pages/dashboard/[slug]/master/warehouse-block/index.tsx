import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { getWarehouseBlocks, createWarehouseBlock, updateWarehouseBlock, deleteWarehouseBlock, type WarehouseBlock } from '@/services/warehouseBlock.service';
import { WarehouseBlockTable } from '@/components/features/master/warehouse-block/WarehouseBlockTable';
import { WarehouseBlockForm } from '@/components/features/master/warehouse-block/WarehouseBlockForm';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import Head from 'next/head';

export default function WarehouseBlockPage() {
  const router = useRouter();
  const slug = router.query.slug as string;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<WarehouseBlock | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-blocks', page, perPage, debouncedSearch],
    queryFn: () => getWarehouseBlocks(page, perPage, debouncedSearch),
  });

  const createMutation = useMutation({
    mutationFn: createWarehouseBlock,
    onSuccess: () => {
      toast.success('Berhasil menambahkan blok gudang baru');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['warehouse-blocks'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menambahkan blok gudang');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateWarehouseBlock(id, data),
    onSuccess: () => {
      toast.success('Berhasil mengubah data blok gudang');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['warehouse-blocks'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal mengubah data blok gudang');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarehouseBlock,
    onSuccess: () => {
      toast.success('Berhasil menghapus data blok gudang');
      queryClient.invalidateQueries({ queryKey: ['warehouse-blocks'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus blok gudang');
    },
  });

  const handleAdd = () => {
    setSelectedBlock(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (block: WarehouseBlock) => {
    setSelectedBlock(block);
    setIsFormOpen(true);
  };

  const handleDelete = (block: WarehouseBlock) => {
    if (confirm(`Apakah Anda yakin ingin menghapus blok gudang ${block.name}?`)) {
      deleteMutation.mutate(block.id);
    }
  };

  const handleViewDetail = (block: WarehouseBlock) => {
    router.push(`/dashboard/${slug}/master/warehouse-block/${block.id}/detail`);
  };

  const handleSubmit = (values: any) => {
    if (selectedBlock) {
      updateMutation.mutate({ id: selectedBlock.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <>
      <Head>
        <title>Blok Gudang | Wajira</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          <PageHeader
            title="Data Blok Gudang"
            subtitle="Kelola master data blok gudang dan sub-bloknya"
          />

          <WarehouseBlockTable
            data={data?.data?.data || []}
            meta={data?.data ? {
              currentPage: data.data.current_page,
              lastPage: data.data.last_page,
              perPage: data.data.per_page,
              total: data.data.total,
            } : undefined}
            isLoading={isLoading}
            search={searchInput}
            page={page}
            perPage={perPage}
            onSearchChange={setSearchInput}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
          />
        </div>

        <WarehouseBlockForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          initialData={selectedBlock}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </DashboardLayout>
    </>
  );
}
