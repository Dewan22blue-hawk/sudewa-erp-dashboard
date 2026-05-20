import * as React from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import type { Tarif } from '@/@types/tarif.types';
import type { SearchableSelectOption } from '@/components/features/vehicle-data/SearchableSelect';
import { OrderListForm, type OrderListFormItemValue, type OrderListFormValues } from '@/components/features/order-list/OrderListForm';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCustomers } from '@/hooks/useCustomer';
import {
  useCreateOrderListTarif,
  useDeleteOrderListTarif,
  useOrderListDetail,
  useOrderListTarifs,
  useUpdateOrderList,
  useUpdateOrderListTarif,
} from '@/hooks/useOrderList';
import { useTarifs } from '@/hooks/useTarif';
import { ApiValidationError } from '@/lib/api/response';

const isItemChangedTarif = (initialItem: any, currentItem: OrderListFormItemValue) =>
  Number(initialItem?.tarifId ?? 0) !== Number(currentItem.tarifId || 0);

export default function EditOrderListPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const id = router.isReady && typeof router.query.id === 'string' ? Number(router.query.id) : null;
  const { companyId } = useCompany();
  const [customerSearch, setCustomerSearch] = React.useState('');
  const [tarifSearch, setTarifSearch] = React.useState('');

  const detailQuery = useOrderListDetail(id);
  const tarifItemQuery = useOrderListTarifs({
    page: 1,
    perPage: 100,
    do_orderlist_id: id ?? undefined,
    order_by: 'created_at',
    order_sort: 'desc',
    enabled: Boolean(id),
  });
  const customerQuery = useCustomers({
    page: 1,
    perPage: 25,
    search: customerSearch,
    company_id: companyId ?? undefined,
    enabled: Boolean(companyId),
  });
  const tarifQuery = useTarifs({
    page: 1,
    perPage: 100,
    search: tarifSearch,
  });
  const updateOrderMutation = useUpdateOrderList();
  const updateTarifMutation = useUpdateOrderListTarif();
  const createTarifMutation = useCreateOrderListTarif();
  const deleteTarifMutation = useDeleteOrderListTarif();
  const effectiveOrderData = React.useMemo(() => {
    if (!detailQuery.data) return null;
    return {
      ...detailQuery.data,
      tarifs: tarifItemQuery.data?.data?.length ? tarifItemQuery.data.data : detailQuery.data.tarifs,
    };
  }, [detailQuery.data, tarifItemQuery.data?.data]);

  const tarifRecords = React.useMemo(() => {
    const map = new Map<number, Tarif>();
    (tarifQuery.data?.data ?? []).forEach((item) => {
      map.set(item.id, item);
    });
    (effectiveOrderData?.tarifs ?? []).forEach((item) => {
      if (!item.tarif) return;
      map.set(item.tarif.id, {
        id: item.tarif.id,
        uuid: item.tarif.uuid,
        customerId: Number(item.tarif.customerId ?? 0),
        loadingIn: item.tarif.loadingIn,
        loadingOut: item.tarif.loadingOut,
        distance: Number(item.tarif.distance ?? 0),
        ujTowing: item.tarif.ujTowing ?? null,
        ujCdd: item.tarif.ujCdd ?? null,
        ujFuso: item.tarif.ujFuso ?? null,
        invCdd: item.tarif.invCdd ?? null,
        invFuso: item.tarif.invFuso ?? null,
        customer: item.tarif.customer,
      });
    });
    return Array.from(map.values());
  }, [effectiveOrderData?.tarifs, tarifQuery.data?.data]);

  const customerOptions = React.useMemo<SearchableSelectOption[]>(
    () =>
      (customerQuery.data?.data ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
        subtitle: item.code,
      })),
    [customerQuery.data?.data],
  );
  const tarifOptions = React.useMemo<SearchableSelectOption[]>(
    () =>
      tarifRecords.map((item) => ({
        value: String(item.id),
        label: `${item.loadingIn || '-'} - ${item.loadingOut || '-'}`,
        subtitle: item.customer?.name,
      })),
    [tarifRecords],
  );

  const handleSubmit = async (values: OrderListFormValues) => {
    if (!effectiveOrderData || !id) return;

    try {
      const firstItem = values.items[0];
      await updateOrderMutation.mutateAsync({
        id,
        payload: {
          customer_id: Number(values.customerId),
          status: values.status,
          invoice_bill: Number(values.invoiceBill),
          bill_invoice: Number(values.invoiceBill),
          note: values.note,
          ppn: Number(values.ppn),
          uj_driver: Number(values.ujDriver),
          loading_in: firstItem?.loadingIn ?? '',
          loading_out: firstItem?.loadingOut ?? '',
        },
      });

      const initialTarifs = effectiveOrderData.tarifs ?? [];
      const currentExistingIds = new Set(values.items.filter((item) => item.id).map((item) => Number(item.id)));
      const removedItems = initialTarifs.filter((item) => item.id && !currentExistingIds.has(item.id));

      for (const removedItem of removedItems) {
        await deleteTarifMutation.mutateAsync({ id: removedItem.id, orderListId: id });
      }

      for (const item of values.items) {
        const initialItem = initialTarifs.find((entry) => entry.id === item.id);

        if (item.id && initialItem) {
          if (isItemChangedTarif(initialItem, item)) {
            await deleteTarifMutation.mutateAsync({ id: item.id, orderListId: id });
            await createTarifMutation.mutateAsync({
              do_orderlist_id: id,
              tarif_id: Number(item.tarifId),
              qty: Number(item.qty),
              load_content: item.loadContent,
              delivery_destination: item.deliveryDestination,
              vehicle_type: item.vehicleType,
            });
          } else {
            await updateTarifMutation.mutateAsync({
              id: item.id,
              payload: {
                qty: Number(item.qty),
                vehicle_type: item.vehicleType,
                load_content: item.loadContent,
                delivery_destination: item.deliveryDestination,
              },
            });
          }
        } else {
          await createTarifMutation.mutateAsync({
            do_orderlist_id: id,
            tarif_id: Number(item.tarifId),
            qty: Number(item.qty),
            load_content: item.loadContent,
            delivery_destination: item.deliveryDestination,
            vehicle_type: item.vehicleType,
          });
        }
      }

      toast.success('Order list berhasil diperbarui');
      await router.push(`/dashboard/${slug}/administrasi/order-list/detail/${id}`);
    } catch (error: any) {
      if (error instanceof ApiValidationError) {
        toast.error(error.message || 'Validasi update order list gagal');
        return;
      }
      toast.error(error.message || 'Gagal memperbarui order list');
    }
  };

  if (!router.isReady || detailQuery.isLoading || tarifItemQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Memuat data order list...</div>
      </DashboardLayout>
    );
  }

  if (!id || !effectiveOrderData) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-sm text-slate-500">Data order list tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <OrderListForm
        mode="edit"
        initialData={effectiveOrderData}
        customerOptions={customerOptions}
        tarifOptions={tarifOptions}
        tarifRecords={tarifRecords}
        customerLoading={customerQuery.isLoading}
        tarifLoading={tarifQuery.isLoading}
        onCustomerSearch={setCustomerSearch}
        onTarifSearch={setTarifSearch}
        onCancel={() => router.push(`/dashboard/${slug}/administrasi/order-list`)}
        onSubmit={handleSubmit}
        isSubmitting={
          updateOrderMutation.isPending ||
          updateTarifMutation.isPending ||
          createTarifMutation.isPending ||
          deleteTarifMutation.isPending
        }
      />
    </DashboardLayout>
  );
}
