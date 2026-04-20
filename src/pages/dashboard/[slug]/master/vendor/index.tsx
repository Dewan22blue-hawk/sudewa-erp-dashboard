import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VendorTable } from '@/components/features/vendor/VendorTable';
import { VendorFormModal, VendorFormData } from '@/components/features/vendor/VendorFormModal';
import { EditVendorModal } from '@/components/features/vendor/EditVendorModal';
import { DeleteVendorModal } from '@/components/features/vendor/DeleteVendorModal';
import { ImportVendorModal } from '@/components/features/vendor/ImportVendorModal';
import { toast } from 'sonner';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, useImportVendor, useExportVendor } from '@/hooks/useVendor';
import { useCompany } from '@/contexts/CompanyContext';
import type { Vendor } from '@/@types/vendor.types';

export default function VendorPage() {
  const { companyId: localCompanyId } = useCompany();

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { data: vendorsData, isLoading } = useVendors({ page, perPage, search });
  
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();
  const importMutation = useImportVendor();
  const exportMutation = useExportVendor();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Handlers
  const handleAddClick = () => {
    setSelectedVendor(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = async (data: VendorFormData) => {
    try {
      const companyId = localCompanyId || 1; // Fallback to 1 if no company
      if (selectedVendor) {
        // Edit
        await updateMutation.mutateAsync({ id: selectedVendor.id, data: { ...data, companyId }});
        toast.success('Data vendor berhasil diubah');
      } else {
        // Add
        await createMutation.mutateAsync({ ...data, companyId });
        toast.success('Data vendor berhasil ditambahkan');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVendor) {
      try {
        await deleteMutation.mutateAsync(selectedVendor.id);
        toast.success('Data vendor berhasil dihapus');
        setIsDeleteOpen(false);
        setSelectedVendor(null);
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus data');
      }
    }
  };

  const handleImport = async (file: File) => {
    try {
      const companyId = localCompanyId || 1;
      await importMutation.mutateAsync({ companyId, file });
      toast.success('Import data vendor berhasil');
      setIsImportOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Import data vendor gagal');
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success('Berhasil export data vendor');
    } catch (error: any) {
      toast.error(error.message || 'Gagal export data vendor');
    }
  };

  const vendorsList = (vendorsData as any)?.data || [];
  const totalVendors = (vendorsData as any)?.meta?.total || (vendorsData as any)?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Vendor</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data vendor dengan mudah</p>
        </div>

        {/* Content */}
        <VendorTable
          vendors={vendorsList}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={totalVendors}
          onPageChange={setPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          onAdd={handleAddClick}
          onImport={() => setIsImportOpen(true)}
          onExport={handleExport}
          isExporting={exportMutation.isPending}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

      </div>

      {/* Modals */}
      <VendorFormModal 
        isOpen={isFormOpen && !selectedVendor} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveForm} 
      />

      {selectedVendor && (
          <EditVendorModal 
            isOpen={isFormOpen && !!selectedVendor} 
            onClose={() => {
                setIsFormOpen(false);
                setTimeout(() => setSelectedVendor(null), 300);
            }} 
            onSave={handleSaveForm}
            initialData={selectedVendor}
          />
      )}

      <DeleteVendorModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        isDeleting={deleteMutation.isPending}
      />

      <ImportVendorModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        isUploading={importMutation.isPending}
      />
    </DashboardLayout>
  );
}
