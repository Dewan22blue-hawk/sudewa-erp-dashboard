import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer as ApiCustomer } from '@/@types/customer.types';
import { CustomerFormModal } from '@/components/features/customer/CustomerFormModal';
import { DeleteCustomerModal } from '@/components/features/customer/DeleteCustomerModal';
import { CustomerFormDialog } from '@/components/features/customer/CustomerFormDialog';
import { CustomerTable } from '@/components/features/customer/CustomerTable';
import { DeleteCustomerDialog } from '@/components/features/customer/DeleteCustomerDialog';
import { LegacyCustomerTable } from '@/components/features/customer/LegacyCustomerTable';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { useCompany } from '@/contexts/CompanyContext';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { useCreateCustomer, useCustomers, useDeleteCustomer, useExportCustomer, useImportCustomer, useUpdateCustomer } from '@/hooks/useCustomer';
import { ApiResponseError, ApiValidationError } from '@/lib/api/response';
import { customerSchema, type CustomerFormValues } from '@/scheme/customer.schema';
import { getCustomerById } from '@/services/customer.service';
import { toast } from 'sonner';

const defaultCustomerValues: CustomerFormValues = {
  name: '',
  address: '',
  npwp: '',
  pic: '',
  phone: '',
  map_link: '',
};

const applyValidationErrors = (
  error: ApiValidationError,
  form: ReturnType<typeof useForm<CustomerFormValues>>,
) => {
  Object.entries(error.fieldErrors).forEach(([field, messages]) => {
    const mappedField = field === 'pic_name' ? 'pic' : field;
    form.setError(mappedField as keyof CustomerFormValues, { message: messages?.[0] || 'Validasi gagal' });
  });
};

function TransindoCustomerContent() {
  const { companyId, isLoading: isLoadingCompany } = useCompany();
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPerPage: 10 });
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, isFetching, isError } = useCustomers({
    page,
    perPage,
    search: deferredSearch || undefined,
    company_id: companyId ?? undefined,
    enabled: !isLoadingCompany && !!companyId,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const importCustomer = useImportCustomer();
  const exportCustomer = useExportCustomer();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ApiCustomer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiCustomer | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | number | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultCustomerValues,
  });

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
    form.reset(defaultCustomerValues);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.reset(defaultCustomerValues);
    setIsFormOpen(true);
  };

  const handleEdit = async (customer: ApiCustomer) => {
    setLoadingDetailId(customer.id);

    try {
      const detail = await getCustomerById(customer.id);
      setEditingCustomer(detail);
      form.reset({
        name: detail.name,
        address: detail.address ?? '',
        npwp: detail.npwp ?? '',
        pic: detail.pic ?? '',
        phone: detail.phone ?? '',
        map_link: detail.map_link ?? '',
      });
      setIsFormOpen(true);
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal memuat detail customer';
      toast.error(message);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!companyId) {
      toast.error('Company ID tidak ditemukan');
      return;
    }

    const payload = {
      ...values,
      companyId: Number(companyId) || companyId,
    };

    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, payload });
        toast.success('Data customer berhasil diperbarui');
      } else {
        await createCustomer.mutateAsync(payload);
        toast.success('Data customer berhasil ditambahkan');
      }

      handleCloseForm();
    } catch (error) {
      if (error instanceof ApiValidationError) {
        applyValidationErrors(error, form);
        toast.error(error.message || 'Validasi gagal');
        return;
      }

      const message = error instanceof ApiResponseError ? error.message : 'Gagal menyimpan data customer';
      toast.error(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      toast.success('Data customer berhasil dihapus');
      setDeleteTarget(null);
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal menghapus data customer';
      toast.error(message);
    }
  };

  const handleImport = async (file: File) => {
    if (!companyId) {
      throw new Error('Company ID tidak ditemukan');
    }

    await importCustomer.mutateAsync({ companyId, file });
  };

  const handleExport = async () => {
    try {
      if (!companyId) {
        throw new Error('Company ID tidak ditemukan');
      }

      await exportCustomer.mutateAsync(companyId);
      toast.success('File customer berhasil didownload');
    } catch (error) {
      const message = error instanceof ApiResponseError ? error.message : 'Gagal mengexport data customer';
      toast.error(message);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-[40px] font-semibold leading-tight tracking-[-0.02em] text-[#171717]">Customer</h1>
          <p className="mt-1 text-[24px] text-[#71717A]">Kelola data customer dengan mudah</p>
        </div>

        {isError ? (
          <Card className="rounded-xl border border-[#E4E4E7] p-6 shadow-none">
            <div className="text-center text-[15px] text-[#DC2626]">Gagal memuat data customer</div>
          </Card>
        ) : (
          <CustomerTable
            customers={data?.data ?? []}
            isLoading={isLoading || isFetching || !!loadingDetailId}
            search={search}
            page={page}
            perPage={perPage}
            totalData={data?.meta.total ?? 0}
            totalPages={data?.meta.lastPage ?? 1}
            onSearchChange={setSearch}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onImport={() => setIsImportOpen(true)}
            onExport={handleExport}
            isExporting={exportCustomer.isPending}
          />
        )}
      </div>

      <CustomerFormModal
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm();
            return;
          }

          setIsFormOpen(open);
        }}
        form={form}
        onSubmit={handleSubmit}
        title={editingCustomer ? 'Edit Data Customer' : 'Tambah Data Customer'}
        description={editingCustomer ? 'Edit detail customer baru' : 'Masukkan detail customer baru'}
        submitLabel="Simpan"
        isSubmitting={createCustomer.isPending || updateCustomer.isPending}
      />

      <DeleteCustomerModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        customerName={deleteTarget?.name ?? null}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteCustomer.isPending}
      />

      <DataImportModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="Import Data Customer"
        description="Unggah file .xlsx, .xls, atau .csv untuk mengimport data customer."
        onImport={handleImport}
        isPending={importCustomer.isPending}
        accept=".xlsx,.xls,.csv,text/csv"
      />
    </>
  );
}

function GeneralCustomerContent() {
  const { companyId } = useCompany();
  const { data, isLoading, isError } = useCustomers({
    company_id: companyId ?? undefined,
    perPage: 100,
    page: 1,
    enabled: !!companyId,
  });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const importCustomer = useImportCustomer();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<ApiCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<ApiCustomer | null>(null);

  const createForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultCustomerValues,
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultCustomerValues,
  });

  useEffect(() => {
    if (customerToEdit) {
      editForm.reset({
        name: customerToEdit.name,
        address: customerToEdit.address ?? '',
        npwp: customerToEdit.npwp ?? '',
        pic: customerToEdit.pic ?? '',
        phone: customerToEdit.phone ?? '',
        map_link: customerToEdit.map_link ?? '',
      });
    }
  }, [customerToEdit, editForm]);

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    createForm.reset(defaultCustomerValues);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCustomerToEdit(null);
    editForm.reset(defaultCustomerValues);
  };

  const onSubmitCreate = async (values: CustomerFormValues) => {
    if (!companyId) {
      toast.error('Company ID tidak ditemukan');
      return;
    }

    try {
      await createCustomer.mutateAsync({
        ...values,
        companyId: Number(companyId) || companyId,
      });
      handleCloseCreateModal();
      toast.success('Data berhasil ditambahkan');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        applyValidationErrors(error, createForm);
        toast.error(error.message || 'Validasi gagal');
        return;
      }

      toast.error('Gagal menambahkan data customer');
    }
  };

  const onSubmitEdit = async (values: CustomerFormValues) => {
    if (!customerToEdit) return;

    try {
      await updateCustomer.mutateAsync({
        id: customerToEdit.id,
        payload: {
          ...values,
          companyId: Number(customerToEdit.companyId) || customerToEdit.companyId,
        },
      });
      handleCloseEditModal();
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      if (error instanceof ApiValidationError) {
        applyValidationErrors(error, editForm);
        toast.error(error.message || 'Validasi gagal');
        return;
      }

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
    } catch {
      toast.error('Gagal menghapus data customer');
    }
  };

  const handleImport = async (file: File) => {
    if (!companyId) return;
    await importCustomer.mutateAsync({ companyId, file });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Kelola data customer dengan mudah</p>
        </div>
        <Card className="rounded-xl p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Kelola data customer dengan mudah</p>
        </div>
        <Card className="rounded-xl p-6">
          <div className="text-center text-destructive">Gagal memuat data</div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Kelola data customer dengan mudah</p>
        </div>

        <LegacyCustomerTable
          customers={data?.data || []}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteClick}
          onAdd={() => setCreateModalOpen(true)}
          onImport={() => setOpenImport(true)}
        />
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

      <DataImportModal
        open={openImport}
        onOpenChange={setOpenImport}
        title="Import Data Customer"
        description="Unggah file .xlsx, .xls, atau .csv untuk mengimport data customer."
        onImport={handleImport}
        isPending={importCustomer.isPending}
        templateUrl="https://docs.google.com/spreadsheets/d/1wQmTkJSGyt7vb6DA21TdHyYiDD3tLqlXxUwQA88Qb1M/edit?usp=sharing"
        accept=".xlsx,.xls,.csv,text/csv"
      />
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
