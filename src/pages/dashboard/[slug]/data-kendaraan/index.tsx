import * as React from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { AssignVehicleDataDialog } from '@/components/features/vehicle-data/AssignVehicleDataDialog';
import { DeleteVehicleDataDialog } from '@/components/features/vehicle-data/DeleteVehicleDataDialog';
import { VehicleDataTable } from '@/components/features/vehicle-data/VehicleDataTable';
import { useCompany } from '@/contexts/CompanyContext';
import { useDealers } from '@/hooks/useDealer';
import {
  useDeleteVehicleData,
  useExportVehicleData,
  useImportVehicleData,
  useVehicleDataList,
} from '@/hooks/useVehicleData';
import type { VehicleData } from '@/@types/vehicle-data.types';
import { toast } from 'sonner';

const toDateQuery = (value?: Date) => {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateValue = (value?: string | string[]) => {
  if (!value || Array.isArray(value)) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default function VehicleDataPage() {
  const router = useRouter();
  const slug = String(router.query.slug || '');
  const { companyId } = useCompany();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [assignedIds, setAssignedIds] = React.useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = React.useState<VehicleData | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [dealerSearch, setDealerSearch] = React.useState('');

  const [filterDealerIdInput, setFilterDealerIdInput] = React.useState('');
  const [filterInvoiceDateInput, setFilterInvoiceDateInput] = React.useState<Date | undefined>(toDateValue(router.query.invoice_date));
  const [appliedDealerId, setAppliedDealerId] = React.useState(() => {
    const value = router.query.dealer_id;
    return typeof value === 'string' ? value : '';
  });
  const [appliedInvoiceDate, setAppliedInvoiceDate] = React.useState(() => {
    const value = router.query.invoice_date;
    return typeof value === 'string' ? value : '';
  });

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const vehicleQuery = useVehicleDataList({
    page,
    perPage,
    search,
    dealerId: appliedDealerId || undefined,
    invoiceDate: appliedInvoiceDate || undefined,
  });

  const dealersQuery = useDealers(companyId ? String(companyId) : null, {
    page: 1,
    perPage: 100,
    search: dealerSearch,
  });

  const importMutation = useImportVehicleData();
  const exportMutation = useExportVehicleData();
  const deleteMutation = useDeleteVehicleData();

  const items = React.useMemo(() => vehicleQuery.data?.data ?? [], [vehicleQuery.data?.data]);
  const totalData = vehicleQuery.data?.meta.total ?? 0;
  const backendAssignedIds = React.useMemo(
    () =>
      items
        .filter((item) => item.vehicleRegistration?.id != null)
        .map((item) => item.id),
    [items],
  );
  const mergedAssignedIds = React.useMemo(
    () => Array.from(new Set([...backendAssignedIds, ...assignedIds])),
    [assignedIds, backendAssignedIds],
  );
  const dealerOptions = (dealersQuery.data?.data ?? []).map((item) => ({
    value: String(item.id),
    label: item.namaDealer,
    subtitle: item.code || undefined,
  }));

  React.useEffect(() => {
    if (!router.isReady) return;

    const dealerId = typeof router.query.dealer_id === 'string' ? router.query.dealer_id : '';
    const invoiceDate = typeof router.query.invoice_date === 'string' ? router.query.invoice_date : '';

    setFilterDealerIdInput(dealerId);
    setAppliedDealerId(dealerId);
    setFilterInvoiceDateInput(toDateValue(invoiceDate));
    setAppliedInvoiceDate(invoiceDate);
  }, [router.isReady, router.query.dealer_id, router.query.invoice_date]);

  const syncQuery = (dealerId: string, invoiceDate: string) => {
    const nextQuery: Record<string, string> = {};
    if (dealerId) nextQuery.dealer_id = dealerId;
    if (invoiceDate) nextQuery.invoice_date = invoiceDate;
    router.replace({ pathname: router.pathname, query: { slug, ...nextQuery } }, undefined, { shallow: true });
  };

  const handleApplyFilters = () => {
    const nextDate = toDateQuery(filterInvoiceDateInput);
    setAppliedDealerId(filterDealerIdInput);
    setAppliedInvoiceDate(nextDate);
    setPage(1);
    syncQuery(filterDealerIdInput, nextDate);
  };

  const handleResetFilters = () => {
    setFilterDealerIdInput('');
    setFilterInvoiceDateInput(undefined);
    setAppliedDealerId('');
    setAppliedInvoiceDate('');
    setPage(1);
    router.replace({ pathname: router.pathname, query: { slug } }, undefined, { shallow: true });
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync(file);
      toast.success('Import data kendaraan berhasil');
    } catch (error: any) {
      toast.error(error.message || 'Import data kendaraan gagal');
      throw error;
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success('Export data kendaraan berhasil');
    } catch (error: any) {
      toast.error(error.message || 'Export data kendaraan gagal');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Data kendaraan berhasil dihapus');
      setDeleteTarget(null);
      setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id));
      setAssignedIds((current) => current.filter((id) => id !== deleteTarget.id));
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data kendaraan');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Data Kendaraan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data kendaraan dengan mudah.</p>
        </div>

        <VehicleDataTable
          items={items}
          isLoading={vehicleQuery.isLoading}
          search={searchInput}
          onSearchChange={setSearchInput}
          page={page}
          perPage={perPage}
          totalData={totalData}
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
          selectedIds={selectedIds}
          assignedIds={mergedAssignedIds}
          onSelectedIdsChange={setSelectedIds}
          onAdd={() => router.push(`/dashboard/${slug}/data-kendaraan/create`)}
          onImport={() => setImportOpen(true)}
          onExport={handleExport}
          onAssign={() => setAssignOpen(true)}
          onDetail={(item) => router.push(`/dashboard/${slug}/data-kendaraan/${item.id}`)}
          onEdit={(item) => router.push(`/dashboard/${slug}/data-kendaraan/${item.id}/edit`)}
          onDelete={(item) => setDeleteTarget(item)}
          isExporting={exportMutation.isPending}
          filterDealerId={filterDealerIdInput}
          onFilterDealerIdChange={setFilterDealerIdInput}
          dealerOptions={dealerOptions}
          onDealerSearchChange={setDealerSearch}
          filterInvoiceDate={filterInvoiceDateInput}
          onFilterInvoiceDateChange={setFilterInvoiceDateInput}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      </div>

      <DataImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Data Kendaraan"
        description="Unggah file Excel untuk menambahkan data kendaraan secara massal."
        onImport={handleImport}
        isPending={importMutation.isPending}
      />

      <AssignVehicleDataDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        initialVehicleIds={selectedIds.filter((id) => !mergedAssignedIds.includes(id))}
        onAssigned={(newAssignedIds) => {
          setAssignedIds((current) => Array.from(new Set([...current, ...newAssignedIds])));
          setSelectedIds((current) => Array.from(new Set([...current, ...newAssignedIds])));
        }}
      />

      <DeleteVehicleDataDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        itemName={deleteTarget?.invoiceNumber || deleteTarget?.stnkName}
      />
    </DashboardLayout>
  );
}
