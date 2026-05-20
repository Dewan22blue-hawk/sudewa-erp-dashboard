import * as React from 'react';
import { useRouter } from 'next/router';
import { OrderListDetailView } from '@/components/features/order-list/OrderListDetailView';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrderListDetail, useOrderLists, useOrderListTarifs } from '@/hooks/useOrderList';

export default function OrderListDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : null;
  const detailQuery = useOrderListDetail(id);
  const orderListLookupQuery = useOrderLists({
    page: 1,
    perPage: 10,
    search: detailQuery.data?.code ?? '',
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: Boolean(detailQuery.data?.code),
  });
  const tarifItemQuery = useOrderListTarifs({
    page: 1,
    perPage: 100,
    do_orderlist_id: id ?? undefined,
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: Boolean(id),
  });
  const effectiveData = React.useMemo(() => {
    if (!detailQuery.data) return null;
    const listRecord = orderListLookupQuery.data?.data.find((item) => item.id === detailQuery.data?.id);

    return {
      ...detailQuery.data,
      vehicles: detailQuery.data.vehicles.length ? detailQuery.data.vehicles : (listRecord?.vehicles ?? []),
      tarifs: tarifItemQuery.data?.data?.length ? tarifItemQuery.data.data : detailQuery.data.tarifs,
    };
  }, [detailQuery.data, orderListLookupQuery.data?.data, tarifItemQuery.data?.data]);

  if (!router.isReady || detailQuery.isLoading || tarifItemQuery.isLoading || orderListLookupQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat detail order list...</div>
      </DashboardLayout>
    );
  }

  if (!id || !effectiveData) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data order list tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <OrderListDetailView
        data={effectiveData}
        onBack={() => router.push(`/dashboard/${slug}/administrasi/order-list`)}
      />
    </DashboardLayout>
  );
}
