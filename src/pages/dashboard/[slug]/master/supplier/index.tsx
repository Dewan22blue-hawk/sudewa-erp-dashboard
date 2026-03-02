import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSupplier';
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

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
          <SupplierTable suppliers={data?.data || []} onEdit={handleEditSupplier} onDelete={handleDeleteClick} onAdd={handleCreateClick} />
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
        description="Perbarui detail supplier"
        submitLabel="Perbarui"
        isSubmitting={updateSupplier.isPending}
        userOptions={userOptions}
        isUserLoading={isUserLoading}
      />

      <DeleteSupplierDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} isDeleting={deleteSupplier.isPending} />
    </DashboardLayout>
  );
}
