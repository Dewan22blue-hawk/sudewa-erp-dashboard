import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { OrderList } from '@/@types/order-list.types';
import { OrderListDeleteDialog } from '@/components/features/order-list/OrderListDeleteDialog';
import { OrderListTable } from '@/components/features/order-list/OrderListTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrderLists, useDeleteOrderList, useOrderListTarifs } from '@/hooks/useOrderList';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';

export default function OrderListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPage: 1, defaultPerPage: 10, defaultSearch: '' });
  const [searchInput, setSearchInput] = React.useState(search);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<OrderList | null>(null);

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearch]);

  const listQuery = useOrderLists({
    page,
    perPage,
    search,
    order_by: 'created_at',
    order_sort: 'desc',
  });
  const tarifItemQuery = useOrderListTarifs({
    page: 1,
    perPage: 500,
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: true,
  });
  const deleteMutation = useDeleteOrderList();

  const tableData = React.useMemo(() => {
    const orders = listQuery.data?.data ?? [];
    const tarifItems = tarifItemQuery.data?.data ?? [];

    if (!orders.length || !tarifItems.length) {
      return orders;
    }

    const tarifMap = new Map<number, typeof tarifItems>();
    tarifItems.forEach((item) => {
      const current = tarifMap.get(item.doOrderListId) ?? [];
      current.push(item);
      tarifMap.set(item.doOrderListId, current);
    });

    return orders.map((order) => ({
      ...order,
      tarifs: tarifMap.get(order.id) ?? order.tarifs,
    }));
  }, [listQuery.data?.data, tarifItemQuery.data?.data]);

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Order list berhasil dihapus');
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus order list');
    }
  };

  return (
    <DashboardLayout>
      <OrderListTable
        data={tableData}
        search={searchInput}
        page={page}
        perPage={perPage}
        totalData={listQuery.data?.meta.total ?? 0}
        isLoading={listQuery.isLoading || tarifItemQuery.isLoading}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onAdd={() => router.push(`/dashboard/${slug}/administrasi/order-list/create`)}
        onDetail={(item) => router.push(`/dashboard/${slug}/administrasi/order-list/detail/${item.id}`)}
        onEdit={(item) => router.push(`/dashboard/${slug}/administrasi/order-list/edit/${item.id}`)}
        onDelete={(item) => {
          setSelectedItem(item);
          setDeleteOpen(true);
        }}
      />

      <OrderListDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        itemName={selectedItem?.code}
      />
    </DashboardLayout>
  );
}
