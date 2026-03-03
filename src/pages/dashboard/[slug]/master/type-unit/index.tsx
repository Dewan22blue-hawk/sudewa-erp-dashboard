import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTypeUnits, useDeleteTypeUnit } from '@/hooks/useTypeUnit';
import { TypeUnitTable } from '@/components/features/type-unit/TypeUnitTable';
import { DeleteTypeUnitDialog } from '@/components/features/type-unit/DeleteTypeUnitDialog';
import type { TypeUnit } from '@/@types/type-unit.types';

export default function TypeUnitPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { data, isLoading, isError, refetch } = useTypeUnits();
  const filteredData = useMemo(() => {
    const term = search.toLowerCase();
    return (data?.data || []).filter((item) => [item.code, item.name, item.unitType, item.unitModel, item.brand?.name].filter(Boolean).some((value) => value!.toString().toLowerCase().includes(term)));
  }, [data?.data, search]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredData.slice(start, end);
  }, [filteredData, page, perPage]);

  const manualMeta = useMemo(
    () => ({
      currentPage: page,
      perPage,
      total: filteredData.length,
      lastPage: Math.max(1, Math.ceil(filteredData.length / perPage)),
    }),
    [filteredData.length, page, perPage],
  );

  useEffect(() => {
    if (page > manualMeta.lastPage) {
      setPage(manualMeta.lastPage);
    }
  }, [page, manualMeta.lastPage, setPage]);
  const deleteTypeUnit = useDeleteTypeUnit();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeUnitToDelete, setTypeUnitToDelete] = useState<TypeUnit | null>(null);

  const handleCreateClick = () => {
    const slug = router.query.slug as string;
    router.push(`/dashboard/${slug}/master/type-unit/create`);
  };

  const handleEditClick = (typeUnit: TypeUnit) => {
    const slug = router.query.slug as string;
    router.push(`/dashboard/${slug}/master/type-unit/${typeUnit.id}/edit`);
  };

  const handleDeleteClick = (typeUnit: TypeUnit) => {
    setTypeUnitToDelete(typeUnit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!typeUnitToDelete) return;

    try {
      await deleteTypeUnit.mutateAsync(typeUnitToDelete.id);
      setDeleteDialogOpen(false);
      setTypeUnitToDelete(null);
      toast.success('Data berhasil dihapus');
      refetch();
    } catch (error) {
      console.error('Failed to delete type unit:', error);
      toast.error('Gagal menghapus data tipe unit');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Tipe Unit</h1>
              <p className="text-sm text-muted-foreground">Kelola semua tipe unit</p>
            </div>
          </div>
          <Card className="rounded-xl p-6">
            <div className="text-center text-muted-foreground">Loading...</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Tipe Unit</h1>
              <p className="text-sm text-muted-foreground">Kelola semua tipe unit</p>
            </div>
          </div>
          <Card className="rounded-xl p-6">
            <div className="text-center text-destructive">Gagal memuat data</div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Tipe Unit</h1>
            <p className="text-sm text-muted-foreground">Kelola semua tipe unit</p>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="">
          <TypeUnitTable
            typeUnits={paginatedData}
            meta={manualMeta}
            search={search}
            page={page}
            perPage={perPage}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onAdd={handleCreateClick}
          />
        </div>
      </div>

      <DeleteTypeUnitDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} isDeleting={deleteTypeUnit.isPending} />
    </DashboardLayout>
  );
}
