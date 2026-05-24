import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { DoInvoiceTableRow } from '@/@types/create-invoice.types';
import { CreateInvoiceDeleteDialog } from '@/components/features/create-invoice/CreateInvoiceDeleteDialog';
import { CreateInvoiceModal } from '@/components/features/create-invoice/CreateInvoiceModal';
import { CreateInvoiceTable } from '@/components/features/create-invoice/CreateInvoiceTable';
import { matchesInvoiceSearch, toDoInvoiceTableRow } from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCreateDoInvoice, useDeleteDoInvoice, useDoInvoices } from '@/hooks/useDoInvoice';
import { ApiValidationError } from '@/lib/api/response';
import type { ApiError } from '@/@types/api';

const extractValidationMessages = (error: unknown) => {
  if (error instanceof ApiValidationError) {
    const messages = Object.entries(error.fieldErrors ?? {}).flatMap(([field, fieldMessages]) =>
      (fieldMessages ?? []).map((message) => `${field}: ${message}`),
    );

    return {
      title: error.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  const apiError = error as ApiError & {
    fieldErrors?: Record<string, string[]>;
    response?: { data?: { errors?: Record<string, string[]>; message?: string } };
  };

  const rawFieldErrors =
    apiError?.fieldErrors ??
    apiError?.response?.data?.errors ??
    (typeof apiError?.details === 'object' && apiError.details ? (apiError.details as Record<string, string[]>) : undefined);

  if (rawFieldErrors && typeof rawFieldErrors === 'object') {
    const messages = Object.entries(rawFieldErrors).flatMap(([field, fieldMessages]) => {
      if (Array.isArray(fieldMessages)) {
        return fieldMessages.map((message) => `${field}: ${message}`);
      }
      return [`${field}: ${String(fieldMessages)}`];
    });

    return {
      title: apiError?.message || apiError?.response?.data?.message || 'Validation error',
      description: messages.join('\n'),
    };
  }

  return {
    title: apiError?.message || 'Gagal menambahkan create invoice',
    description: '',
  };
};

export default function CreateInvoiceListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = React.useState('');
  const [printFilter, setPrintFilter] = React.useState<'' | '0' | '1'>('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<DoInvoiceTableRow | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const listQuery = useDoInvoices({
    page,
    perPage,
    search,
    order_by: 'created_at',
    order_sort: sortOrder,
    date: dateFilter || undefined,
    is_printed: printFilter,
  });
  const createMutation = useCreateDoInvoice();
  const deleteMutation = useDeleteDoInvoice();

  const rows = React.useMemo(() => (listQuery.data?.data ?? []).map(toDoInvoiceTableRow), [listQuery.data?.data]);
  const filteredRows = React.useMemo(() => rows.filter((row) => matchesInvoiceSearch(row, searchInput)), [rows, searchInput]);

  const handleCreate = async (values: { customer_id: number; date: string; subject: string; letter_content: string; description: string }) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Create invoice berhasil ditambahkan');
      setCreateOpen(false);
    } catch (error: any) {
      const validation = extractValidationMessages(error);
      toast.error(validation.title, {
        description: validation.description || undefined,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedRow.id, payload: { do_code: selectedRow.code } });
      toast.success('Create invoice berhasil dihapus');
      setDeleteOpen(false);
      setSelectedRow(null);
      setSelectedIds((current) => current.filter((item) => item !== selectedRow.id));
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus create invoice');
    }
  };

  const redirectToPrint = async (row: DoInvoiceTableRow) => {
    await router.push(`/dashboard/${slug}/administrasi/create-invoice/detail/${row.id}`);
  };

  return (
    <DashboardLayout>
      <CreateInvoiceTable
        rows={filteredRows}
        search={searchInput}
        isLoading={listQuery.isLoading}
        page={page}
        perPage={perPage}
        totalData={listQuery.data?.meta.total ?? 0}
        sortOrder={sortOrder}
        printFilter={printFilter}
        dateFilter={dateFilter}
        selectedIds={selectedIds}
        isProcessing={false}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        onSortOrderChange={(value) => {
          setSortOrder(value);
          setPage(1);
        }}
        onPrintFilterChange={(value) => {
          setPrintFilter(value);
          setPage(1);
        }}
        onDateFilterChange={(value) => {
          setDateFilter(value);
          setPage(1);
        }}
        onResetFilters={() => {
          setSearchInput('');
          setSearch('');
          setDateFilter('');
          setPrintFilter('');
          setSortOrder('desc');
          setPerPage(10);
          setPage(1);
        }}
        onAdd={() => setCreateOpen(true)}
        onDetail={(row) => router.push(`/dashboard/${slug}/administrasi/create-invoice/detail/${row.id}`)}
        onPrint={redirectToPrint}
        onDelete={(row) => {
          setSelectedRow(row);
          setDeleteOpen(true);
        }}
        onToggleRow={(id, checked) =>
          setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)))
        }
        onToggleAll={(checked) => setSelectedIds(checked ? filteredRows.map((item) => item.id) : [])}
        onProcessSelected={() => router.push(`/dashboard/${slug}/administrasi/create-invoice/process?ids=${selectedIds.join(',')}`)}
      />

      <CreateInvoiceModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isSubmitting={createMutation.isPending} />

      <CreateInvoiceDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} isDeleting={deleteMutation.isPending} itemName={selectedRow?.code} />
    </DashboardLayout>
  );
}
