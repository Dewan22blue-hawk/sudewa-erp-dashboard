import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { CreateInvoiceTableRow } from '@/@types/create-invoice.types';
import { CreateInvoiceDeleteDialog } from '@/components/features/create-invoice/CreateInvoiceDeleteDialog';
import { CreateInvoiceModal } from '@/components/features/create-invoice/CreateInvoiceModal';
import { CreateInvoiceTable } from '@/components/features/create-invoice/CreateInvoiceTable';
import { matchesCreateInvoiceSearch, toCreateInvoiceRow } from '@/components/features/create-invoice/create-invoice.utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCreateInvoice, useCreateInvoiceList, useDeleteCreateInvoice } from '@/hooks/useCreateInvoice';
import { useDoEkspedisis } from '@/hooks/useDoEkspedisi';

export default function CreateInvoiceListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(25);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [doSearch, setDoSearch] = React.useState('');
  const [selectedDoCode, setSelectedDoCode] = React.useState('');
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<CreateInvoiceTableRow | null>(null);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const listQuery = useCreateInvoiceList({
    page,
    perPage,
    search,
    order_by: 'created_at',
    order_sort: 'desc',
  });
  const doLookupQuery = useDoEkspedisis({
    page: 1,
    perPage: 25,
    search: doSearch,
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: createOpen,
  });
  const createMutation = useCreateInvoice();
  const deleteMutation = useDeleteCreateInvoice();

  const tableRows = React.useMemo(() => (listQuery.data?.data ?? []).map(toCreateInvoiceRow), [listQuery.data?.data]);
  const filteredRows = React.useMemo(() => tableRows.filter((row) => matchesCreateInvoiceSearch(row, searchInput)), [tableRows, searchInput]);
  const doOptions = React.useMemo(
    () =>
      (doLookupQuery.data?.data ?? []).map((item) => ({
        value: item.doCode,
        label: item.doCode,
        subtitle: [item.driver?.name, item.vehicle?.registrationNumber].filter(Boolean).join(' • ') || undefined,
      })),
    [doLookupQuery.data?.data],
  );

  const handleCreate = async () => {
    if (!selectedDoCode) {
      toast.error('Kode DO wajib dipilih');
      return;
    }

    try {
      await createMutation.mutateAsync({ do_code: selectedDoCode });
      toast.success('Create invoice berhasil ditambahkan');
      setCreateOpen(false);
      setSelectedDoCode('');
      setDoSearch('');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan create invoice');
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;

    try {
      await deleteMutation.mutateAsync(selectedRow.invoice.id);
      toast.success('Create invoice berhasil dihapus');
      setDeleteOpen(false);
      setSelectedRow(null);
      setSelectedIds((current) => current.filter((item) => item !== selectedRow.invoice.id));
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus create invoice');
    }
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
        selectedIds={selectedIds}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value);
          setPage(1);
        }}
        onToggleSelect={(id, checked) =>
          setSelectedIds((current) => (checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id)))
        }
        onToggleSelectAll={(checked) =>
          setSelectedIds((current) =>
            checked
              ? Array.from(new Set([...current, ...filteredRows.map((row) => row.invoice.id)]))
              : current.filter((item) => !filteredRows.some((row) => row.invoice.id === item)),
          )
        }
        onAdd={() => setCreateOpen(true)}
        onProcess={() => {
          if (!selectedIds.length) return;
          router.push(`/dashboard/${slug}/administrasi/create-invoice/process?ids=${selectedIds.join(',')}`);
        }}
        onDetail={(row) => router.push(`/dashboard/${slug}/administrasi/create-invoice/detail/${row.invoice.id}`)}
        onEdit={(row) => router.push(`/dashboard/${slug}/administrasi/create-invoice/edit/${row.invoice.id}`)}
        onDelete={(row) => {
          setSelectedRow(row);
          setDeleteOpen(true);
        }}
      />

      <CreateInvoiceModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setSelectedDoCode('');
            setDoSearch('');
          }
        }}
        doCode={selectedDoCode}
        onDoCodeChange={setSelectedDoCode}
        onSearchChange={setDoSearch}
        options={doOptions}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
        isLoadingOptions={doLookupQuery.isLoading}
      />

      <CreateInvoiceDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        itemName={selectedRow?.doCode}
      />
    </DashboardLayout>
  );
}
