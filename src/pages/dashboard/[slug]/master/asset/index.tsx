import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AssetTable } from '@/components/features/master/asset/AssetTable';
import { AssetFormModal, AssetFormData } from '@/components/features/master/asset/AssetFormModal';
import { EditAssetModal } from '@/components/features/master/asset/EditAssetModal';
import { DeleteAssetModal } from '@/components/features/master/asset/DeleteAssetModal';
import { ImportAssetModal } from '@/components/features/master/asset/ImportAssetModal';
import { toast } from 'sonner';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, useImportAsset, useExportAsset } from '@/hooks/useAsset';
import { useCompany } from '@/contexts/CompanyContext';
import type { Asset } from '@/@types/asset.types';

export default function AssetPage() {
  const { companyId } = useCompany();

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  const { data: assetsData, isLoading } = useAssets(companyId, { page, perPage, search });
  
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const deleteMutation = useDeleteAsset();
  const importMutation = useImportAsset();
  const exportMutation = useExportAsset();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Handlers
  const handleAddClick = () => {
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = async (data: AssetFormData) => {
    try {
      if (selectedAsset) {
        // Edit
        await updateMutation.mutateAsync({ id: selectedAsset.id, data });
        toast.success('Data aset berhasil diubah');
      } else {
        // Add
        await createMutation.mutateAsync({ ...data, company_id: Number(companyId) });
        toast.success('Data aset berhasil ditambahkan');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedAsset) {
      try {
        await deleteMutation.mutateAsync(selectedAsset.id);
        toast.success('Data aset berhasil dihapus');
        setIsDeleteOpen(false);
        setSelectedAsset(null);
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus data');
      }
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync({ file, companyId: companyId ? Number(companyId) : undefined });
      toast.success('Import data aset berhasil');
      setIsImportOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Import data aset gagal');
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success('Berhasil export data aset');
    } catch (error: any) {
      toast.error(error.message || 'Gagal export data aset');
    }
  };

  const assetsList = assetsData?.data || [];
  const totalAssets = assetsData?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Aset</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data aset perusahaan dengan mudah</p>
        </div>

        {/* Content */}
        <AssetTable
          assets={assetsList}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={totalAssets}
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
      <AssetFormModal 
        isOpen={isFormOpen && !selectedAsset} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveForm} 
        companyId={Number(companyId)}
      />

      {selectedAsset && (
          <EditAssetModal 
            isOpen={isFormOpen && !!selectedAsset} 
            onClose={() => {
                setIsFormOpen(false);
                setTimeout(() => setSelectedAsset(null), 300);
            }} 
            onSave={handleSaveForm}
            initialData={selectedAsset}
          />
      )}

      <DeleteAssetModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        isDeleting={deleteMutation.isPending}
      />

      <ImportAssetModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        isUploading={importMutation.isPending}
      />
    </DashboardLayout>
  );
}
