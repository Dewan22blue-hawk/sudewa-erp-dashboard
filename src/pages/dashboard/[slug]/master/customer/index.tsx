import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { CustomerTable as TransindoCustomerTable, Customer as TransindoCustomer } from '@/components/features/customer/CustomerTable';
import { CustomerFormModal, CustomerFormData } from '@/components/features/customer/CustomerFormModal';
import { DeleteCustomerModal } from '@/components/features/customer/DeleteCustomerModal';
import { LegacyCustomerTable } from '@/components/features/customer/LegacyCustomerTable';
import { CustomerFormDialog } from '@/components/features/customer/CustomerFormDialog';
import { DeleteCustomerDialog } from '@/components/features/customer/DeleteCustomerDialog';
import { DUMMY_TRANSINDO_CUSTOMERS, setDummyTransindoCustomers } from '@/components/features/customer/transindo-customer.data';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/useCustomer';
import { customerSchema, type CustomerFormValues } from '@/scheme/customer.schema';
import type { Customer as ApiCustomer } from '@/@types/customer.types';
import { useAuthMe } from '@/features/auth/hooks/use-auth-me';

function TransindoCustomerContent() {
  const [customers, setCustomers] = useState<TransindoCustomer[]>(DUMMY_TRANSINDO_CUSTOMERS);

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<TransindoCustomer | null>(null);

  // Filter & Pagination logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.namaDealer.toLowerCase().includes(search.toLowerCase()) || customer.namaCustomer.toLowerCase().includes(search.toLowerCase()) || customer.pic.toLowerCase().includes(search.toLowerCase()) || customer.phone.includes(search),
    );
  }, [customers, search]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return filteredCustomers.slice(startIndex, startIndex + perPage);
  }, [filteredCustomers, page, perPage]);

  // Handlers
  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer: TransindoCustomer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (customer: TransindoCustomer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = (data: CustomerFormData) => {
    if (selectedCustomer) {
      // Edit
      setCustomers((prev) => {
        const updated = prev.map((c) => (c.id === selectedCustomer.id ? { ...c, ...data } : c));
        setDummyTransindoCustomers(updated);
        return updated;
      });
      toast.success('Data customer berhasil diubah');
    } else {
      // Add
      setCustomers((prev) => {
        const newId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1;
        const updated = [{ id: newId, ...data }, ...prev];
        setDummyTransindoCustomers(updated);
        return updated;
      });
      toast.success('Data customer berhasil ditambahkan');
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      setCustomers((prev) => {
        const updated = prev.filter((c) => c.id !== selectedCustomer.id);
        setDummyTransindoCustomers(updated);
        return updated;
      });
      toast.success('Data customer berhasil dihapus');
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-semibold text-gray-900">Customer</h1>
=======
          <h1 className="text-2xl font-semibold text-gray-900">Customer asdasd</h1>
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988
          <p className="text-sm text-gray-500 mt-1">Kelola data customer dengan mudah</p>
        </div>

        <TransindoCustomerTable
          customers={paginatedCustomers}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          page={page}
          perPage={perPage}
          totalData={filteredCustomers.length}
          onPageChange={setPage}
          onPerPageChange={(v) => {
            setPerPage(v);
            setPage(1);
          }}
          onAdd={handleAddClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <CustomerFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveForm} initialData={selectedCustomer} />

      <DeleteCustomerModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleConfirmDelete} />
    </>
  );
}

function GeneralCustomerContent() {
  const { companyId } = useCompany();
  const { data: profile } = useAuthMe();
  const { data, isLoading, isError } = useCustomers(companyId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<ApiCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ApiCustomer | null>(null);

  const createForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      address: '',
      npwp: '',
      pic: '',
      phone: '',
    },
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      address: '',
      npwp: '',
      pic: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      editForm.reset({
        name: customerToEdit.name,
        address: customerToEdit.address ?? '',
        npwp: customerToEdit.npwp ?? '',
        pic: customerToEdit.pic ?? '',
        phone: customerToEdit.phone ?? '',
      });
    }
  }, [customerToEdit, editForm]);

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    createForm.reset();
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCustomerToEdit(null);
    editForm.reset();
  };

  const onSubmitCreate = async (values: CustomerFormValues) => {
    if (!companyId) {
      toast.error('Company ID tidak ditemukan');
      return;
    }

    if (!profile?.data?.id) {
      toast.error('User belum dimuat, silakan coba lagi');
      return;
    }

    try {
      await createCustomer.mutateAsync({
        ...values,
        companyId: Number(companyId) || companyId,
        userId: profile.data.id,
      });
      handleCloseCreateModal();
      toast.success('Data berhasil ditambahkan');
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast.error('Gagal menambahkan data customer');
    }
  };

  const onSubmitEdit = async (values: CustomerFormValues) => {
    if (!customerToEdit) return;

    if (!profile?.data?.id) {
      toast.error('User belum dimuat, silakan coba lagi');
      return;
    }

    try {
      await updateCustomer.mutateAsync({
        id: customerToEdit.id,
        payload: {
          ...values,
          companyId: Number(customerToEdit.companyId) || customerToEdit.companyId,
          userId: profile.data.id,
        },
      });
      handleCloseEditModal();
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error('Gagal memperbarui data customer');
    }
  };

  const handleEditCustomer = (customer: ApiCustomer) => {
    setCustomerToEdit(customer);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (customer: ApiCustomer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await deleteCustomer.mutateAsync(customerToDelete.id);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      toast.success('Data berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Gagal menghapus data customer');
    }
  };

  const PanelName = function () {
    return (
      <div className="flex items-center justify-between" >
        <div>
          <h1 className="text-2xl font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Kelola data customer dengan mudah</p>
        </div>
      </div >
    )
  }

  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <PanelName />
          <Card className="rounded-xl p-6">
            <div className="text-center text-muted-foreground">Loading...</div>
          </Card>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="space-y-6">
          <PanelName />
          <Card className="rounded-xl p-6">
            <div className="text-center text-destructive">Gagal memuat data</div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
<<<<<<< HEAD
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Customer</h1>
            <p className="text-sm text-muted-foreground">Kelola data customer dengan mudah</p>
          </div>
        </div>
=======
        <PanelName />
>>>>>>> e6a2b33f9467f195c084c3687a1b0cadbce99988

        <LegacyCustomerTable customers={data?.data || []} onEdit={handleEditCustomer} onDelete={handleDeleteClick} onAdd={() => setCreateModalOpen(true)} />
      </div>

      <CustomerFormDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        form={createForm}
        onSubmit={onSubmitCreate}
        title="Tambah Data Customer"
        description="Masukkan detail customer baru"
        isSubmitting={createCustomer.isPending}
      />

      <CustomerFormDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        form={editForm}
        onSubmit={onSubmitEdit}
        title="Edit Data Customer"
        description="Perbarui detail customer"
        submitLabel="Perbarui"
        isSubmitting={updateCustomer.isPending}
      />

      <DeleteCustomerDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} isDeleting={deleteCustomer.isPending} />
    </>
  );
}

export default function CustomerPage() {
  const router = useRouter();
  const slugQuery = router.query.slug;
  const slug = Array.isArray(slugQuery) ? slugQuery[0] : slugQuery || '';
  const isTransindo = useMemo(() => slug.toLowerCase().includes('transindo'), [slug]);

  return <DashboardLayout>{isTransindo ? <TransindoCustomerContent /> : <GeneralCustomerContent />}</DashboardLayout>;
}
