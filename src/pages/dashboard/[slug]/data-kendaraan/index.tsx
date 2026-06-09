import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArmadaTable } from '@/components/features/armada/ArmadaTable';
import { DeleteArmadaModal } from '@/components/features/armada/DeleteArmadaModal';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useArmadas, useDeleteArmada, useImportArmada } from '@/hooks/useArmada';
import type { Armada } from '@/@types/armada.types';
import { useCompany } from '@/contexts/CompanyContext';
import { VehicleDataTable } from '@/components/features/vehicle-data/VehicleDataTable';
import { DeleteVehicleDataDialog } from '@/components/features/vehicle-data/DeleteVehicleDataDialog';
import { AssignVehicleDataDialog } from '@/components/features/vehicle-data/AssignVehicleDataDialog';
import {
  useVehicleDataList,
  useDeleteVehicleData,
  useImportVehicleData,
  useExportVehicleData,
} from '@/hooks/useVehicleData';
import { useDealers } from '@/hooks/useDealer';
import type { VehicleData } from '@/@types/vehicle-data.types';

export default function VehicleFleetPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { companyId } = useCompany();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedArmadaId, setSelectedArmadaId] = useState<string | number | null>(null);

  // Vehicle data states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterDealerId, setFilterDealerId] = useState('');
  const [dealerSearch, setDealerSearch] = useState('');
  const [filterInvoiceDate, setFilterInvoiceDate] = useState<Date>();
  const [appliedDealerId, setAppliedDealerId] = useState('');
  const [appliedInvoiceDate, setAppliedInvoiceDate] = useState<Date>();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteVehicleOpen, setIsDeleteVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  const formatDateValue = (date?: Date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Standard Armada Hooks
  const { data: armadaData, isLoading: isArmadaLoading } = useArmadas({ page, perPage, search, enabled: companyId !== '3' });
  const deleteMutation = useDeleteArmada();
  const importMutation = useImportArmada();

  // Vehicle Data Hooks (enabled only when companyId is '3')
  const dealersQuery = useDealers(companyId, { page: 1, perPage: 100, search: dealerSearch }, { enabled: companyId === '3' });
  const dealerOptions = React.useMemo(() => {
    return (dealersQuery.data?.data ?? []).map((dealer) => ({
      value: String(dealer.id),
      label: dealer.namaDealer,
      subtitle: dealer.code || undefined,
    }));
  }, [dealersQuery.data?.data]);

  const vehicleParams = {
    page,
    perPage,
    search,
    dealerId: appliedDealerId || undefined,
    invoiceDate: formatDateValue(appliedInvoiceDate) || undefined,
  };
  const { data: vehicleDataResponse, isLoading: isVehicleLoading } = useVehicleDataList(vehicleParams, { enabled: companyId === '3' });

  const deleteVehicleMutation = useDeleteVehicleData();
  const importVehicleMutation = useImportVehicleData();
  const exportVehicleMutation = useExportVehicleData();

  const assignedIds = React.useMemo(() => {
    return (vehicleDataResponse?.data ?? [])
      .filter((item) => !!item.vehicleRegistration)
      .map((item) => item.id);
  }, [vehicleDataResponse?.data]);

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

  // Vehicle data action handlers
  const handleApplyFilters = () => {
    setAppliedDealerId(filterDealerId);
    setAppliedInvoiceDate(filterInvoiceDate);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilterDealerId('');
    setFilterInvoiceDate(undefined);
    setAppliedDealerId('');
    setAppliedInvoiceDate(undefined);
    setPage(1);
  };

  const handleDetailVehicleClick = (item: VehicleData) => {
    if (slug) {
      router.push(`/dashboard/${slug}/data-kendaraan/${item.id}`);
    }
  };

  const handleEditVehicleClick = (item: VehicleData) => {
    if (slug) {
      router.push(`/dashboard/${slug}/data-kendaraan/${item.id}/edit`);
    }
  };

  const handleDeleteVehicleClick = (item: VehicleData) => {
    setSelectedVehicle(item);
    setIsDeleteVehicleOpen(true);
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!selectedVehicle) return;

    try {
      await deleteVehicleMutation.mutateAsync(selectedVehicle.id);
      toast.success('Data kendaraan berhasil dihapus');
      setIsDeleteVehicleOpen(false);
      setSelectedVehicle(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus data kendaraan');
    }
  };

  const handleImportVehicle = async (file: File) => {
    try {
      await importVehicleMutation.mutateAsync(file);
      toast.success('Import data kendaraan berhasil');
      setIsImportOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengimport data kendaraan');
      throw error;
    }
  };

  const handleExportVehicle = async () => {
    try {
      await exportVehicleMutation.mutateAsync();
      toast.success('Export data kendaraan berhasil');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengexport data kendaraan');
    }
  };

  const handleAssignClick = () => {
    setIsAssignOpen(true);
  };

  const armadas = armadaData?.data ?? [];
  const totalData = companyId === '3' ? (vehicleDataResponse?.meta.total ?? 0) : (armadaData?.meta.total ?? 0);
  const totalPages = companyId === '3' ? (vehicleDataResponse?.meta.lastPage ?? 1) : (armadaData?.meta.lastPage ?? 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Kendaraan</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola data kendaraan dengan mudah</p>
        </div>

        {companyId === '3' ? (
          <VehicleDataTable
            items={vehicleDataResponse?.data ?? []}
            isLoading={isVehicleLoading}
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
            assignedIds={assignedIds}
            onSelectedIdsChange={setSelectedIds}
            onAdd={handleAddClick}
            onImport={() => setIsImportOpen(true)}
            onExport={handleExportVehicle}
            onAssign={handleAssignClick}
            onDetail={handleDetailVehicleClick}
            onEdit={handleEditVehicleClick}
            onDelete={handleDeleteVehicleClick}
            isExporting={exportVehicleMutation.isPending}
            filterDealerId={filterDealerId}
            onFilterDealerIdChange={setFilterDealerId}
            dealerOptions={dealerOptions}
            onDealerSearchChange={setDealerSearch}
            filterInvoiceDate={filterInvoiceDate}
            onFilterInvoiceDateChange={setFilterInvoiceDate}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <ArmadaTable
            armadas={armadas}
            search={searchInput}
            onSearchChange={setSearchInput}
            page={page}
            perPage={perPage}
            totalData={totalData}
            totalPages={totalPages}
            isLoading={isArmadaLoading}
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
        )}
      </div>

      <DeleteArmadaModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />

      <DeleteVehicleDataDialog
        open={isDeleteVehicleOpen}
        onOpenChange={setIsDeleteVehicleOpen}
        onConfirm={handleConfirmDeleteVehicle}
        isDeleting={deleteVehicleMutation.isPending}
        itemName={selectedVehicle ? `${selectedVehicle.invoiceNumber} - ${selectedVehicle.stnkName}` : undefined}
      />

      <AssignVehicleDataDialog
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        initialVehicleIds={selectedIds.filter((id) => !assignedIds.includes(id))}
        onAssigned={() => {
          setSelectedIds([]);
        }}
      />

      <DataImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Data Kendaraan"
        description="Unggah file Excel untuk menambahkan data kendaraan secara massal."
        onImport={companyId === '3' ? handleImportVehicle : handleImport}
        isPending={companyId === '3' ? importVehicleMutation.isPending : importMutation.isPending}
        templateUrl={
          companyId === '3'
            ? "https://docs.google.com/spreadsheets/d/1wQmTkJSGyt7vb6DA21TdHyYiDD3tLqlXxUwQA88Qb1M/edit?usp=sharing"
            : "https://docs.google.com/spreadsheets/d/1cdvmtF4S7LrDJoyWmNDR9dd-CQz2OPj7B7EAbUwQSU4/edit?usp=sharing"
        }
      />
    </DashboardLayout>
  );
}
