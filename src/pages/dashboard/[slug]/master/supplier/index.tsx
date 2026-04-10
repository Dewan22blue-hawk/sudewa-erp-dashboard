import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useImportSupplier } from '@/hooks/useSupplier';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { useUserOptions } from '@/hooks/useUser';
import { createSupplierSchema, type CreateSupplierFormValues } from '@/scheme/supplier.schema';
import { SupplierTable } from '@/components/features/supplier/SupplierTable';
import { SupplierFormDialog } from '@/components/features/supplier/SupplierFormDialog';
import { DeleteSupplierDialog } from '@/components/features/supplier/DeleteSupplierDialog';
import type { Supplier } from '@/@types/supplier.types';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';

export default function SupplierPage() {
  const { companyId } = useCompany();
  const { data: profile } = useAuthMe();
  const { data: userOptions = [], isLoading: isUserLoading } = useUserOptions();
  const { data, isLoading, isError } = useSuppliers(companyId);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const importMutation = useImportSupplier();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const createForm = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: '',
      address: '',
      npwp: '',
      pic: '',
      phone: '',
    },
  });

  const editForm = useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: '',
      address: '',
      npwp: '',
      pic: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (supplierToEdit) {
      editForm.reset({
        name: supplierToEdit.name,
        address: supplierToEdit.address ?? '',
        npwp: supplierToEdit.npwp ?? '',
        pic: supplierToEdit.pic ?? '',
        phone: supplierToEdit.phone ?? '',
      });
    }
  }, [supplierToEdit, editForm]);

  const handleCreateClick = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    createForm.reset();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSupplierToEdit(null);
    editForm.reset();
  };

  const onSubmitCreate = async (values: CreateSupplierFormValues) => {
    if (!companyId) {
      toast.error('Company ID tidak ditemukan');
      return;
    }

    if (!profile?.data?.id) {
      toast.error('User belum dimuat, silakan coba lagi');
      return;
    }

    try {
      await createSupplier.mutateAsync({
        ...values,
        pic: values.pic || undefined,
        phone: values.phone || undefined,
        companyId: Number(companyId) || companyId,
        userId: Number(profile.data.id) || profile.data.id,
      });
      handleCloseCreateModal();
      toast.success('Data berhasil ditambahkan');
    } catch (error) {
      console.error('Failed to create supplier:', error);
      toast.error('Gagal menambahkan data supplier');
    }
  };

  const onSubmitEdit = async (values: CreateSupplierFormValues) => {
    if (!supplierToEdit) return;

    if (!profile?.data?.id) {
      toast.error('User belum dimuat, silakan coba lagi');
      return;
    }
    const payload = {
      ...values,
      pic: values.pic || undefined,
      phone: values.phone || undefined,
      companyId: Number(supplierToEdit.companyId) || supplierToEdit.companyId,
      userId: Number(profile.data.id) || profile.data.id,
    };

    try {
      await updateSupplier.mutateAsync({
        id: supplierToEdit.id,
        payload,
      });
      handleCloseEditModal();
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      console.error('Failed to update supplier:', error);
      toast.error('Gagal memperbarui data supplier');
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await deleteSupplier.mutateAsync(supplierToDelete.id);
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
      toast.success('Data berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      toast.error('Gagal menghapus data supplier');
    }
  };

  const handleImport = async (file: File) => {
    if (!companyId) return;
    await importMutation.mutateAsync({ companyId, file });
  };


  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Supplier</h1>
              <p className="text-sm text-muted-foreground">Kelola data supplier dengan mudah</p>
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
              <h1 className="text-2xl font-semibold">Supplier</h1>
              <p className="text-sm text-muted-foreground">Kelola data supplier dengan mudah</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Supplier</h1>
            <p className="text-sm text-muted-foreground">Kelola data supplier dengan mudah</p>
          </div>
        </div>

        <div className="">
          <SupplierTable suppliers={data?.data || []} onEdit={handleEditSupplier} onDelete={handleDeleteClick} onAdd={handleCreateClick} onImport={() => setOpenImport(true)} />
        </div>

      </div>

      <SupplierFormDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        form={createForm}
        onSubmit={onSubmitCreate}
        title="Tambah Data Supplier"
        description="Masukkan detail supplier baru"
        isSubmitting={createSupplier.isPending}
        userOptions={userOptions}
        isUserLoading={isUserLoading}
      />

      <SupplierFormDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        form={editForm}
        onSubmit={onSubmitEdit}
        title="Edit Data Supplier"
        description="Perbarui data detail supplier"
        submitLabel="Perbarui"
        isSubmitting={updateSupplier.isPending}
        userOptions={userOptions}
        isUserLoading={isUserLoading}
      />

      <DeleteSupplierDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} isDeleting={deleteSupplier.isPending} />

      <DataImportModal
        open={openImport}
        onOpenChange={setOpenImport}
        title="Import Data Supplier"
        description="Unggah file .xlsx untuk mengimport data supplier."
        onImport={handleImport}
        isPending={importMutation.isPending}
        templateUrl="https://docs.google.com/spreadsheets/d/1wQmTkJSGyt7vb6DA21TdHyYiDD3tLqlXxUwQA88Qb1M/edit?usp=sharing"
      />
    </DashboardLayout>
  );
}
