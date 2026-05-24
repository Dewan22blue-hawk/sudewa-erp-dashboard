import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { OrderList } from '@/@types/order-list.types';
import { OrderListDeleteDialog } from '@/components/features/order-list/OrderListDeleteDialog';
import { OrderListTable } from '@/components/features/order-list/OrderListTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrderLists, useDeleteOrderList, useOrderListTarifs, useOrderListTarifItems } from '@/hooks/useOrderList';
import { useQueryParamsTable } from '@/hooks/useQueryParamsTable';
import { composeOrderListWithTarifs } from '@/services/order-list.service';

export default function OrderListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const { page, perPage, search, setPage, setPerPage, setSearch } = useQueryParamsTable({ defaultPage: 1, defaultPerPage: 10, defaultSearch: '' });
  const [searchInput, setSearchInput] = React.useState(search);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<OrderList | null>(null);
  const navigationLockRef = React.useRef(false);

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, setSearch]);

  const listQueryParams = React.useMemo(
    () => ({
      page,
      perPage,
      search,
      order_by: 'created_at' as const,
      order_sort: 'desc' as const,
    }),
    [page, perPage, search],
  );

  const tarifItemQueryParams = React.useMemo(
    () => ({
      page: 1,
      perPage: 500,
      order_by: 'created_at' as const,
      order_sort: 'desc' as const,
    }),
    [],
  );

  const tarifLoadItemQueryParams = React.useMemo(
    () => ({
      page: 1,
      perPage: 1000,
      order_by: 'created_at' as const,
      order_sort: 'desc' as const,
    }),
    [],
  );

  const listQuery = useOrderLists(listQueryParams);
  const tarifItemQuery = useOrderListTarifs(tarifItemQueryParams);
  const tarifLoadItemQuery = useOrderListTarifItems(tarifLoadItemQueryParams);
  const deleteMutation = useDeleteOrderList();

  const tableData = React.useMemo(() => {
    const orders = listQuery.data?.data ?? [];
    const tarifHeaders = tarifItemQuery.data?.data ?? [];
    const tarifLoadItems = tarifLoadItemQuery.data?.data ?? [];

    if (!orders.length) {
      return orders;
    }

    return orders.map((order) => {
      const orderTarifs = tarifHeaders.filter((item) => item.doOrderListId === order.id);
      const orderTarifItems = tarifLoadItems.filter((item) => item.doOrderListId === order.id);

      return composeOrderListWithTarifs(order, orderTarifs.length ? orderTarifs : order.tarifs, orderTarifItems);
    });
  }, [listQuery.data?.data, tarifItemQuery.data?.data, tarifLoadItemQuery.data?.data]);

  const handleDelete = React.useCallback(async () => {
    if (!selectedItem) return;

    try {
      await deleteMutation.mutateAsync(selectedItem.id);
      toast.success('Order list berhasil dihapus');
      setDeleteOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus order list');
    }
  }, [selectedItem, deleteMutation]);

  const handleAdd = React.useCallback(() => {
    if (!slug || navigationLockRef.current) return;

    navigationLockRef.current = true;
    void router.push(`/dashboard/${slug}/administrasi/order-list/create`).finally(() => {
      navigationLockRef.current = false;
    });
  }, [slug, router]);

  const navigateTo = React.useCallback(
    (path: string) => {
      if (!slug || navigationLockRef.current) return;

      navigationLockRef.current = true;
      void router.push(path).finally(() => {
        navigationLockRef.current = false;
      });
    },
    [slug, router],
  );

  const handleDetail = React.useCallback(
    (item: OrderList) => {
      navigateTo(`/dashboard/${slug}/administrasi/order-list/detail/${item.id}`);
    },
    [navigateTo, slug],
  );

  const handleEdit = React.useCallback(
    (item: OrderList) => {
      navigateTo(`/dashboard/${slug}/administrasi/order-list/edit/${item.id}`);
    },
    [navigateTo, slug],
  );

  const handleDeleteClick = React.useCallback(
    (item: OrderList) => {
      setSelectedItem(item);
      setDeleteOpen(true);
    },
    [],
  );

  return (
    <DashboardLayout>
      <OrderListTable
        data={tableData}
        search={searchInput}
        page={page}
        perPage={perPage}
        totalData={listQuery.data?.meta.total ?? 0}
        isLoading={listQuery.isLoading || tarifItemQuery.isLoading || tarifLoadItemQuery.isLoading}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onAdd={handleAdd}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
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
