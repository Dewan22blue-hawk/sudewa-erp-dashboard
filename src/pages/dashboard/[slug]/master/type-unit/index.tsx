import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTypeUnits, useDeleteTypeUnit, useImportTypeUnit } from '@/hooks/useTypeUnit';
import { TypeUnitTable } from '@/components/features/type-unit/TypeUnitTable';
import { DeleteTypeUnitDialog } from '@/components/features/type-unit/DeleteTypeUnitDialog';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import type { TypeUnit } from '@/@types/type-unit.types';
import { useCompany } from '@/contexts/CompanyContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TypeUnitPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const inStockFilter = router.query.in_stock === 'true';

  const { data, isLoading, isError, refetch } = useTypeUnits({ in_stock: inStockFilter });
  const filteredData = useMemo(() => {
    const term = search.toLowerCase();
    let result = data?.data || [];

    if (inStockFilter) {
      result = result.filter(
        (item) => item.availableStock !== null && item.availableStock !== undefined && item.availableStock > 0
      );
    }

    return result.filter((item) => [item.code, item.name, item.unitType, item.unitModel, item.brand?.name].filter(Boolean).some((value) => value!.toString().toLowerCase().includes(term)));
  }, [data?.data, search, inStockFilter]);

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
  const { companyId } = useCompany();
  const deleteTypeUnit = useDeleteTypeUnit();
  const importMutation = useImportTypeUnit(companyId ?? undefined);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);
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

  const handleImport = async (file: File) => {
    await importMutation.mutateAsync({ file });
    refetch();
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

  const handleTabChange = (value: string) => {
    const slug = router.query.slug as string;
    if (value === 'in_stock') {
      router.push({
        pathname: `/dashboard/${slug}/master/type-unit`,
        query: { in_stock: 'true' },
      });
    } else {
      router.push({
        pathname: `/dashboard/${slug}/master/type-unit`,
      });
    }
    setPage(1);
  };

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


        {/* TABS FILTER */}
        <Tabs value={inStockFilter ? 'in_stock' : 'all'} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-auto min-w-max items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            <TabsTrigger
              value="all"
              className="h-9 flex-shrink-0 rounded-lg px-4 text-sm font-semibold capitalize text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Semua Tipe Unit
            </TabsTrigger>
            <TabsTrigger
              value="in_stock"
              className="h-9 flex-shrink-0 rounded-lg px-4 text-sm font-semibold capitalize text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Stok Tersedia
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
            onImport={() => setOpenImport(true)}
          />
        </div>
      </div>

      <DeleteTypeUnitDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} isDeleting={deleteTypeUnit.isPending} />
      <DataImportModal
        open={openImport}
        onOpenChange={setOpenImport}
        title="Import Data Tipe Unit"
        description="Unggah file .xlsx untuk mengimport data tipe unit."
        onImport={handleImport}
        isPending={importMutation.isPending}
        templateUrl="https://docs.google.com/spreadsheets/d/1iR1WZMEO_G8x91noO9q4T8hUMzIAD8U18qrmPmode2I/edit?usp=sharing"
      />
    </DashboardLayout>
  );
}
