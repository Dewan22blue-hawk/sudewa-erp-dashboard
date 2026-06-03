import { useDeferredValue, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer as ApiCustomer } from '@/@types/customer.types';
import { DataImportModal } from '@/components/features/master-data/DataImportModal';
import { CustomerFormModal } from '@/components/features/customer/CustomerFormModal';
import { CustomerTable } from '@/components/features/customer/CustomerTable';
import { DeleteCustomerModal } from '@/components/features/customer/DeleteCustomerModal';
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

const normalizeCompanyId = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
};

const filterCustomersByCompany = (customers: ApiCustomer[], companyId: string | null) => {
  const normalizedCompanyId = normalizeCompanyId(companyId);

  if (!normalizedCompanyId) {
    return customers;
  }

  return customers.filter((customer) => normalizeCompanyId(customer.companyId) === normalizedCompanyId);
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

export function CustomerManagementPage() {
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

  const customers = useMemo(
    () => filterCustomersByCompany(data?.data ?? [], companyId),
    [companyId, data?.data],
  );

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
    if (!deleteTarget || !companyId) return;

    try {
      await deleteCustomer.mutateAsync({ id: deleteTarget.id, companyId });
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

  if (isError) {
    return (
      <Card className="rounded-xl border border-[#E4E4E7] p-6 shadow-none">
        <div className="text-center text-[15px] text-[#DC2626]">Gagal memuat data customer</div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-[40px] font-semibold leading-tight tracking-[-0.02em] text-[#171717]">Customer</h1>
          <p className="mt-1 text-[24px] text-[#71717A]">Kelola data customer dengan mudah</p>
        </div>

        <CustomerTable
          customers={customers}
          isLoading={isLoadingCompany || isLoading || isFetching || !!loadingDetailId}
          search={search}
          page={page}
          perPage={perPage}
          totalData={data?.meta.total ?? customers.length}
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
        description={editingCustomer ? 'Edit detail customer' : 'Masukkan detail customer baru'}
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
