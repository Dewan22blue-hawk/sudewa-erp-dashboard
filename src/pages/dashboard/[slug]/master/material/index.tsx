import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MaterialTable } from '@/components/features/material/MaterialTable';
import { MaterialFormModal, MaterialFormData } from '@/components/features/material/MaterialFormModal';
import { EditMaterialModal } from '@/components/features/material/EditMaterialModal';
import { DeleteMaterialModal } from '@/components/features/material/DeleteMaterialModal';
import { ImportMaterialModal } from '@/components/features/material/ImportMaterialModal';
import { toast } from 'sonner';
import { useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial, useImportMaterial, useExportMaterial } from '@/hooks/useMaterial';
import type { Material } from '@/@types/material.types';

export default function MaterialPage() {

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const { data: materialsData, isLoading } = useMaterials({ page, perPage, search });
  
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();
  const importMutation = useImportMaterial();
  const exportMutation = useExportMaterial();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Handlers
  const handleAddClick = () => {
    setSelectedMaterial(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = async (data: MaterialFormData) => {
    try {
      if (selectedMaterial) {
        // Edit
        await updateMutation.mutateAsync({ id: selectedMaterial.id, data });
        toast.success('Data material berhasil diubah');
      } else {
        // Add
        await createMutation.mutateAsync(data);
        toast.success('Data material berhasil ditambahkan');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan data');
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedMaterial) {
      try {
        await deleteMutation.mutateAsync(selectedMaterial.id);
        toast.success('Data material berhasil dihapus');
        setIsDeleteOpen(false);
        setSelectedMaterial(null);
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus data');
      }
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importMutation.mutateAsync({ file });
      toast.success('Import data material berhasil');
      setIsImportOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Import data material gagal');
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success('Berhasil export data material');
    } catch (error: any) {
      toast.error(error.message || 'Gagal export data material');
    }
  };

  const materialsList = (materialsData as any)?.data || [];
  const totalMaterials = (materialsData as any)?.meta?.total || (materialsData as any)?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Material</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data material dengan mudah</p>
        </div>

        {/* Content */}
        <MaterialTable
          materials={materialsList}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={totalMaterials}
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
      <MaterialFormModal 
        isOpen={isFormOpen && !selectedMaterial} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveForm} 
      />

      {selectedMaterial && (
          <EditMaterialModal 
            isOpen={isFormOpen && !!selectedMaterial} 
            onClose={() => {
                setIsFormOpen(false);
                setTimeout(() => setSelectedMaterial(null), 300);
            }} 
            onSave={handleSaveForm}
            initialData={selectedMaterial}
          />
      )}

      <DeleteMaterialModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        isDeleting={deleteMutation.isPending}
      />

      <ImportMaterialModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
        isUploading={importMutation.isPending}
      />
    </DashboardLayout>
  );
}
